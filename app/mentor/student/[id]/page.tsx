'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { mentorAPI } from '@/lib/api';
import { toast } from 'sonner';
import { ArrowLeft, TrendingUp, CheckCircle2, FileText, MessageSquare, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

interface StudentDetail {
  id: string;
  name: string;
  email: string;
  joinDate: string;
  stats: {
    totalStudyMinutes: number;
    completionRate: number;
    totalAssignments: number;
    completedAssignments: number;
  };
}

interface Assignment {
  id: string;
  title: string;
  subject: string;
  createdDate: string;
  completed: boolean;
  completedDate?: string;
  proofSubmitted: boolean;
}

interface StudentFeedback {
  id: string;
  date: string;
  subject: string;
  summary?: string;
  content: string;
}

interface CreateAssignmentInput {
  title: string;
  subject: string;
  date: string;
  goalDescription: string;
  fileType: 'pdf' | 'column';
}

interface AssignmentTemplate {
  id: string;
  title: string;
  subject: string;
  goalDescription: string;
  fileType: 'pdf' | 'column';
  createdAt: string;
}

export default function MentorStudentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const studentId = params.id as string;

  const [studentDetail, setStudentDetail] = useState<StudentDetail | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [feedbacks, setFeedbacks] = useState<StudentFeedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [showAssignmentDialog, setShowAssignmentDialog] = useState(false);
  const [templates, setTemplates] = useState<AssignmentTemplate[]>([]);
  const [selectionMode, setSelectionMode] = useState<'template' | 'create'>('template');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [newAssignment, setNewAssignment] = useState<CreateAssignmentInput>({
    title: '',
    subject: '국어',
    date: format(new Date(), 'yyyy-MM-dd'),
    goalDescription: '',
    fileType: 'pdf',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadStudentData();
    loadTemplates();
  }, [studentId, selectedDate]);

  const loadTemplates = async () => {
    try {
      const data = await mentorAPI.getAssignmentTemplates();
      setTemplates(data || []);
    } catch (error) {
      console.log('[v0] Template loading error:', error);
    }
  };

  const loadStudentData = async () => {
    try {
      setLoading(true);

      // 샘플 데이터
      setStudentDetail({
        id: studentId,
        name: '김멘티',
        email: 'mentee1@example.com',
        joinDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        stats: {
          totalStudyMinutes: 4560,
          completionRate: 85,
          totalAssignments: 20,
          completedAssignments: 17,
        },
      });

      // 과제 목록
      setAssignments([
        {
          id: '1',
          title: '교과서 10-15쪽 읽기',
          subject: '국어',
          createdDate: new Date().toISOString(),
          completed: true,
          completedDate: new Date().toISOString(),
          proofSubmitted: true,
        },
        {
          id: '2',
          title: '영문법 Unit 3 복습',
          subject: '영어',
          createdDate: new Date().toISOString(),
          completed: false,
          proofSubmitted: false,
        },
      ]);

      // 피드백
      setFeedbacks([
        {
          id: 'f1',
          date: new Date().toISOString(),
          subject: '국어',
          summary: '문법 이해가 좋습니다',
          content: '교과서 내용을 잘 이해하고 있으신 것 같습니다. 다만 작문에서 문장 구조를 더 신경써주세요.',
        },
      ]);
    } catch (error) {
      toast.error('학생 정보를 불러올 수 없습니다');
    } finally {
      setLoading(false);
    }
  };

  const formatStudyTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}시간 ${mins}분`;
  };

  const handleCreateAssignment = async () => {
    try {
      setIsSubmitting(true);

      let assignmentToCreate = { ...newAssignment };

      // 템플릿 선택한 경우, 템플릿 정보 사용
      if (selectionMode === 'template' && selectedTemplateId) {
        const template = templates.find((t) => t.id === selectedTemplateId);
        if (!template) {
          toast.error('선택한 템플릿을 찾을 수 없습니다');
          return;
        }
        assignmentToCreate = {
          ...template,
          date: newAssignment.date,
        };
      } else {
        // 새로 작성한 경우, 검증
        if (!newAssignment.title.trim() || !newAssignment.goalDescription.trim()) {
          toast.error('필수 항목을 입력해주세요');
          return;
        }
      }

      await mentorAPI.createAssignment(studentId, assignmentToCreate);
      toast.success('과제가 할당되었습니다');
      setShowAssignmentDialog(false);
      setNewAssignment({
        title: '',
        subject: '국어',
        date: format(new Date(), 'yyyy-MM-dd'),
        goalDescription: '',
        fileType: 'pdf',
      });
      setSelectedTemplateId(null);
      setSelectionMode('template');
      loadStudentData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '과제 할당에 실패했습니다');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveAsTemplate = async () => {
    if (!newAssignment.title.trim() || !newAssignment.goalDescription.trim()) {
      toast.error('필수 항목을 입력해주세요');
      return;
    }

    try {
      setIsSubmitting(true);
      await mentorAPI.saveAssignmentTemplate({
        title: newAssignment.title,
        subject: newAssignment.subject,
        goalDescription: newAssignment.goalDescription,
        fileType: newAssignment.fileType,
      });
      toast.success('템플릿이 저장되었습니다');
      loadTemplates();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '템플릿 저장에 실패했습니다');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <p className="mt-2 text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* 상단 네비게이션 */}
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="ghost"
          onClick={() => router.back()}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          돌아가기
        </Button>
        <Button
          onClick={() => setShowAssignmentDialog(true)}
          className="bg-indigo-600 hover:bg-indigo-700"
        >
          <Plus className="w-4 h-4 mr-1" />
          과제 할당
        </Button>
      </div>

      {/* 학생 프로필 */}
      <Card className="mb-6 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-600 to-indigo-700 flex items-center justify-center text-white text-2xl font-bold">
              {studentDetail?.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{studentDetail?.name}</h1>
              <p className="text-gray-600">{studentDetail?.email}</p>
              <p className="text-sm text-gray-500">
                가입일: {new Date(studentDetail?.joinDate || '').toLocaleDateString('ko-KR')}
              </p>
            </div>
          </div>
        </div>

        {/* 통계 */}
        <div className="grid grid-cols-4 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-xs text-gray-600 mb-1">총 학습 시간</p>
            <p className="text-lg font-bold text-blue-700">
              {formatStudyTime(studentDetail?.stats.totalStudyMinutes || 0)}
            </p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <p className="text-xs text-gray-600 mb-1">완료율</p>
            <p className="text-lg font-bold text-green-700">
              {studentDetail?.stats.completionRate}%
            </p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <p className="text-xs text-gray-600 mb-1">과제</p>
            <p className="text-lg font-bold text-purple-700">
              {studentDetail?.stats.completedAssignments}/{studentDetail?.stats.totalAssignments}
            </p>
          </div>
          <div className="p-4 bg-orange-50 rounded-lg">
            <p className="text-xs text-gray-600 mb-1">증명 제출</p>
            <p className="text-lg font-bold text-orange-700">
              {assignments.filter((a) => a.proofSubmitted).length}/{assignments.length}
            </p>
          </div>
        </div>
      </Card>

      {/* 탭 */}
      <Tabs defaultValue="assignments" className="bg-white rounded-lg">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="assignments">과제 현황</TabsTrigger>
          <TabsTrigger value="feedback">피드백</TabsTrigger>
          <TabsTrigger value="comments">코멘트</TabsTrigger>
        </TabsList>

        {/* 과제 현황 탭 */}
        <TabsContent value="assignments" className="p-6">
          <div className="space-y-3">
            {assignments.length === 0 ? (
              <p className="text-center text-gray-500 py-8">과제가 없습니다</p>
            ) : (
              assignments.map((assignment) => (
                <Card key={assignment.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <button
                          onClick={() => router.push(`/mentor/student/${studentId}/assignment/${assignment.id}`)}
                          className="font-semibold text-indigo-600 hover:text-indigo-700 hover:underline cursor-pointer"
                        >
                          {assignment.title}
                        </button>
                        <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded font-medium">
                          {assignment.subject}
                        </span>
                        {assignment.completed && (
                          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded font-medium flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            완료
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
                        할당: {format(new Date(assignment.createdDate), 'M월 d일', { locale: ko })}
                      </p>
                      {assignment.completedDate && (
                        <p className="text-sm text-gray-600">
                          완료: {format(new Date(assignment.completedDate), 'M월 d일', { locale: ko })}
                        </p>
                      )}
                      {assignment.proofSubmitted && (
                        <p className="text-xs text-green-600 mt-2">
                          ✓ 증명 사진 제출됨
                        </p>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/mentor/student/${studentId}/assignment/${assignment.id}`)}
                    >
                      상세보기
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* 피드백 탭 */}
        <TabsContent value="feedback" className="p-6">
          <div className="space-y-3">
            {feedbacks.length === 0 ? (
              <p className="text-center text-gray-500 py-8">아직 작성된 피드백이 없습니다</p>
            ) : (
              feedbacks.map((feedback) => (
                <Card key={feedback.id} className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {feedback.subject}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {format(new Date(feedback.date), 'yyyy년 M월 d일', { locale: ko })}
                      </p>
                    </div>
                  </div>

                  {feedback.summary && (
                    <div className="mb-3 p-3 bg-amber-50 border-l-2 border-amber-500 rounded">
                      <p className="text-sm font-medium text-amber-900">
                        주요 피드백: {feedback.summary}
                      </p>
                    </div>
                  )}

                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {feedback.content}
                  </p>

                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3 bg-transparent"
                    onClick={() => router.push(`/mentor/feedback?studentId=${studentId}&date=${format(new Date(feedback.date), 'yyyy-MM-dd')}`)}
                  >
                    수정
                  </Button>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* 코멘트 탭 */}
        <TabsContent value="comments" className="p-6">
          <div className="space-y-3">
            <div className="p-4 text-center text-gray-500 bg-gray-50 rounded-lg">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p>학생에게 받은 코멘트가 표시됩니다</p>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* 과제 할당 다이얼로그 */}
      <Dialog open={showAssignmentDialog} onOpenChange={setShowAssignmentDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{studentDetail?.name}에게 과제 할당</DialogTitle>
          </DialogHeader>

          {/* 탭: 템플릿 선택 vs 새로 작성 */}
          <div className="flex gap-2 border-b pb-3">
            <button
              onClick={() => {
                setSelectionMode('template');
                setSelectedTemplateId(null);
              }}
              className={`px-4 py-2 rounded-t font-medium transition ${
                selectionMode === 'template'
                  ? 'bg-indigo-100 text-indigo-700 border-b-2 border-indigo-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              저장된 과제 ({templates.length})
            </button>
            <button
              onClick={() => setSelectionMode('create')}
              className={`px-4 py-2 rounded-t font-medium transition ${
                selectionMode === 'create'
                  ? 'bg-indigo-100 text-indigo-700 border-b-2 border-indigo-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              새로 작성
            </button>
          </div>

          {/* 템플릿 선택 모드 */}
          {selectionMode === 'template' && (
            <div className="space-y-3 py-4">
              {templates.length === 0 ? (
                <p className="text-center text-gray-500 py-8">저장된 템플릿이 없습니다</p>
              ) : (
                templates.map((template) => (
                  <label
                    key={template.id}
                    className={`block p-4 border-2 rounded-lg cursor-pointer transition ${
                      selectedTemplateId === template.id
                        ? 'border-indigo-600 bg-indigo-50'
                        : 'border-gray-200 hover:border-indigo-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        name="template"
                        value={template.id}
                        checked={selectedTemplateId === template.id}
                        onChange={(e) => setSelectedTemplateId(e.target.value)}
                        className="mt-1"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900">{template.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{template.goalDescription}</p>
                        <div className="flex gap-2 mt-2 text-xs">
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded">
                            {template.subject}
                          </span>
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded">
                            {template.fileType === 'pdf' ? 'PDF' : '칼럼'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </label>
                ))
              )}

              {/* 템플릿 선택 시 날짜만 입력 */}
              {selectedTemplateId && (
                <div className="mt-4 pt-4 border-t">
                  <Label htmlFor="date-template">할당 날짜</Label>
                  <Input
                    id="date-template"
                    type="date"
                    value={newAssignment.date}
                    onChange={(e) =>
                      setNewAssignment({ ...newAssignment, date: e.target.value })
                    }
                  />
                </div>
              )}
            </div>
          )}

          {/* 새로 작성 모드 */}
          {selectionMode === 'create' && (
            <div className="space-y-4 py-4">
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
            </div>
          )}

          {/* 액션 버튼 */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setShowAssignmentDialog(false)}
            >
              취소
            </Button>

            {selectionMode === 'create' && (
              <Button
                variant="outline"
                onClick={handleSaveAsTemplate}
                disabled={isSubmitting}
              >
                템플릿 저장
              </Button>
            )}

            <Button
              onClick={handleCreateAssignment}
              disabled={
                isSubmitting ||
                (selectionMode === 'template' && !selectedTemplateId) ||
                (selectionMode === 'create' &&
                  (!newAssignment.title.trim() || !newAssignment.goalDescription.trim()))
              }
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {isSubmitting ? '처리 중...' : '과제 할당'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
