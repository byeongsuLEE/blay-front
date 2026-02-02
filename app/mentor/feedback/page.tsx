'use client';

import { Suspense } from 'react';
import { MentorFeedbackPageClient } from './page-client';

export default function MentorFeedbackPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">로딩 중...</div>}>
      <MentorFeedbackPageClient />
    </Suspense>
  );
}
