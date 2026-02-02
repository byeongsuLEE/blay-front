'use client';

import { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, addMonths, subMonths } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarViewSwitcherProps {
  currentDate: Date;
  onDateSelect: (date: Date) => void;
  viewMode: 'month' | 'week';
}

export function CalendarViewSwitcher({ currentDate, onDateSelect, viewMode }: CalendarViewSwitcherProps) {
  const [displayMonth, setDisplayMonth] = useState(currentDate);

  if (viewMode === 'month') {
    const firstDay = startOfMonth(displayMonth);
    const lastDay = endOfMonth(displayMonth);
    const days = eachDayOfInterval({ start: firstDay, end: lastDay });

    // 달력 시작 요일 맞추기
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const calendarDays: (Date | null)[] = [];
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      if (i < 7 * 6) {
        calendarDays.push(date);
      }
    }

    return (
      <Card className="p-4 border-2 border-pink-200">
        {/* 월 네비게이션 */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-lg text-gray-900">
            {format(displayMonth, 'yyyy년 M월', { locale: ko })}
          </h2>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDisplayMonth(subMonths(displayMonth, 1))}
              className="h-8 w-8 p-0 border-pink-200"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDisplayMonth(new Date())}
              className="h-8 px-2 text-xs border-pink-200"
            >
              오늘
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDisplayMonth(addMonths(displayMonth, 1))}
              className="h-8 w-8 p-0 border-pink-200"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* 요일 헤더 */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['일', '월', '화', '수', '목', '금', '토'].map((day) => (
            <div key={day} className="text-center text-xs font-semibold text-gray-600 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* 날짜 그리드 */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((date, i) => {
            const isCurrentMonth = date && isSameMonth(date, displayMonth);
            const isCurrentDay = date && isToday(date);
            const isSelected = date && format(date, 'yyyy-MM-dd') === format(currentDate, 'yyyy-MM-dd');

            return (
              <button
                key={i}
                onClick={() => date && onDateSelect(date)}
                className={`aspect-square rounded-lg text-xs font-medium transition ${
                  !isCurrentMonth
                    ? 'text-gray-300 bg-gray-50'
                    : isSelected
                      ? 'bg-pink-500 text-white'
                      : isCurrentDay
                        ? 'bg-pink-100 text-pink-700 border-2 border-pink-500'
                        : 'hover:bg-pink-50 text-gray-900'
                }`}
              >
                {date && format(date, 'd')}
              </button>
            );
          })}
        </div>
      </Card>
    );
  }

  // 주간 뷰
  return (
    <Card className="p-4 border-2 border-blue-200">
      <h2 className="font-bold text-lg text-gray-900 mb-4">주간 플래너</h2>
      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: 7 }).map((_, i) => {
          const date = new Date(currentDate);
          date.setDate(date.getDate() - currentDate.getDay() + i);
          const isToday_ = isToday(date);

          return (
            <button
              key={i}
              onClick={() => onDateSelect(date)}
              className={`p-3 rounded-lg border-2 transition text-center ${
                isToday_
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'bg-white border-blue-200 hover:bg-blue-50 text-gray-900'
              }`}
            >
              <p className="text-xs font-semibold">{format(date, 'EEE', { locale: ko })}</p>
              <p className="text-lg font-bold">{format(date, 'd')}</p>
            </button>
          );
        })}
      </div>
    </Card>
  );
}
