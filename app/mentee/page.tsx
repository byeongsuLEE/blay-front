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
import { Plus, ChevronLeft, ChevronRight, Star, Calendar, Bell } from 'lucide-react';
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
  const quote = '명언'; // Declare quote variable
  const daysUntilGoal = 10; // Declare daysUntilGoal variable

  const dateString = format(currentDate, 'yyyy-MM-dd');

  // 플래너 데이터 로드 (초기 마운트시만)
  useEffect(() => {
    loadPlannerData();
  }, []);

  const loadPlannerData = async () => {
    try {
      setLoading(true);
      // 실제 API 호출 시뮬레이션을 위한 최소 딜레이
      await new Promise(resolve => setTimeout(resolve, 100));
      
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
            summary: '문법 이해가 좋습니다',
            content: '교과서 내용을 잘 이해하고 있으신 것 같습니다. 다만 작문에서 문장 구조를 더 신경써주세요.',
            createdAt: new Date().toISOString(),
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
      await menteeAPI.addTodo({
        date: dateString,
        title: newTodoTitle,
        subject: newTodoSubject,
      });
      toast.success('할 일이 추가되었습니다');
      setNewTodoTitle('');
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
      </div>

      {/* 통계 카드 */}
      <div className="bg-gradient-to-br from-pink-300 to-rose-400 rounded-2xl shadow-lg p-6 text-white">
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
