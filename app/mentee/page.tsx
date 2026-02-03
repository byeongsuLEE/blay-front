'use client';

import { useState, useEffect } from 'react';
import { addDays, subDays, format, isToday } from 'date-fns';
import { ko } from 'date-fns/locale';
import { TodoItem, TodoItemData } from '@/components/mentee/todo-item';
import { CommentSection } from '@/components/mentee/comment-section';
import { FeedbackSection, Feedback } from '@/components/mentee/feedback-section';
import { Timetable } from '@/components/mentee/timetable';
import { CalendarViewSwitcher } from '@/components/mentee/calendar-view-switcher';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { menteeAPI } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { Plus, ChevronLeft, ChevronRight, Star, Calendar, Bell, BookOpen, User } from 'lucide-react';
import { MiniCalendar } from '@/components/mentee/mini-calendar'; // Import MiniCalendar

export default function MenteePlannerPage() {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [todos, setTodos] = useState<TodoItemData[]>([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddingTodo, setIsAddingTodo] = useState(false);
  const [newTodoTitle, setNewTodoTitle] = useState('');
  const [newTodoSubject, setNewTodoSubject] = useState('국어');
  const [calendarViewMode, setCalendarViewMode] = useState<'month' | 'week'>('month');
  const [showNotification, setShowNotification] = useState(false);
  const [selectedRecurringDays, setSelectedRecurringDays] = useState<('월' | '화' | '수' | '목' | '금' | '토' | '일')[]>([]);
  const [selectedWeakness, setSelectedWeakness] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'planner' | 'mypage' | 'feedback'>('planner');
  const [feedbackFilter, setFeedbackFilter] = useState<string>('전체');
  const [selectedSubjectDropdown, setSelectedSubjectDropdown] = useState<string | null>(null);
  const [selectedFeedbackId, setSelectedFeedbackId] = useState<string | null>(null);
  const quote = '명언'; // Declare quote variable
  const daysUntilGoal = 10; // Declare daysUntilGoal variable

  // 샘플 보완점 데이터
  const weaknesses = [
    { id: 'w1', name: '비문학 2지문', subject: '국어', materials: ['비문학_학습지_1.pdf', '비문학_분석법.pdf'] },
    { id: 'w2', name: '영문법 시제', subject: '영어', materials: ['영문법_시제.pdf'] },
    { id: 'w3', name: '미분 적분', subject: '수학', materials: ['미분적분_기초.pdf', '미분적분_심화.pdf'] },
  ];

  const dateString = format(currentDate, 'yyyy-MM-dd');

  // 플래너 데이터 로드 (초기 마운트시만)
  useEffect(() => {
    loadPlannerData();
  }, []);

  const loadPlannerData = async () => {
    try {
      setLoading(true);
      setLoading(false);
      
      // 실제 구현에서는 멘토가 지정한 할 일과 멘티가 추가한 할 일을 모두 가져와야 합니다
      // 여기서는 샘플 데이터를 사용합니다
      setTodos([
        // 멘토 지정 과제
        {
          id: '1',
          title: '교과서 10-15쪽 읽기',
          subject: '국어',
          completed: false,
          studyTimeMinutes: 30,
          isFixed: true,
        },
        {
          id: '2',
          title: '영문법 Unit 3 복습',
          subject: '영어',
          completed: false,
          studyTimeMinutes: 25,
          isFixed: true,
        },
        {
          id: '3',
          title: '수학 연습문제 1-10번',
          subject: '수학',
          completed: true,
          studyTimeMinutes: 45,
          isFixed: true,
        },
        // 멘티가 추가한 할일
        {
          id: '4',
          title: '독서하기 - 어린왕자',
          subject: '국어',
          completed: false,
          studyTimeMinutes: 60,
          isFixed: false,
        },
        {
          id: '5',
          title: '영어 단어 외우기',
          subject: '영어',
          completed: true,
          studyTimeMinutes: 20,
          isFixed: false,
        },
        {
          id: '6',
          title: '한문 문장 해석',
          subject: '국어',
          completed: false,
          studyTimeMinutes: 35,
          isFixed: false,
        },
        {
          id: '7',
          title: '과학 실험 보고서 작성',
          subject: '수학',
          completed: false,
          studyTimeMinutes: 90,
          isFixed: false,
        },
      ]);

      // 피드백 로드
      try {
        // const feedbackData = await menteeAPI.getFeedback(dateString);
        // setFeedbacks(feedbackData);
        setFeedbacks([
          {
            id: 'f1',
            subject: '국어',
            learningGoal: '문법 이해',
            summary: '문법 이해가 우수합니다',
            content: '교과서 내용을 잘 이해하고 있으신 것 같습니다. 다만 작문에서 문장 구조를 더 신경써주세요.',
            createdAt: new Date().toISOString(),
          },
          {
            id: 'f2',
            subject: '영어',
            learningGoal: '리스닝',
            summary: '발음과 억양이 개선되었습니다',
            content: '리스닝 실력이 눈에 띄게 향상되었습니다. 문법은 더 꾸준한 연습이 필요합니다.',
            createdAt: new Date().toISOString(),
          },
          {
            id: 'f3',
            subject: '수학',
            learningGoal: '미적분',
            summary: '개념 이해도가 높습니다',
            content: '미분과 적분 개념을 잘 이해했습니다. 응용문제에 좀 더 집중해보세요.',
            createdAt: new Date().toISOString(),
          },
          {
            id: 'f4',
            subject: '국어',
            learningGoal: '독해',
            content: '비문학 읽기 속도가 많이 개선되었습니다. 어휘력을 더 넓혀보세요.',
            createdAt: new Date(Date.now() - 86400000).toISOString(),
          },
          {
            id: 'f5',
            subject: '영어',
            learningGoal: '문법',
            summary: '문법 실력이 향상되었습니다',
            content: '현재형과 과거형을 잘 구분하고 있습니다. 더 복잡한 시제에 도전해보세요.',
            createdAt: new Date(Date.now() - 86400000).toISOString(),
          },
          {
            id: 'f6',
            subject: '수학',
            learningGoal: '계산',
            content: '계산 능력이 빨라졌습니다. 실수를 줄이기 위해 검산 습관을 들여보세요.',
            createdAt: new Date(Date.now() - 86400000).toISOString(),
          },
          {
            id: 'f7',
            subject: '국어',
            learningGoal: '어휘',
            content: '한자 단어를 많이 배웠습니다. 일상 생활에서도 써보세요.',
            createdAt: new Date(Date.now() - 172800000).toISOString(),
          },
          {
            id: 'f8',
            subject: '영어',
            learningGoal: '회화',
            content: '회화 자신감이 생겼습니다. 더 많은 원어민과 대화해보세요.',
            createdAt: new Date(Date.now() - 172800000).toISOString(),
          },
          {
            id: 'f9',
            subject: '수학',
            learningGoal: '문제풀이',
            summary: '문제 풀이 방법이 체계적입니다',
            content: '단계별 풀이가 명확합니다. 더 빠른 풀이법을 익혀보세요.',
            createdAt: new Date(Date.now() - 259200000).toISOString(),
          },
          {
            id: 'f10',
            subject: '국어',
            learningGoal: '작문',
            content: '작문 실력이 많이 발전했습니다. 더 다양한 표현을 사용해보세요.',
            createdAt: new Date(Date.now() - 259200000).toISOString(),
          },
          {
            id: 'f11',
            subject: '플래너',
            learningGoal: '시간관리',
            summary: '시간 관리가 잘 되고 있습니다',
            content: '계획한 일정을 잘 따르고 있습니다. 이 페이스를 유지해주세요.',
            createdAt: new Date().toISOString(),
          },
          {
            id: 'f12',
            subject: '영어',
            learningGoal: '어휘',
            content: '단어 암기율이 높습니다. 꾸준한 복습으로 장기기억을 만들어보세요.',
            createdAt: new Date(Date.now() - 345600000).toISOString(),
          },
        ]);
      } catch (error) {
        console.log('피드백 로드 실패 (선택사항)');
      }
    } catch (error) {
      console.error('[v0] 데이터 로드 에러:', error);
      toast.error('데이터 로드에 실패했습니다');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTodo = async () => {
    if (!newTodoTitle.trim()) {
      toast.error('할 일 제목을 입력해주세요');
      return;
    }

    try {
      const selectedWeaknessData = weaknesses.find(w => w.id === selectedWeakness);
      const newTodo = {
        date: dateString,
        title: newTodoTitle,
        subject: newTodoSubject,
        recurringDays: selectedRecurringDays.length > 0 ? selectedRecurringDays : undefined,
        weaknessId: selectedWeakness || undefined,
        weaknessName: selectedWeaknessData?.name,
        learningMaterials: selectedWeaknessData?.materials,
      };

      await menteeAPI.addTodo(newTodo);
      toast.success(selectedRecurringDays.length > 0 ? `${selectedRecurringDays.join(', ')}에 반복되는 할 일이 추가되었습니다` : '할 일이 추가되었습니다');
      setNewTodoTitle('');
      setSelectedRecurringDays([]);
      setSelectedWeakness('');
      setIsAddingTodo(false);
      loadPlannerData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '할 일 추가에 실패했습니다');
    }
  };

  const handleToggleTodo = async (id: string) => {
    const todo = todos.find((t) => t.id === id);
    if (todo?.isFixed) {
      toast.error('멘토가 지정한 할 일은 변경할 수 없습니다');
      return;
    }

    try {
      await menteeAPI.updateTodoStatus(id, !todo?.completed);
      setTodos((prev) =>
        prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
      );
    } catch (error) {
      toast.error('상태 변경에 실패했습니다');
    }
  };

  const handleUpdateTime = async (id: string, minutes: number) => {
    try {
      await menteeAPI.recordStudyTime(id, minutes);
      setTodos((prev) =>
        prev.map((t) => (t.id === id ? { ...t, studyTimeMinutes: minutes } : t))
      );
      toast.success('공부 시간이 기록되었습니다');
    } catch (error) {
      toast.error('시간 기록에 실패했습니다');
    }
  };

  const handleViewDetails = (assignmentId: string) => {
    router.push(`/mentee/assignment/${assignmentId}`);
  };

  const totalStudyTime = todos.reduce((sum, t) => sum + (t.studyTimeMinutes || 0), 0);
  const completedCount = todos.filter((t) => t.completed).length;
  const completionRate = todos.length > 0 ? Math.round((completedCount / todos.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-orange-50">
      {/* 상단 네비게이션 */}
      <div className="sticky top-0 z-50 bg-white border-b-2 border-pink-200 shadow-md">
        <div className="max-w-full mx-auto px-4 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* 날짜 표시 */}
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-pink-700">
                {format(currentDate, 'M월 d일', { locale: ko })}
              </h1>
              <p className="text-sm text-pink-600">
                {isToday(currentDate) ? '오늘' : format(currentDate, 'EEEE', { locale: ko })}
              </p>
            </div>

            {/* 날짜 네비게이션 */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentDate((d) => subDays(d, 1))}
                className="border-pink-200 hover:bg-pink-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentDate(new Date())}
                className="border-pink-200 hover:bg-pink-50 px-3"
              >
                오늘
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentDate((d) => addDays(d, 1))}
                className="border-pink-200 hover:bg-pink-50"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            {/* 캘린더 뷰 전환 */}
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={calendarViewMode === 'month' ? 'default' : 'outline'}
                onClick={() => setCalendarViewMode('month')}
                className={calendarViewMode === 'month' ? 'bg-pink-500 hover:bg-pink-600' : ''}
              >
                <Calendar className="w-4 h-4 mr-1" />
                월간
              </Button>
              <Button
                size="sm"
                variant={calendarViewMode === 'week' ? 'default' : 'outline'}
                onClick={() => setCalendarViewMode('week')}
                className={calendarViewMode === 'week' ? 'bg-pink-500 hover:bg-pink-600' : ''}
              >
                주간
              </Button>
            </div>

            {/* 리마인더 알림 */}
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowNotification(!showNotification)}
              className="relative border-pink-200 hover:bg-pink-50"
            >
              <Bell className="w-4 h-4" />
              {showNotification && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* 알림 표시 */}
      {showNotification && (
        <div className="bg-yellow-50 border-b border-yellow-200 px-4 lg:px-8 py-3">
          <p className="text-sm text-yellow-800">
            오늘 할 일 {todos.length}개 중 {completedCount}개 완료했어요! 계속 화이팅! 💪
          </p>
        </div>
      )}

      {/* 메인 컨텐츠 */}
      <div className="max-w-full mx-auto px-4 lg:px-8 py-8">
        {/* 탭 네비게이션 */}
        <div className="flex gap-4 mb-8 border-b-2 border-pink-200">
          <button
            onClick={() => setActiveTab('planner')}
            className={`px-4 py-3 font-semibold flex items-center gap-2 transition border-b-4 ${
              activeTab === 'planner'
                ? 'border-pink-500 text-pink-600'
                : 'border-transparent text-gray-600 hover:text-pink-500'
            }`}
          >
            <Calendar className="w-5 h-5" />
            플래너
          </button>
          <button
            onClick={() => setActiveTab('mypage')}
            className={`px-4 py-3 font-semibold flex items-center gap-2 transition border-b-4 ${
              activeTab === 'mypage'
                ? 'border-pink-500 text-pink-600'
                : 'border-transparent text-gray-600 hover:text-pink-500'
            }`}
          >
            <User className="w-5 h-5" />
            마이페이지
          </button>
          <button
            onClick={() => setActiveTab('feedback')}
            className={`px-4 py-3 font-semibold flex items-center gap-2 transition border-b-4 ${
              activeTab === 'feedback'
                ? 'border-pink-500 text-pink-600'
                : 'border-transparent text-gray-600 hover:text-pink-500'
            }`}
          >
            <BookOpen className="w-5 h-5" />
            피드백
          </button>
        </div>

        {/* 플래너 탭 */}
        {activeTab === 'planner' && (
        <>
        {/* 헤더 - 날짜 및 네비게이션 */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-pink-700 mb-1">
              {format(currentDate, 'yyyy년 M월 d일', { locale: ko })}
            </h1>
            <p className="text-pink-600 font-medium">
              {isToday(currentDate) ? 'Today' : format(currentDate, 'EEEE', { locale: ko })}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentDate((d) => subDays(d, 1))}
              className="border-pink-200 text-pink-700 hover:bg-pink-100"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentDate(new Date())}
              className="border-pink-200 text-pink-700 hover:bg-pink-100 px-3"
            >
              오늘
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentDate((d) => addDays(d, 1))}
              className="border-pink-200 text-pink-700 hover:bg-pink-100"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* 중앙: 할 일 목록 + 타임테이블 */}
          <div className="lg:col-span-3 space-y-4">
            {/* 할 일 목록 카드 */}
            <Card className="border-2 border-pink-200 p-6 rounded-2xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-pink-700">오늘의 할 일</h2>
                <div className="flex gap-2">
                  <span className="text-sm font-medium text-gray-600">
                    {completedCount}/{todos.length} 완료
                  </span>
                  <Button
                    size="sm"
                    onClick={() => setIsAddingTodo(true)}
                    className="bg-pink-500 hover:bg-pink-600 text-white"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    추가
                  </Button>
                </div>
              </div>

              {loading ? (
                <p className="text-center text-gray-500 py-8">로딩 중...</p>
              ) : todos.length === 0 ? (
                <p className="text-center text-gray-500 py-8">할 일이 없습니다</p>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {todos.map((todo) => (
                    <TodoItem
                      key={todo.id}
                      todo={todo}
                      onToggle={handleToggleTodo}
                      onUpdateTime={handleUpdateTime}
                      onViewDetails={handleViewDetails}
                    />
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* 우측: 타임테이블 */}
          <div className="lg:col-span-2">
            {loading ? (
              <Card className="p-6 text-center text-gray-500">로딩 중...</Card>
            ) : (
              <Timetable todos={todos} selectedDate={currentDate} />
            )}
          </div>
        </div>

        {/* 캘린더 뷰 */}
        <div className="mt-8">
          <CalendarViewSwitcher
            currentDate={currentDate}
            onDateSelect={setCurrentDate}
            viewMode={calendarViewMode}
          />
        </div>

        {/* 하단: 피드백 섹션 */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 멘토 피드백 */}
          <Card className="p-6 rounded-2xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50">
            <h3 className="text-lg font-bold text-blue-900 mb-4">
              {format(currentDate, 'M월 d일', { locale: ko })} 멘토 피드백
            </h3>
            {loading ? (
              <p className="text-center text-gray-500 py-6">로딩 중...</p>
            ) : feedbacks.length === 0 ? (
              <p className="text-center text-gray-500 py-6">아직 피드백이 없습니다</p>
            ) : (
              <div className="space-y-4">
                <FeedbackSection feedbacks={feedbacks} isLoading={false} />
              </div>
            )}
          </Card>

          {/* 코멘트 섹션 */}
          <Card className="p-6 rounded-2xl border-2 border-green-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4">멘토와 소통</h3>
            <CommentSection date={dateString} onCommentAdded={loadPlannerData} />
          </Card>
        </div>

        {/* 통계 카드 */}
        <div className="mt-8 bg-gradient-to-br from-pink-300 to-rose-400 rounded-2xl shadow-lg p-6 text-white">
          <div className="space-y-4">
            <div>
              <p className="text-sm">오늘의 공부시간</p>
              <p className="text-3xl font-bold">{Math.floor(totalStudyTime / 60)}h {totalStudyTime % 60}m</p>
            </div>
            <div>
              <p className="text-sm">달성률</p>
              <p className="text-2xl font-bold">{completionRate}%</p>
            </div>
          </div>
        </div>
        </>
        )}

        {/* 마이페이지 탭 */}
        {activeTab === 'mypage' && (
          <div>
            <h2 className="text-3xl font-bold text-pink-700 mb-8">마이페이지</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6 rounded-2xl border-2 border-indigo-200">
                <h3 className="text-lg font-bold text-indigo-900 mb-4">학습 현황</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">총 학습시간</p>
                    <p className="text-3xl font-bold text-indigo-600">{Math.floor(totalStudyTime / 60)}h {totalStudyTime % 60}m</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">과제 완성률</p>
                    <p className="text-3xl font-bold text-indigo-600">{completionRate}%</p>
                  </div>
                </div>
              </Card>
              <Card className="p-6 rounded-2xl border-2 border-green-200">
                <h3 className="text-lg font-bold text-green-900 mb-4">개인 정보</h3>
                <div className="space-y-3 text-sm">
                  <p><span className="font-medium text-gray-700">이름:</span> <span className="text-gray-600">학생</span></p>
                  <p><span className="font-medium text-gray-700">이메일:</span> <span className="text-gray-600">student@example.com</span></p>
                  <p><span className="font-medium text-gray-700">가입일:</span> <span className="text-gray-600">2024년 1월</span></p>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* 피드백 탭 */}
        {activeTab === 'feedback' && (
          <div className="space-y-8">
            <h2 className="text-3xl font-bold text-pink-700">피드백</h2>

            {/* 오늘의 핵심 피드백 */}
            <Card className="p-6 rounded-2xl border-4 border-red-300 bg-gradient-to-br from-red-50 to-red-100 shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                <h3 className="text-xl font-bold text-red-900">오늘의 핵심 피드백</h3>
              </div>
              {feedbacks.length > 0 ? (
                <div className="bg-white p-4 rounded-lg">
                  <p className="text-sm font-semibold text-gray-600 mb-2">{feedbacks[0]?.subject || '국어'}</p>
                  <p className="text-lg font-bold text-gray-900 mb-3">{feedbacks[0]?.summary || '오늘 공부를 잘하셨습니다!'}</p>
                  <p className="text-sm text-gray-700 leading-relaxed">{feedbacks[0]?.content || '더욱 열심히 해주세요.'}</p>
                </div>
              ) : (
                <div className="bg-white p-4 rounded-lg text-center text-gray-500">
                  오늘은 아직 피드백이 없습니다
                </div>
              )}
            </Card>

            {/* 어제의 피드백 */}
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-gray-600" />
                어제의 피드백 ({feedbacks.filter(f => Math.abs(new Date(f.createdAt).getTime() - (Date.now() - 86400000)) < 86400000).length}개)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {feedbacks
                  .filter(f => Math.abs(new Date(f.createdAt).getTime() - (Date.now() - 86400000)) < 86400000)
                  .map((feedback, idx) => (
                    <button
                      key={idx}
                      onClick={() => router.push(`/mentee/assignment/${feedback.id}`)}
                      className={`p-3 rounded-lg border-2 hover:shadow-md transition text-left ${
                        feedback.subject === '국어'
                          ? 'border-red-300 bg-red-50 hover:border-red-500 hover:bg-red-100'
                          : feedback.subject === '영어'
                          ? 'border-blue-300 bg-blue-50 hover:border-blue-500 hover:bg-blue-100'
                          : feedback.subject === '수학'
                          ? 'border-green-300 bg-green-50 hover:border-green-500 hover:bg-green-100'
                          : 'border-purple-300 bg-purple-50 hover:border-purple-500 hover:bg-purple-100'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className="px-2 py-1 rounded text-xs font-bold text-white text-center"
                          style={
                            feedback.subject === '국어'
                              ? { backgroundColor: '#dc2626' }
                              : feedback.subject === '영어'
                              ? { backgroundColor: '#2563eb' }
                              : feedback.subject === '수학'
                              ? { backgroundColor: '#16a34a' }
                              : { backgroundColor: '#9333ea' }
                          }
                        >
                          {feedback.subject}
                        </span>
                      </div>
                      <p className="text-xs font-medium text-gray-900 line-clamp-2">
                        {feedback.summary || feedback.content.slice(0, 30)}
                      </p>
                    </button>
                  ))}
              </div>
            </div>

            {/* 피드백 필터 및 목록 */}
            <div>
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">피드백 보기</h3>
                
                {/* 주요 필터 버튼 */}
                <div className="flex gap-2 flex-wrap mb-4">
                  {['전체', '국어', '영어', '수학', '플래너', '학습 목표'].map((filter) => (
                    <button
                      key={filter}
                      onClick={() => {
                        setFeedbackFilter(filter);
                        setSelectedSubjectDropdown(null);
                        setSelectedFeedbackId(null);
                      }}
                      className={`px-4 py-2 rounded-full font-medium transition border-2 text-sm ${
                        feedbackFilter === filter
                          ? 'bg-pink-500 border-pink-500 text-white'
                          : 'bg-transparent border-gray-300 text-gray-700 hover:border-pink-400'
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>

                {/* 학습목표 필터 (과목 선택 시 표시) */}
                {feedbackFilter !== '전체' && feedbackFilter !== '학습 목표' && ['국어', '영어', '수학', '플래너'].includes(feedbackFilter) && (
                  <div className="bg-gray-50 p-4 rounded-lg border-2 border-gray-200 mb-4">
                    <p className="text-sm font-semibold text-gray-700 mb-3">{feedbackFilter} 학습목표 선택:</p>
                    <div className="flex gap-2 flex-wrap">
                      {Array.from(new Set(
                        feedbacks
                          .filter(f => f.subject === feedbackFilter)
                          .map(f => f.learningGoal)
                      )).map((goal) => (
                        <button
                          key={goal}
                          onClick={() => setSelectedFeedbackId(goal)}
                          className={`px-3 py-2 rounded-lg font-medium text-sm transition border-2 ${
                            selectedFeedbackId === goal
                              ? 'bg-pink-500 border-pink-500 text-white'
                              : 'bg-white border-gray-300 text-gray-700 hover:border-pink-400'
                          }`}
                        >
                          {goal}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* 피드백 카드 목록 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {feedbacks
                  .filter(f => {
                    if (feedbackFilter === '전체') {
                      return true;
                    } else if (feedbackFilter === '학습 목표') {
                      return f.summary;
                    } else if (['국어', '영어', '수학', '플래너'].includes(feedbackFilter)) {
                      if (selectedFeedbackId) {
                        return f.subject === feedbackFilter && f.learningGoal === selectedFeedbackId;
                      }
                      return f.subject === feedbackFilter;
                    }
                    return false;
                  })
                  .map((feedback, idx) => (
                    <button
                      key={idx}
                      onClick={() => router.push(`/mentee/assignment/${feedback.id}`)}
                      className={`p-5 rounded-lg border-2 hover:shadow-lg transition text-left ${
                        feedback.subject === '국어'
                          ? 'border-red-200 bg-red-50 hover:border-red-400 hover:bg-red-100'
                          : feedback.subject === '영어'
                          ? 'border-blue-200 bg-blue-50 hover:border-blue-400 hover:bg-blue-100'
                          : feedback.subject === '수학'
                          ? 'border-green-200 bg-green-50 hover:border-green-400 hover:bg-green-100'
                          : 'border-purple-200 bg-purple-50 hover:border-purple-400 hover:bg-purple-100'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <span
                          className="px-3 py-1 rounded-full text-xs font-bold text-white"
                          style={
                            feedback.subject === '국어'
                              ? { backgroundColor: '#dc2626' }
                              : feedback.subject === '영어'
                              ? { backgroundColor: '#2563eb' }
                              : feedback.subject === '수학'
                              ? { backgroundColor: '#16a34a' }
                              : { backgroundColor: '#9333ea' }
                          }
                        >
                          {feedback.subject}
                        </span>
                        {feedback.summary && (
                          <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded font-bold">
                            핵심
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-semibold text-gray-900 mb-2 line-clamp-2">
                        {feedback.summary || feedback.content.slice(0, 40) + '...'}
                      </p>
                      <p className="text-xs text-gray-600 line-clamp-3">
                        {feedback.content}
                      </p>
                      <div className="mt-3 flex items-center justify-between pt-3 border-t border-gray-300">
                        <span className="text-xs text-gray-500">
                          {format(new Date(feedback.createdAt), 'M월 d일', { locale: ko })}
                        </span>
                        <span className="text-xs font-medium text-pink-600">→ 과제 보기</span>
                      </div>
                    </button>
                  ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 할 일 추가 다이얼로그 */}
      <Dialog open={isAddingTodo} onOpenChange={setIsAddingTodo}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle className="text-pink-700">할 일 추가</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title" className="text-gray-700">
                제목
              </Label>
              <Input
                id="title"
                value={newTodoTitle}
                onChange={(e) => setNewTodoTitle(e.target.value)}
                placeholder="예: 수학 문제 풀이"
                className="border-pink-200"
              />
            </div>
            <div>
              <Label htmlFor="subject" className="text-gray-700">
                과목
              </Label>
              <select
                id="subject"
                value={newTodoSubject}
                onChange={(e) => setNewTodoSubject(e.target.value)}
                className="w-full px-3 py-2 border border-pink-200 rounded-md text-gray-900"
              >
                <option>국어</option>
                <option>영어</option>
                <option>수학</option>
              </select>
            </div>

            {/* 요일 반복 설정 */}
            <div>
              <Label className="text-gray-700 mb-2 block">반복 요일 (선택)</Label>
              <div className="grid grid-cols-4 gap-2">
                {['월', '화', '수', '목', '금', '토', '일'].map((day) => (
                  <button
                    key={day}
                    onClick={() => {
                      setSelectedRecurringDays((prev) =>
                        prev.includes(day as any)
                          ? prev.filter((d) => d !== day)
                          : [...prev, day as any]
                      );
                    }}
                    className={`py-2 px-3 rounded-md font-medium transition ${
                      selectedRecurringDays.includes(day as any)
                        ? 'bg-pink-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>

            {/* 보완점 선택 */}
            <div>
              <Label htmlFor="weakness" className="text-gray-700">
                보완점 선택 (선택)
              </Label>
              <select
                id="weakness"
                value={selectedWeakness}
                onChange={(e) => setSelectedWeakness(e.target.value)}
                className="w-full px-3 py-2 border border-pink-200 rounded-md text-gray-900"
              >
                <option value="">없음</option>
                {weaknesses.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} ({w.subject})
                  </option>
                ))}
              </select>
              {selectedWeakness && (
                <div className="mt-2 p-2 bg-pink-50 rounded text-sm text-gray-700">
                  <p className="font-medium">학습자료:</p>
                  <ul className="list-disc list-inside">
                    {weaknesses.find((w) => w.id === selectedWeakness)?.materials.map((m) => (
                      <li key={m}>{m}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsAddingTodo(false)}
                className="border-pink-200 text-pink-700 hover:bg-pink-50"
              >
                취소
              </Button>
              <Button onClick={handleAddTodo} className="bg-pink-500 hover:bg-pink-600 text-white">
                추가
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
