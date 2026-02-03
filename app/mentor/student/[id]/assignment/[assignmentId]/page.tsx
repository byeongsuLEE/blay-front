'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { mentorAPI } from '@/lib/api';
import { toast } from 'sonner';
import { ArrowLeft, Download, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

interface AssignmentDetail {
  id: string;
  title: string;
  subject: string;
  goalDescription: string;
  fileUrl?: string;
  fileType: 'pdf' | 'column';
  assignedDate: string;
  completed: boolean;
  completedDate?: string;
  proofImages?: string[];
}

interface Feedback {
  id: string;
  subject: string;
  summary?: string;
  content: string;
  createdAt: string;
}

interface Comment {
  id: string;
  authorRole: 'mentor' | 'mentee';
  authorName: string;
  content: string;
  createdAt: string;
}

interface Memo {
  id: string;
  content: string;
  createdAt: string;
  type: 'memo' | 'question';
}

export default function MentorAssignmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const studentId = params.id as string;
  const assignmentId = params.assignmentId as string;

  const [assignment, setAssignment] = useState<AssignmentDetail | null>(null);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);
  const [feedbackData, setFeedbackData] = useState({
    subject: '',
    summary: '',
    content: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [memos, setMemos] = useState<Memo[]>([]);
  const [newMemo, setNewMemo] = useState('');
  const [memoType, setMemoType] = useState<'memo' | 'question'>('memo');
  const [showMemoDialog, setShowMemoDialog] = useState(false);

  useEffect(() => {
    if (studentId && assignmentId) {
      loadAssignmentData();
    }
  }, [studentId, assignmentId]);

  const loadAssignmentData = async () => {
    try {
      setLoading(true);
      setLoading(false);
      
      // 실제 구현에서는 API 호출
      // const data = await mentorAPI.getAssignmentDetail(studentId, assignmentId);

      // 샘플 데이터
      setAssignment({
        id: assignmentId,
        title: '교과서 10-15쪽 읽기',
        subject: '국어',
        goalDescription: '현대 시의 표현 기법을 이해하고 감상하기',
        fileUrl: 'https://example.com/material.pdf',
        fileType: 'pdf',
        assignedDate: new Date(Date.now() - 7 * 86400000).toISOString(),
        completed: true,
        completedDate: new Date().toISOString(),
        proofImages: ['https://example.com/proof1.jpg'],
      });

      // 샘플 피드백
      setFeedbacks([
        {
          id: 'fb1',
          subject: '국어',
          summary: '시 감상이 우수합니다',
          content:
            '현대 시의 표현 기법을 잘 이해하고 있습니다. 특히 은유와 비유의 차이를 명확히 구분하는 모습이 좋습니다. 다음 과제에서는 시적 화자의 감정 변화를 더 세세하게 분석해보세요.',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
        },
      ]);

      // 샘플 코멘트
      setComments([
        {
          id: 'c1',
          authorRole: 'mentee',
          authorName: '김멘티',
          content: '이 부분이 이해가 안 가요',
          createdAt: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: 'c2',
          authorRole: 'mentor',
          authorName: '멘토',
          content: '이 부분은 책의 X페이지를 참고하세요',
          createdAt: new Date(Date.now() - 1800000).toISOString(),
        },
      ]);
    } catch (error) {
      toast.error('과제 정보를 불러올 수 없습니다');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleAddFeedback = async () => {
    if (!feedbackData.content.trim()) {
      toast.error('피드백 내용을 입력해주세요');
      return;
    }

    try {
      setIsSubmitting(true);
      await mentorAPI.createFeedback(studentId, {
        date: assignment?.assignedDate || format(new Date(), 'yyyy-MM-dd'),
        subject: feedbackData.subject || assignment?.subject || '국어',
        summary: feedbackData.summary || undefined,
        content: feedbackData.content,
      });
      toast.success('피드백이 저장되었습니다');
      setShowFeedbackDialog(false);
      setFeedbackData({ subject: '', summary: '', content: '' });
      loadAssignmentData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '피드백 저장에 실패했습니다');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) {
      toast.error('코멘트를 입력해주세요');
      return;
    }

    try {
      setIsSubmitting(true);
      // 실제 구현에서는 API 호출
      const newCommentObj: Comment = {
        id: `c${Date.now()}`,
        authorRole: 'mentor',
        authorName: '멘토',
        content: newComment,
        createdAt: new Date().toISOString(),
      };
      setComments([...comments, newCommentObj]);
      setNewComment('');
      toast.success('코멘트가 등록되었습니다');
    } catch (error) {
      toast.error('코멘트 등록에 실패했습니다');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddMemo = async () => {
    if (!newMemo.trim()) {
      toast.error(memoType === 'memo' ? '메모를 입력해주세요' : '질문을 입력해주세요');
      return;
    }

    try {
      setIsSubmitting(true);
      const newMemoObj: Memo = {
        id: `m${Date.now()}`,
        content: newMemo,
        createdAt: new Date().toISOString(),
        type: memoType,
      };
      setMemos([...memos, newMemoObj]);
      setNewMemo('');
      setShowMemoDialog(false);
      toast.success(memoType === 'memo' ? '메모가 저장되었습니다' : '질문이 등록되었습니다');
    } catch (error) {
      toast.error(memoType === 'memo' ? '메모 저장에 실패했습니다' : '질문 등록에 실패했습니다');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">로딩 중...</div>;
  }

  if (!assignment) {
    return <div className="flex items-center justify-center min-h-screen">과제를 찾을 수 없습니다</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
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
        <h1 className="text-3xl font-bold text-gray-900">{assignment.title}</h1>
        <p className="text-gray-600 mt-1">
          {format(new Date(assignment.assignedDate), 'yyyy년 M월 d일 EEEE', { locale: ko })}에 할당됨
        </p>
      </div>

      {/* 과제 정보 */}
      <Card className="mb-6 p-6 border-2 border-indigo-200">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Badge className="bg-indigo-100 text-indigo-700">{assignment.subject}</Badge>
            {assignment.completed && (
              <Badge className="bg-green-100 text-green-700">완료</Badge>
            )}
            <Badge className={assignment.fileType === 'pdf' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}>
              {assignment.fileType === 'pdf' ? 'PDF' : '칼럼'}
            </Badge>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-2">학습 목표</h3>
            <p className="text-gray-700">{assignment.goalDescription}</p>
          </div>

          {assignment.fileUrl && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">제공 자료</h3>
              <Button
                variant="outline"
                className="gap-2 bg-transparent"
                onClick={() => window.open(assignment.fileUrl, '_blank')}
              >
                <Download className="w-4 h-4" />
                자료 다운로드
              </Button>
            </div>
          )}

          {assignment.proofImages && assignment.proofImages.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">학생 제출 증명</h3>
              <div className="grid grid-cols-3 gap-4">
                {assignment.proofImages.map((image, idx) => (
                  <img
                    key={idx}
                    src={image || "/placeholder.svg"}
                    alt={`Proof ${idx + 1}`}
                    className="w-full h-32 object-cover rounded-lg border border-gray-200"
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* 피드백 섹션 */}
      <Card className="mb-6 p-6 border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-blue-900">멘토 피드백</h2>
          <Button
            onClick={() => setShowFeedbackDialog(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            피드백 추가
          </Button>
        </div>

        {feedbacks.length === 0 ? (
          <p className="text-center text-gray-500 py-6">아직 피드백이 없습니다</p>
        ) : (
          <div className="space-y-4">
            {feedbacks.map((feedback) => (
              <div key={feedback.id} className="bg-white p-4 rounded-lg border border-blue-100">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-blue-100 text-blue-700">{feedback.subject}</Badge>
                  {feedback.summary && (
                    <Badge className="bg-yellow-100 text-yellow-700">주요</Badge>
                  )}
                  <span className="text-xs text-gray-500 ml-auto">
                    {format(new Date(feedback.createdAt), 'M월 d일 HH:mm', { locale: ko })}
                  </span>
                </div>
                {feedback.summary && (
                  <p className="font-medium text-blue-600 mb-2">{feedback.summary}</p>
                )}
                <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {feedback.content}
                </p>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* 메모/질문 섹션 */}
      <Card className="mb-6 p-6 border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-purple-900">메모 & 질문</h2>
          <Button
            onClick={() => {
              setShowMemoDialog(true);
              setMemoType('memo');
            }}
            className="bg-purple-600 hover:bg-purple-700"
          >
            메모/질문 추가
          </Button>
        </div>

        {memos.length === 0 ? (
          <p className="text-center text-gray-500 py-6">메모 또는 질문이 없습니다</p>
        ) : (
          <div className="space-y-3">
            {memos.map((memo) => (
              <div
                key={memo.id}
                className={`p-4 rounded-lg border-l-4 ${
                  memo.type === 'memo'
                    ? 'bg-yellow-50 border-yellow-400'
                    : 'bg-blue-50 border-blue-400'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={`text-xs px-2 py-1 rounded font-medium ${
                      memo.type === 'memo'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {memo.type === 'memo' ? '📝 메모' : '❓ 질문'}
                  </span>
                  <span className="text-xs text-gray-500 ml-auto">
                    {format(new Date(memo.createdAt), 'M월 d일 HH:mm', { locale: ko })}
                  </span>
                </div>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {memo.content}
                </p>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* 코멘트 섹션 */}
      <Card className="p-6 border-2 border-green-200">
        <div className="flex items-center gap-2 mb-4">
          <MessageSquare className="w-5 h-5 text-green-600" />
          <h2 className="text-xl font-bold text-gray-900">소통</h2>
        </div>

        {/* 기존 코멘트 */}
        <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
          {comments.map((comment) => (
            <div key={comment.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-sm text-gray-900">{comment.authorName}</span>
                <span
                  className={`text-xs px-2 py-1 rounded ${
                    comment.authorRole === 'mentor'
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'bg-green-100 text-green-700'
                  }`}
                >
                  {comment.authorRole === 'mentor' ? '멘토' : '학생'}
                </span>
                <span className="text-xs text-gray-500 ml-auto">
                  {format(new Date(comment.createdAt), 'M월 d일 HH:mm', { locale: ko })}
                </span>
              </div>
              <p className="text-sm text-gray-700">{comment.content}</p>
            </div>
          ))}
        </div>

        {/* 새 코멘트 입력 */}
        <div className="flex gap-2">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
            placeholder="코멘트를 입력하세요..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
          <Button
            onClick={handleAddComment}
            disabled={isSubmitting || !newComment.trim()}
            className="bg-green-600 hover:bg-green-700"
          >
            등록
          </Button>
        </div>
      </Card>

      {/* 피드백 추가 다이얼로그 */}
      <Dialog open={showFeedbackDialog} onOpenChange={setShowFeedbackDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>피드백 작성</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="subject">과목</Label>
              <select
                id="subject"
                value={feedbackData.subject}
                onChange={(e) =>
                  setFeedbackData({ ...feedbackData, subject: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-md text-sm"
              >
                <option value="">선택</option>
                <option value="국어">국어</option>
                <option value="영어">영어</option>
                <option value="수학">수학</option>
              </select>
            </div>

            <div>
              <Label htmlFor="summary">주요 피드백 (선택사항)</Label>
              <Input
                id="summary"
                value={feedbackData.summary}
                onChange={(e) =>
                  setFeedbackData({ ...feedbackData, summary: e.target.value })
                }
                placeholder="한두 문장으로 요약"
              />
            </div>

            <div>
              <Label htmlFor="content">피드백 내용</Label>
              <textarea
                id="content"
                value={feedbackData.content}
                onChange={(e) =>
                  setFeedbackData({ ...feedbackData, content: e.target.value })
                }
                placeholder="상세한 피드백을 작성해주세요"
                className="w-full px-3 py-2 border rounded-md font-mono text-sm"
                rows={5}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowFeedbackDialog(false)}
              >
                취소
              </Button>
              <Button
                onClick={handleAddFeedback}
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isSubmitting ? '저장 중...' : '피드백 저장'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 메모/질문 추가 다이얼로그 */}
      <Dialog open={showMemoDialog} onOpenChange={setShowMemoDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{memoType === 'memo' ? '메모 추가' : '질문 등록'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* 메모 타입 선택 */}
            <div className="flex gap-2">
              <button
                onClick={() => setMemoType('memo')}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition ${
                  memoType === 'memo'
                    ? 'bg-yellow-100 text-yellow-700 border-2 border-yellow-400'
                    : 'bg-gray-100 text-gray-700 border-2 border-gray-200'
                }`}
              >
                📝 메모
              </button>
              <button
                onClick={() => setMemoType('question')}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition ${
                  memoType === 'question'
                    ? 'bg-blue-100 text-blue-700 border-2 border-blue-400'
                    : 'bg-gray-100 text-gray-700 border-2 border-gray-200'
                }`}
              >
                ❓ 질문
              </button>
            </div>

            <div>
              <Label htmlFor="memo-content">
                {memoType === 'memo' ? '메모 내용' : '질문 내용'}
              </Label>
              <textarea
                id="memo-content"
                value={newMemo}
                onChange={(e) => setNewMemo(e.target.value)}
                placeholder={memoType === 'memo' ? '메모를 작성하세요...' : '학생이 실수한 부분이나 의문점을 질문으로 작성하세요...'}
                className="w-full px-3 py-2 border rounded-md font-mono text-sm"
                rows={5}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowMemoDialog(false);
                  setNewMemo('');
                }}
              >
                취소
              </Button>
              <Button
                onClick={handleAddMemo}
                disabled={isSubmitting}
                className={memoType === 'memo' ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-blue-600 hover:bg-blue-700'}
              >
                {isSubmitting ? '저장 중...' : memoType === 'memo' ? '메모 저장' : '질문 등록'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
