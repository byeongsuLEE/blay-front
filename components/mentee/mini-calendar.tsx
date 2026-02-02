'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  getDaysInMonth,
  getDay,
  format,
  subMonths,
  addMonths,
} from 'date-fns';
import { ko } from 'date-fns/locale';

interface MiniCalendarProps {
  currentDate: Date;
  onDateSelect: (date: Date) => void;
}

export function MiniCalendar({ currentDate, onDateSelect }: MiniCalendarProps) {
  const [displayMonth, setDisplayMonth] = useState(new Date(currentDate.getFullYear(), currentDate.getMonth(), 1));

  const daysInMonth = getDaysInMonth(displayMonth);
  const firstDayOfMonth = getDay(displayMonth);
  const days = [];

  // 이전 달의 빈 칸
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }

  // 현재 달의 날짜
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const monthString = format(displayMonth, 'yyyy년 MMMM', { locale: ko });
  const isCurrentMonth = displayMonth.toDateString() === new Date().toDateString();

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setDisplayMonth(subMonths(displayMonth, 1))}
          className="px-2"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <h3 className="font-semibold text-sm">{monthString}</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setDisplayMonth(addMonths(displayMonth, 1))}
          className="px-2"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['일', '월', '화', '수', '목', '금', '토'].map((day) => (
          <div key={day} className="text-center text-xs font-semibold text-gray-600 py-1">
            {day}
          </div>
        ))}
      </div>

      {/* 날짜 그리드 */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => {
          if (day === null) {
            return <div key={`empty-${index}`}></div>;
          }

          const date = new Date(displayMonth.getFullYear(), displayMonth.getMonth(), day);
          const isToday = date.toDateString() === new Date().toDateString();
          const isSelected = date.toDateString() === currentDate.toDateString();

          return (
            <button
              key={day}
              onClick={() => onDateSelect(date)}
              className={`aspect-square rounded text-xs font-medium flex items-center justify-center transition ${isToday
                ? 'bg-indigo-600 text-white font-bold'
                : isSelected
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              {day}
            </button>
          );
        })}
      </div>
    </Card>
  );
}
