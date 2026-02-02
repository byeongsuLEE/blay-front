'use client';

import React from "react"

import { ProtectedRoute } from '@/lib/protected-route';
import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { LogOut, Home, User } from 'lucide-react';
import { toast } from 'sonner';

export default function MenteeLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    toast.success('로그아웃되었습니다');
    router.push('/login');
  };

  return (
    <ProtectedRoute requiredRole="mentee">
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* 헤더 */}
        <header className="bg-white border-b sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold">
                {user?.name.charAt(0) || 'M'}
              </div>
              <div>
                <h1 className="font-semibold text-gray-900">{user?.name || '사용자'}</h1>
                <p className="text-xs text-gray-500">멘티</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/mentee/mypage')}
              >
                <User className="w-4 h-4 mr-2" />
                마이페이지
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-red-600 hover:text-red-700"
              >
                <LogOut className="w-4 h-4 mr-2" />
                로그아웃
              </Button>
            </div>
          </div>
        </header>

        {/* 메인 콘텐츠 */}
        <main className="flex-1 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}
