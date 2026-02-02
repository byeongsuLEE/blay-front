'use client';

import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

interface DateNavigatorProps {
  currentDate: Date;
  onPrevDay: () => void;
  onNextDay: () => void;
  onToday: () => void;
}

export function DateNavigator({
  currentDate,
  onPrevDay,
  onNextDay,
  onToday,
}: DateNavigatorProps) {
  const dateString = format(currentDate, 'yyyy.MM.dd (EEEE)', { locale: ko });

  return (
    <div className="flex items-center justify-between gap-2 p-4 bg-white border-b">
      <Button
        variant="outline"
        size="sm"
        onClick={onPrevDay}
        className="px-2 bg-transparent"
      >
        <ChevronLeft className="w-4 h-4" />
      </Button>

      <div className="text-center flex-1">
        <h2 className="text-lg font-semibold text-gray-900">{dateString}</h2>
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={onNextDay}
        className="px-2 bg-transparent"
      >
        <ChevronRight className="w-4 h-4" />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={onToday}
        className="text-sm"
      >
        오늘
      </Button>
    </div>
  );
}
