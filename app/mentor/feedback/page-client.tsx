'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { mentorAPI } from '@/lib/api';
import { toast } from 'sonner';
import { ArrowLeft, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

interface StudentInfo {
  id: string;
  name: string;
  email: string;
}

interface FeedbackItem {
  id: string;
  subject: string;
  summary?: string;
  content: string;
  assignmentId?: string;
  createdAt: string;
}

export function MentorFeedbackPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const studentId = searchParams.get('studentId');
  const dateParam = searchParams.get('date');

  const [students, setStudents] = useState<StudentInfo[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<StudentInfo | null>(null);
  const [selectedDate, setSelectedDate] = useState(
    dateParam || format(new Date(), 'yyyy-MM-dd')
  );
  const [feedbackList, setFeedbackList] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewFeedbackDialog, setShowNewFeedbackDialog] = useState(false);
  const [newFeedback, setNewFeedback] = useState({
    subject: '국어',
    summary: '',
    content: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 학생 목록 로드
  useEffect(() => {
    loadStudents();
  }, []);

  // 선택된 학생/날짜가 변경되면 피드백 로드
  useEffect(() => {
    if (selectedStudent) {
      loadFeedbackList();
    }
  }, [selectedStudent, selectedDate]);

  const loadStudents = async () => {
    try {
      setLoading(true);
      // 샘플 데이터
      const sampleStudents = [
        { id: '1', name: '김멘티', email: 'mentee1@example.com' },
        { id: '2', name: '이멘티', email: 'mentee2@example.com' },
      ];
      setStudents(sampleStudents);

      // URL 파라미터에 학생 ID가 있으면 해당 학생 선택
      if (studentId) {
        const student = sampleStudents.find((s) => s.id === studentId);
        if (student) {
          setSelectedStudent(student);
        }
      } else {
        setSelectedStudent(sampleStudents[0]);
      }
    } catch (error) {
      toast.error('학생 목록을 불러올 수 없습니다');
    } finally {
      setLoading(false);
    }
  };

  const loadFeedbackList = async () => {
    if (!selectedStudent) return;

    try {
      setLoading(true);
      // 샘플 데이터
      setFeedbackList([
        {
          id: 'f1',
          subject: '국어',
          summary: '문법 이해가 좋습니다',
          content: '교과서 내용을 잘 이해하고 있으신 것 같습니다.',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'f2',
          subject: '수학',
          content: '문제 풀이 방법을 더 체계적으로 정리해야 합니다.',
          createdAt: new Date().toISOString(),
        },
      ]);
    } catch (error) {
      toast.error('피드백을 불러올 수 없습니다');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFeedback = async () => {
    if (!selectedStudent) return;

    if (!newFeedback.content.trim()) {
      toast.error('피드백 내용을 입력해주세요');
      return;
    }

    try {
      setIsSubmitting(true);
      await mentorAPI.createFeedback(selectedStudent.id, {
        date: selectedDate,
        subject: newFeedback.subject,
        summary: newFeedback.summary || undefined,
        content: newFeedback.content,
      });
      toast.success('피드백이 저장되었습니다');
      setShowNewFeedbackDialog(false);
      setNewFeedback({ subject: '국어', summary: '', content: '' });
      loadFeedbackList();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '피드백 저장에 실패했습니다');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* 헤더 */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          돌아가기
        </Button>
        <h1 className="text-3xl font-bold text-gray-900">피드백 작성</h1>
        <p className="text-gray-600">학생의 학습 진도를 평가하고 피드백을 작성하세요</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* 좌측: 학생 선택 */}
        <Card className="p-4 lg:col-span-1 h-fit">
          <h2 className="font-semibold text-gray-900 mb-4">학생 선택</h2>
          <div className="space-y-2">
            {students.map((student) => (
              <button
                key={student.id}
                onClick={() => setSelectedStudent(student)}
                className={`w-full p-3 rounded-lg text-left transition ${
                  selectedStudent?.id === student.id
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                }`}
              >
                <p className="font-medium">{student.name}</p>
                <p className="text-xs opacity-80">{student.email}</p>
              </button>
            ))}
          </div>
        </Card>

        {/* 우측: 피드백 작성 */}
        {selectedStudent && (
          <div className="lg:col-span-3 space-y-4">
            {/* 날짜 선택 */}
            <Card className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-900">
                  {format(new Date(selectedDate), 'yyyy년 M월 d일 EEEE', {
                    locale: ko,
                  })}
                </h2>
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-32"
                />
              </div>
            </Card>

            {/* 기존 피드백 */}
            {feedbackList.length > 0 && (
              <Card className="p-4">
                <h3 className="font-semibold text-gray-900 mb-4">
                  오늘의 피드백 ({feedbackList.length}개)
                </h3>
                <div className="space-y-3">
                  {feedbackList.map((feedback) => (
                    <div key={feedback.id} className="p-4 bg-gray-50 rounded-lg border">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className="bg-indigo-100 text-indigo-700">
                          {feedback.subject}
                        </Badge>
                        {feedback.summary && (
                          <Badge className="bg-amber-100 text-amber-700">
                            주요
                          </Badge>
                        )}
                      </div>
                      {feedback.summary && (
                        <p className="font-medium text-gray-900 mb-2">
                          {feedback.summary}
                        </p>
                      )}
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">
                        {feedback.content}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2 bg-transparent"
                        onClick={() => {
                          setNewFeedback({
                            subject: feedback.subject,
                            summary: feedback.summary || '',
                            content: feedback.content,
                          });
                          setShowNewFeedbackDialog(true);
                        }}
                      >
                        수정
                      </Button>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* 새 피드백 추가 */}
            <Button
              onClick={() => setShowNewFeedbackDialog(true)}
              className="w-full bg-indigo-600 hover:bg-indigo-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              새 피드백 추가
            </Button>
          </div>
        )}
      </div>

      {/* 새 피드백 다이얼로그 */}
      <Dialog open={showNewFeedbackDialog} onOpenChange={setShowNewFeedbackDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedStudent?.name}에게 피드백 작성 ({selectedDate})
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="subject">과목</Label>
              <select
                id="subject"
                value={newFeedback.subject}
                onChange={(e) =>
                  setNewFeedback({ ...newFeedback, subject: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-md"
              >
                <option>국어</option>
                <option>영어</option>
                <option>수학</option>
              </select>
            </div>

            <div>
              <Label htmlFor="summary">주요 피드백 (선택사항)</Label>
              <Input
                id="summary"
                value={newFeedback.summary}
                onChange={(e) =>
                  setNewFeedback({ ...newFeedback, summary: e.target.value })
                }
                placeholder="중요한 내용을 한두 문장으로 요약해주세요"
              />
            </div>

            <div>
              <Label htmlFor="content">피드백 내용</Label>
              <textarea
                id="content"
                value={newFeedback.content}
                onChange={(e) =>
                  setNewFeedback({ ...newFeedback, content: e.target.value })
                }
                placeholder="학생의 학습 상태와 개선 사항을 상세하게 작성해주세요"
                className="w-full px-3 py-2 border rounded-md font-mono text-sm"
                rows={8}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setShowNewFeedbackDialog(false)}
              >
                취소
              </Button>
              <Button
                onClick={handleCreateFeedback}
                disabled={isSubmitting}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                {isSubmitting ? '저장 중...' : '피드백 저장'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
