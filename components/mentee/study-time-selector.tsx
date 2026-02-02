'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Clock } from 'lucide-react';

interface StudyTimeSelectorProps {
  currentMinutes: number;
  onSave: (minutes: number) => void;
}

export function StudyTimeSelector({ currentMinutes, onSave }: StudyTimeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hours, setHours] = useState(Math.floor(currentMinutes / 60));
  const [minutes, setMinutes] = useState(currentMinutes % 60);

  const handleSave = () => {
    const totalMinutes = hours * 60 + minutes;
    onSave(totalMinutes);
    setIsOpen(false);
  };

  const handleQuickAdd = (addMinutes: number) => {
    const newTotal = currentMinutes + addMinutes;
    onSave(newTotal);
  };

  const formatTime = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h === 0) return `${m}분`;
    return `${h}시간 ${m}분`;
  };

  if (!isOpen) {
    return (
      <div className="flex items-center gap-2">
        <Clock className="w-4 h-4 text-pink-500" />
        <span className="text-sm font-medium text-gray-700 min-w-fit">{formatTime(currentMinutes)}</span>
        <Button
          variant="outline"
          size="sm"
          className="h-7 px-2 text-xs border-pink-200 hover:bg-pink-50 bg-transparent"
          onClick={() => setIsOpen(true)}
        >
          수정
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-pink-50 border border-pink-200 rounded-lg p-3 space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs text-gray-600">시간</label>
          <Input
            type="number"
            min="0"
            max="23"
            value={hours}
            onChange={(e) => setHours(Math.max(0, parseInt(e.target.value) || 0))}
            className="h-8 text-center border-pink-200"
          />
        </div>
        <div>
          <label className="text-xs text-gray-600">분</label>
          <Input
            type="number"
            min="0"
            max="59"
            value={minutes}
            onChange={(e) => setMinutes(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
            className="h-8 text-center border-pink-200"
          />
        </div>
      </div>

      {/* 빠른 추가 버튼 */}
      <div className="grid grid-cols-4 gap-1">
        {[15, 30, 45, 60].map((mins) => (
          <Button
            key={mins}
            variant="outline"
            size="sm"
            className="h-7 text-xs border-pink-200 hover:bg-pink-100 bg-transparent"
            onClick={() => handleQuickAdd(mins)}
          >
            +{mins}분
          </Button>
        ))}
      </div>

      {/* 저장/취소 버튼 */}
      <div className="flex gap-2">
        <Button
          size="sm"
          className="flex-1 h-7 bg-pink-500 hover:bg-pink-600 text-white text-xs"
          onClick={handleSave}
        >
          저장
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="flex-1 h-7 text-xs border-pink-200 bg-transparent"
          onClick={() => setIsOpen(false)}
        >
          취소
        </Button>
      </div>
    </div>
  );
}
