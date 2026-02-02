'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, ChevronDown } from 'lucide-react';

export interface Feedback {
  id: string;
  subject: string;
  summary?: string;
  content: string;
  createdAt: string;
}

interface FeedbackSectionProps {
  feedbacks: Feedback[];
  isLoading?: boolean;
}

const subjectColors: Record<string, string> = {
  '국어': 'bg-red-100 text-red-700 border-red-300',
  '영어': 'bg-blue-100 text-blue-700 border-blue-300',
  '수학': 'bg-green-100 text-green-700 border-green-300',
};

export function FeedbackSection({ feedbacks, isLoading }: FeedbackSectionProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <Card className="p-4 bg-gray-50">
        <p className="text-sm text-gray-600">피드백을 불러오는 중...</p>
      </Card>
    );
  }

  if (!feedbacks || feedbacks.length === 0) {
    return (
      <Card className="p-4 bg-amber-50 border-amber-200">
        <div className="flex items-center gap-2 text-amber-700">
          <AlertCircle className="w-5 h-5" />
          <p className="text-sm">아직 피드백이 없습니다</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-gray-900 mb-4">과목별 피드백</h3>
      {feedbacks.map((feedback) => (
        <Card
          key={feedback.id}
          className={`border-2 overflow-hidden ${subjectColors[feedback.subject] || 'bg-gray-50 border-gray-300'}`}
        >
          <button
            onClick={() => setExpandedId(expandedId === feedback.id ? null : feedback.id)}
            className="w-full p-4 flex items-start justify-between hover:opacity-80 transition"
          >
            <div className="text-left flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-semibold">{feedback.subject}</span>
                {feedback.summary && (
                  <span className="text-xs px-2 py-1 bg-white rounded font-medium">
                    주요 피드백
                  </span>
                )}
              </div>
              {feedback.summary && (
                <p className="text-sm font-medium">{feedback.summary}</p>
              )}
            </div>
            <ChevronDown
              className={`w-5 h-5 ml-2 transition transform ${expandedId === feedback.id ? 'rotate-180' : ''}`}
            />
          </button>

          {expandedId === feedback.id && (
            <div className="px-4 pb-4 pt-2 border-t bg-white bg-opacity-50">
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{feedback.content}</p>
              <p className="text-xs text-gray-500 mt-3">
                {new Date(feedback.createdAt).toLocaleDateString('ko-KR')}
              </p>
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}
