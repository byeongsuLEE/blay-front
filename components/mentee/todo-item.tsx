'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { ChevronRight, Clock, Trash2, Play, Pause, RotateCcw } from 'lucide-react';

export interface TodoItemData {
  id: string;
  title: string;
  subject: string;
  completed: boolean;
  studyTimeMinutes?: number;
  isFixed: boolean; // 멘토가 고정한 할 일인지 여부
  assignmentId?: string;
}

interface TodoItemProps {
  todo: TodoItemData;
  onToggle: (id: string) => void;
  onUpdateTime: (id: string, minutes: number) => void;
  onDelete?: (id: string) => void;
  onViewDetails: (id: string) => void;
}

const subjectColors: Record<string, string> = {
  '국어': 'bg-red-100 text-red-700',
  '영어': 'bg-blue-100 text-blue-700',
  '수학': 'bg-green-100 text-green-700',
};

export function TodoItem({
  todo,
  onToggle,
  onUpdateTime,
  onDelete,
  onViewDetails,
}: TodoItemProps) {
  const [isEditingTime, setIsEditingTime] = useState(false);
  const [timeInput, setTimeInput] = useState(todo.studyTimeMinutes?.toString() || '0');
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [showTimer, setShowTimer] = useState(false);

  // 타이머 인터벌
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const handleTimeSubmit = () => {
    const minutes = parseInt(timeInput) || 0;
    onUpdateTime(todo.id, minutes);
    setIsEditingTime(false);
  };

  const formatTime = (minutes?: number) => {
    if (!minutes) return '시간 기록';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}분`;
    return `${hours}시간 ${mins}분`;
  };

  const formatTimerTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleTimerSave = () => {
    const totalMinutes = Math.floor(timerSeconds / 60) + (todo.studyTimeMinutes || 0);
    onUpdateTime(todo.id, totalMinutes);
    setTimerSeconds(0);
    setIsTimerRunning(false);
    setShowTimer(false);
  };

  const handleTimerReset = () => {
    setTimerSeconds(0);
    setIsTimerRunning(false);
  };

  return (
    <Card className="p-3 mb-2 border-l-4 border-pink-500 bg-white hover:shadow-md transition">
      <div className="flex items-center justify-between gap-3">
        {/* 좌측: 체크박스 + 할 일 정보 */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Checkbox
            checked={todo.completed}
            onCheckedChange={() => onToggle(todo.id)}
            disabled={todo.isFixed}
            className="mt-0"
          />

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3
                className={`font-medium text-sm truncate ${
                  todo.completed ? 'line-through text-gray-500' : 'text-gray-900'
                }`}
              >
                {todo.title}
              </h3>
              <span
                className={`px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap ${
                  subjectColors[todo.subject] || 'bg-gray-100 text-gray-700'
                }`}
              >
                {todo.subject}
              </span>
            </div>
          </div>
        </div>

        {/* 우측: 공부 시간 기록 (3개 버튼) */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {showTimer ? (
            <>
              <div className="flex items-center gap-1 bg-pink-50 px-2 py-1 rounded border border-pink-200">
                <div className="font-mono text-xs font-bold text-pink-600 min-w-fit">
                  {formatTimerTime(timerSeconds)}
                </div>
              </div>
              <Button
                size="sm"
                className="h-6 w-6 p-0 bg-pink-500 hover:bg-pink-600"
                onClick={() => setIsTimerRunning(!isTimerRunning)}
              >
                {isTimerRunning ? (
                  <Pause className="w-3 h-3 text-white" />
                ) : (
                  <Play className="w-3 h-3 text-white" />
                )}
              </Button>
              <Button
                size="sm"
                className="h-6 w-6 p-0 bg-pink-500 hover:bg-pink-600"
                onClick={handleTimerSave}
              >
                ✓
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-6 w-6 p-0 bg-transparent"
                onClick={() => {
                  setShowTimer(false);
                  setTimerSeconds(0);
                  setIsTimerRunning(false);
                }}
              >
                ✕
              </Button>
            </>
          ) : (
            <>
              <span className="text-xs font-bold text-gray-700 px-2 py-1 bg-pink-50 rounded min-w-fit">
                {formatTime(todo.studyTimeMinutes)}
              </span>
              <Button
                size="sm"
                className="h-6 w-6 p-0 bg-pink-500 hover:bg-pink-600 text-white"
                onClick={() => {
                  const newTime = (todo.studyTimeMinutes || 0) + 15;
                  onUpdateTime(todo.id, newTime);
                }}
              >
                +
              </Button>
              <Button
                size="sm"
                className="h-6 w-6 p-0 bg-blue-500 hover:bg-blue-600 text-white"
                onClick={() => setShowTimer(true)}
              >
                ⏱
              </Button>
              <Button
                size="sm"
                className="h-6 w-6 p-0 bg-gray-400 hover:bg-gray-500 text-white"
                onClick={() => {
                  const newTime = Math.max((todo.studyTimeMinutes || 0) - 15, 0);
                  onUpdateTime(todo.id, newTime);
                }}
              >
                -
              </Button>
            </>
          )}

          {/* 액션 버튼 */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewDetails(todo.id)}
            className="h-6 w-6 p-0 text-pink-600 hover:bg-pink-50 ml-1"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
          {!todo.isFixed && onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(todo.id)}
              className="h-6 w-6 p-0 text-gray-400 hover:text-red-600"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          )}
        </div>
      </div>


    </Card>
  );
}
