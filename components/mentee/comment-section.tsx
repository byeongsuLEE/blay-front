'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { MessageCircle } from 'lucide-react';
import { toast } from 'sonner';
import { menteeAPI } from '@/lib/api';

interface CommentSectionProps {
  date: string;
  onCommentAdded?: () => void;
}

export function CommentSection({ date, onCommentAdded }: CommentSectionProps) {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim()) {
      toast.error('코멘트를 입력해주세요');
      return;
    }

    try {
      setIsSubmitting(true);
      await menteeAPI.addComment({
        date,
        content: content.trim(),
      });
      toast.success('코멘트가 저장되었습니다');
      setContent('');
      onCommentAdded?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '코멘트 저장에 실패했습니다');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="p-4 mb-4 bg-blue-50 border-blue-200">
      <div className="flex items-center gap-2 mb-3">
        <MessageCircle className="w-5 h-5 text-blue-600" />
        <h3 className="font-semibold text-gray-900">멘토에게 질문/코멘트</h3>
      </div>
      <Textarea
        placeholder="멘토에게 질문하거나 오늘의 학습에 대해 간단한 코멘트를 남겨주세요"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="mb-3 min-h-24"
        disabled={isSubmitting}
      />
      <div className="flex justify-end">
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || !content.trim()}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isSubmitting ? '저장 중...' : '코멘트 저장'}
        </Button>
      </div>
    </Card>
  );
}
