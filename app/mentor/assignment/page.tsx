'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
  ChevronLeft,
  ChevronRight,
  Users,
  FileText,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { format, eachDayOfInterval, startOfMonth, endOfMonth } from 'date-fns';
import { ko } from 'date-fns/locale';

interface Student {
  id: string;
  name: string;
  email: string;
}

interface TaskTemplate {
  id: string;
  title: string;
  subject: string;
  goalDescription: string;
  fileType: 'pdf' | 'column';
}

interface Weakness {
  id: string;
  name: string;
  subject: string;
  materials: string[];
}

interface DraggedItem {
  type: 'task' | 'weakness';
  data: TaskTemplate | Weakness;
}

export default function AssignmentPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [draggedItem, setDraggedItem] = useState<DraggedItem | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [searchStudent, setSearchStudent] = useState('');

  // 샘플 데이터
  const students: Student[] = [
    { id: '1', name: '김멘티', email: 'mentee1@example.com' },
    { id: '2', name: '이멘티', email: 'mentee2@example.com' },
    { id: '3', name: '박민영', email: 'mentee3@example.com' },
    { id: '4', name: '최수진', email: 'mentee4@example.com' },
  ];

  const taskTemplates: TaskTemplate[] = [
    {
      id: 't1',
      title: '수학 기출 3회차 풀기',
      subject: '수학',
      goalDescription: '수학 기출 문제를 풀고 풀이 과정 정리',
      fileType: 'pdf',
    },
    {
      id: 't2',
      title: '미적분 기년 복습',
      subject: '수학',
      goalDescription: '미적분 기본 개념 복습',
      fileType: 'pdf',
    },
    {
      id: 't3',
      title: '영문법 동사 짝맞추기',
      subject: '영어',
      goalDescription: '영문법 중 동사 관련 문제 풀이',
      fileType: 'column',
    },
    {
      id: 't4',
      title: '영어 단어 Day 15 암기',
      subject: '영어',
      goalDescription: '영어 단어 15개 암기 및 테스트',
      fileType: 'pdf',
    },
    {
      id: 't5',
      title: '비문학 지문 분석',
      subject: '국어',
      goalDescription: '비문학 지문을 읽고 분석',
      fileType: 'pdf',
    },
    {
      id: 't6',
      title: '문학 작품 감상',
      subject: '국어',
      goalDescription: '현대 시 작품 분석 및 감상',
      fileType: 'column',
    },
  ];

  const weaknesses: Weakness[] = [
    {
      id: 'w1',
      name: '비문학 2지문',
      subject: '국어',
      materials: ['비문학_학습지.pdf', '비문학_분석법.pdf'],
    },
    {
      id: 'w2',
      name: '영문법 시제',
      subject: '영어',
      materials: ['영문법_시제.pdf', '실전문제.pdf'],
    },
    {
      id: 'w3',
      name: '미분 적분',
      subject: '수학',
      materials: ['미분적분_기초.pdf', '심화_문제.pdf'],
    },
  ];

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchStudent.toLowerCase()) ||
      s.email.toLowerCase().includes(searchStudent.toLowerCase())
  );

  const handleStudentSelect = (studentId: string) => {
    setSelectedStudents((prev) =>
      prev.includes(studentId) ? prev.filter((id) => id !== studentId) : [...prev, studentId]
    );
  };

  const handleDragStart = (item: DraggedItem) => {
    setDraggedItem(item);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDropOnDate = (dateStr: string) => {
    if (!draggedItem) {
      toast.error('드래그할 항목이 없습니다');
      return;
    }

    if (selectedStudents.length === 0) {
      toast.error('학생을 선택해주세요');
      return;
    }

    const studentNames = selectedStudents
      .map((id) => students.find((s) => s.id === id)?.name)
      .join(', ');

    const itemName = draggedItem.type === 'task' ? draggedItem.data.title : draggedItem.data.name;

    toast.success(
      `${studentNames}에게\n${itemName}\n${format(new Date(dateStr), 'M월 d일', { locale: ko })}에 할당했습니다`
    );

    setSelectedDate(dateStr);
    setDraggedItem(null);
  };

  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">월별 과제 등록</h1>
          <p className="text-gray-600">학생들에게 과제를 효율적으로 할당하세요</p>
        </div>

        {/* 3열 레이아웃 */}
        <div className="grid grid-cols-12 gap-4 h-[calc(100vh-200px)]">
          {/* 왼쪽: 학생 목록 */}
          <div className="col-span-3 bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col overflow-hidden">
            <div className="border-b p-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-indigo-600" />
                학생 선택
              </h2>
              <Input
                placeholder="학생 검색..."
                value={searchStudent}
                onChange={(e) => setSearchStudent(e.target.value)}
                className="text-sm"
              />
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {filteredStudents.length === 0 ? (
                <p className="text-center text-gray-500 py-4 text-sm">검색 결과 없음</p>
              ) : (
                filteredStudents.map((student) => (
                  <button
                    key={student.id}
                    onClick={() => handleStudentSelect(student.id)}
                    className={`w-full text-left p-3 rounded-lg border-2 transition ${
                      selectedStudents.includes(student.id)
                        ? 'bg-indigo-50 border-indigo-400'
                        : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <p className="font-medium text-gray-900 text-sm">{student.name}</p>
                    <p className="text-xs text-gray-500 mt-1">{student.email}</p>
                    {selectedStudents.includes(student.id) && (
                      <div className="mt-2">
                        <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                      </div>
                    )}
                  </button>
                ))
              )}
            </div>

            <div className="border-t p-3 bg-gray-50">
              <p className="text-xs text-gray-600">
                선택: {selectedStudents.length}명
              </p>
            </div>
          </div>

          {/* 중앙: 달력 */}
          <div className="col-span-6 bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col">
            {/* 달력 헤더 */}
            <div className="border-b p-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                {format(currentMonth, 'yyyy년 M월', { locale: ko })}
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
                  }
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-600" />
                </button>
                <button
                  onClick={() =>
                    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
                  }
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <ChevronRight className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>

            {/* 달력 그리드 */}
            <div className="flex-1 p-4 overflow-y-auto">
              {/* 요일 헤더 */}
              <div className="grid grid-cols-7 gap-2 mb-4">
                {['일', '월', '화', '수', '목', '금', '토'].map((day) => (
                  <div
                    key={day}
                    className="text-center font-semibold text-xs text-gray-600 py-2"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* 날짜 셀 */}
              <div className="grid grid-cols-7 gap-2 auto-rows-fr">
                {days.map((date) => {
                  const dateStr = format(date, 'yyyy-MM-dd');
                  const isSelected = selectedDate === dateStr;

                  return (
                    <div
                      key={dateStr}
                      onDragOver={handleDragOver}
                      onDrop={() => handleDropOnDate(dateStr)}
                      className={`aspect-square flex flex-col items-center justify-center rounded-lg border-2 border-dashed transition cursor-move min-h-20 p-2 ${
                        draggedItem && selectedStudents.length > 0
                          ? 'border-green-400 bg-green-50 hover:bg-green-100'
                          : 'border-gray-300 bg-gray-50'
                      } ${isSelected ? 'ring-2 ring-indigo-400' : ''}`}
                    >
                      <span className="text-lg font-semibold text-gray-900">
                        {format(date, 'd')}
                      </span>
                      <span className="text-xs text-gray-500 mt-1">
                        {format(date, 'EEE', { locale: ko })}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 오른쪽: 과제 & 보완점 목록 */}
          <div className="col-span-3 bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col overflow-hidden">
            <div className="border-b p-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">할당 항목</h2>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {/* 과제 템플릿 */}
                <div>
                  <p className="text-xs font-semibold text-gray-600 uppercase mb-2 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    과제 템플릿
                  </p>
                  <div className="space-y-2">
                    {taskTemplates.map((task) => (
                      <div
                        key={task.id}
                        draggable
                        onDragStart={() => handleDragStart({ type: 'task', data: task })}
                        className="p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200 cursor-move hover:shadow-md transition"
                      >
                        <p className="text-sm font-medium text-gray-900">{task.title}</p>
                        <div className="flex gap-2 mt-2">
                          <span className="text-xs px-2 py-1 bg-blue-200 text-blue-700 rounded">
                            {task.subject}
                          </span>
                          <span className="text-xs px-2 py-1 bg-gray-200 text-gray-700 rounded">
                            {task.fileType === 'pdf' ? 'PDF' : '칼럼'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 보완점 */}
                <div>
                  <p className="text-xs font-semibold text-gray-600 uppercase mb-2 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    보완점
                  </p>
                  <div className="space-y-2">
                    {weaknesses.map((weakness) => (
                      <div
                        key={weakness.id}
                        draggable
                        onDragStart={() => handleDragStart({ type: 'weakness', data: weakness })}
                        className="p-3 bg-gradient-to-r from-amber-50 to-amber-100 rounded-lg border border-amber-200 cursor-move hover:shadow-md transition"
                      >
                        <p className="text-sm font-medium text-gray-900">{weakness.name}</p>
                        <div className="mt-2 space-y-1">
                          <span className="text-xs px-2 py-1 bg-amber-200 text-amber-700 rounded block w-fit">
                            {weakness.subject}
                          </span>
                          <p className="text-xs text-gray-600 mt-1">
                            자료: {weakness.materials.length}개
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 상태 표시 */}
            <div className="border-t p-4 bg-gray-50 text-xs space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-indigo-600"></div>
                <span className="text-gray-700">선택 학생: {selectedStudents.length}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-600"></div>
                <span className="text-gray-700">
                  {draggedItem ? `${draggedItem.data.title || draggedItem.data.name} 준비됨` : '항목 드래그'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
