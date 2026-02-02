'use client';

import { useState, useEffect } from 'react';
import { mentorAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Plus, ChevronRight, TrendingUp, CheckCircle2, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

interface Mentee {
  id: string;
  name: string;
  email: string;
  completionRate: number;
  totalAssignments: number;
  completedAssignments: number;
  lastActivityDate?: string;
}

interface CreateAssignmentInput {
  title: string;
  subject: string;
  date: string;
  goalDescription: string;
  fileType: 'pdf' | 'column';
}

export default function MentorPage() {
  const router = useRouter();
  const [mentees, setMentees] = useState<Mentee[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMentee, setSelectedMentee] = useState<Mentee | null>(null);
  const [showAssignmentDialog, setShowAssignmentDialog] = useState(false);
  const [newAssignment, setNewAssignment] = useState<CreateAssignmentInput>({
    title: '',
    subject: '국어',
    date: format(new Date(), 'yyyy-MM-dd'),
    goalDescription: '',
    fileType: 'pdf',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadMentees();
  }, []);

  const loadMentees = async () => {
    try {
      setLoading(true);
      // 실제 API 호출 시뮬레이션을 위한 최소 딜레이
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // 샘플 데이터
      setMentees([
        {
          id: '1',
          name: '김멘티',
          email: 'mentee1@example.com',
          completionRate: 85,
          totalAssignments: 20,
          completedAssignments: 17,
          lastActivityDate: new Date().toISOString(),
        },
        {
          id: '2',
          name: '이멘티',
          email: 'mentee2@example.com',
          completionRate: 70,
          totalAssignments: 20,
          completedAssignments: 14,
          lastActivityDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        },
      ]);
    } catch (error) {
      console.error('[v0] 학생 목록 로드 에러:', error);
      toast.error('학생 목록을 불러올 수 없습니다');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAssignment = async () => {
    if (!selectedMentee) {
      toast.error('학생을 선택해주세요');
      return;
    }

    if (!newAssignment.title.trim() || !newAssignment.goalDescription.trim()) {
      toast.error('필수 항목을 입력해주세요');
      return;
    }

    try {
      setIsSubmitting(true);
      await mentorAPI.createAssignment(selectedMentee.id, newAssignment);
      toast.success('과제가 생성되었습니다');
      setShowAssignmentDialog(false);
      setNewAssignment({
        title: '',
        subject: '국어',
        date: format(new Date(), 'yyyy-MM-dd'),
        goalDescription: '',
        fileType: 'pdf',
      });
      // 데이터 새로고침
      loadMentees();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '과제 생성에 실패했습니다');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openAssignmentDialog = (mentee: Mentee) => {
    setSelectedMentee(mentee);
    setShowAssignmentDialog(true);
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* 페이지 헤더 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">담당 학생 관리</h1>
        <p className="text-gray-600">멘티의 학습 현황을 한눈에 확인하고 과제를 할당하세요</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <p className="mt-2 text-gray-600">로딩 중...</p>
          </div>
        </div>
      ) : mentees.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-gray-600">담당 학생이 없습니다</p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {mentees.map((mentee) => (
            <Card key={mentee.id} className="p-6 hover:shadow-lg transition">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{mentee.name}</h3>
                  <p className="text-sm text-gray-600">{mentee.email}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-600 to-indigo-700 flex items-center justify-center text-white font-bold">
                  {mentee.name.charAt(0)}
                </div>
              </div>

              {/* 통계 */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <p className="text-xs text-gray-600">완료율</p>
                  </div>
                  <p className="text-lg font-bold text-green-700">{mentee.completionRate}%</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                    <p className="text-xs text-gray-600">과제</p>
                  </div>
                  <p className="text-lg font-bold text-blue-700">
                    {mentee.completedAssignments}/{mentee.totalAssignments}
                  </p>
                </div>
              </div>

              {/* 마지막 활동 */}
              {mentee.lastActivityDate && (
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                  <Clock className="w-4 h-4" />
                  마지막 활동: {format(new Date(mentee.lastActivityDate), 'M월 d일 HH:mm', { locale: ko })}
                </div>
              )}

              {/* 액션 버튼 */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 bg-transparent"
                  onClick={() => router.push(`/mentor/student/${mentee.id}`)}
                >
                  상세보기
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
                <Button
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                  onClick={() => openAssignmentDialog(mentee)}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  과제할당
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* 과제 할당 다이얼로그 */}
      <Dialog open={showAssignmentDialog} onOpenChange={setShowAssignmentDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedMentee?.name}에게 과제 할당
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="title">과제명</Label>
              <Input
                id="title"
                value={newAssignment.title}
                onChange={(e) =>
                  setNewAssignment({ ...newAssignment, title: e.target.value })
                }
                placeholder="예: 교과서 10-15쪽 읽기"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="subject">과목</Label>
                <select
                  id="subject"
                  value={newAssignment.subject}
                  onChange={(e) =>
                    setNewAssignment({ ...newAssignment, subject: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-md text-sm"
                >
                  <option>국어</option>
                  <option>영어</option>
                  <option>수학</option>
                </select>
              </div>

              <div>
                <Label htmlFor="date">날짜</Label>
                <Input
                  id="date"
                  type="date"
                  value={newAssignment.date}
                  onChange={(e) =>
                    setNewAssignment({ ...newAssignment, date: e.target.value })
                  }
                />
              </div>
            </div>

            <div>
              <Label htmlFor="goal">학습 목표</Label>
              <textarea
                id="goal"
                value={newAssignment.goalDescription}
                onChange={(e) =>
                  setNewAssignment({
                    ...newAssignment,
                    goalDescription: e.target.value,
                  })
                }
                placeholder="학생이 달성해야 할 학습 목표를 설명해주세요"
                className="w-full px-3 py-2 border rounded-md text-sm"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="fileType">자료 형식</Label>
              <select
                id="fileType"
                value={newAssignment.fileType}
                onChange={(e) =>
                  setNewAssignment({
                    ...newAssignment,
                    fileType: e.target.value as 'pdf' | 'column',
                  })
                }
                className="w-full px-3 py-2 border rounded-md text-sm"
              >
                <option value="pdf">PDF 파일 업로드</option>
                <option value="column">설스터디 칼럼</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowAssignmentDialog(false)}
              >
                취소
              </Button>
              <Button
                onClick={handleCreateAssignment}
                disabled={isSubmitting}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                {isSubmitting ? '생성 중...' : '과제 생성'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
