'use client';

import { TodoItemData } from './todo-item';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

interface TimetableProps {
  todos: TodoItemData[];
  selectedDate: Date;
}

export function Timetable({ todos, selectedDate }: TimetableProps) {
  // 시간대별 공부 시간 집계
  const getHourlyStats = () => {
    const hours = Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      totalMinutes: 0,
      tasks: [] as string[],
    }));

    todos.forEach((todo, index) => {
      const startHour = (index * 3) % 24;
      const minutesPerHour = Math.ceil((todo.studyTimeMinutes || 0) / 2);
      
      for (let i = 0; i < 2; i++) {
        const hour = (startHour + i) % 24;
        hours[hour].totalMinutes += minutesPerHour;
        if (!hours[hour].tasks.includes(todo.subject)) {
          hours[hour].tasks.push(todo.subject);
        }
      }
    });

    return hours;
  };

  const hourlyStats = getHourlyStats();
  const totalStudyMinutes = todos.reduce((sum, t) => sum + (t.studyTimeMinutes || 0), 0);
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinutes = now.getMinutes();
  const currentTimeStr = `${String(currentHour).padStart(2, '0')}:${String(currentMinutes).padStart(2, '0')}`;

  return (
    <div className="space-y-4">
      {/* 상단 헤더 */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-1">TIME TABLE</h2>
          <p className="text-sm text-gray-600">
            {format(selectedDate, 'yyyy년 M월 d일 EEEE', { locale: ko })}
          </p>
        </div>
        <div className="flex gap-2">
          <span className="bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded">
            현재: {currentTimeStr}
          </span>
          <span className="bg-emerald-500 text-white text-xs font-bold px-2 py-1 rounded">
            총 {Math.floor(totalStudyMinutes / 60)}h {totalStudyMinutes % 60}m
          </span>
        </div>
      </div>

      {/* 가로 타임라인 */}
      <div className="bg-white rounded-lg border-2 border-pink-200 p-4 overflow-x-auto">
        <div className="relative h-24 flex items-center" style={{ minWidth: '1200px' }}>
          {/* 배경 그리드 */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.1 }}>
            {Array.from({ length: 25 }).map((_, i) => (
              <line
                key={i}
                x1={`${(i / 24) * 100}%`}
                y1="0"
                x2={`${(i / 24) * 100}%`}
                y2="100%"
                stroke="gray"
              />
            ))}
          </svg>

          {/* 공부 시간 바 */}
          {hourlyStats.map((stat) => {
            if (stat.totalMinutes === 0) return null;
            
            const startPercent = (stat.hour / 24) * 100;
            const widthPercent = ((stat.totalMinutes / 60) / 24) * 100;
            const subjectColors: Record<string, string> = {
              '국어': 'from-red-400 to-red-500',
              '영어': 'from-blue-400 to-blue-500',
              '수학': 'from-purple-400 to-purple-500',
              '기타': 'from-gray-400 to-gray-500',
            };

            const primarySubject = stat.tasks[0] || '기타';
            const colorClass = subjectColors[primarySubject] || subjectColors['기타'];

            return (
              <div
                key={stat.hour}
                className={`absolute top-1/2 transform -translate-y-1/2 bg-gradient-to-r ${colorClass} rounded-full flex items-center justify-center text-xs font-bold text-white cursor-pointer hover:shadow-lg transition-shadow`}
                style={{
                  left: `${startPercent}%`,
                  width: `${Math.max(widthPercent, 2)}%`,
                  height: '24px',
                  minWidth: '20px',
                }}
                title={`${stat.hour}시: ${stat.totalMinutes}분 (${stat.tasks.join(', ')})`}
              >
                {widthPercent > 3 && <span>{stat.totalMinutes}분</span>}
              </div>
            );
          })}

          {/* 현재 시간 포인터 */}
          {format(selectedDate, 'yyyy-MM-dd') === format(now, 'yyyy-MM-dd') && (
            <div
              className="absolute top-1/2 transform -translate-y-1/2 border-2 border-red-600 w-1 h-12 pointer-events-none"
              style={{
                left: `${((currentHour + currentMinutes / 60) / 24) * 100}%`,
              }}
            >
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2 bg-red-600 text-white text-xs px-2 py-0.5 rounded font-bold whitespace-nowrap">
                Now
              </div>
            </div>
          )}

          {/* 시간대 레이블 */}
          <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs font-bold text-gray-600 px-2">
            {Array.from({ length: 25 }).map((_, i) => (
              <span key={i} style={{ width: `${(1 / 24) * 100}%`, textAlign: 'center' }}>
                {String(i).padStart(2, '0')}h
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 과목별 범례 */}
      <div className="flex gap-3 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 rounded-full bg-gradient-to-r from-red-400 to-red-500" />
          <span className="text-gray-700">국어</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 rounded-full bg-gradient-to-r from-blue-400 to-blue-500" />
          <span className="text-gray-700">영어</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 rounded-full bg-gradient-to-r from-purple-400 to-purple-500" />
          <span className="text-gray-700">수학</span>
        </div>
      </div>
    </div>
  );
}
