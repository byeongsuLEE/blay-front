'use client';

import React from "react"

import { ProtectedRoute } from '@/lib/protected-route';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { LogOut, Users, BookOpen, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

function MentorSidebar({ isOpen, onClose }: SidebarProps) {
  const router = useRouter();

  const navigationItems = [
    {
      label: '과제 등록',
      href: '/mentor/assignment',
      icon: Plus,
    },
    {
      label: '학생 관리',
      href: '/mentor',
      icon: Users,
    },
    {
      label: '피드백 작성',
      href: '/mentor/feedback',
      icon: BookOpen,
    },
    {
      label: '보완점 관리',
      href: '/mentor/weaknesses',
      icon: BookOpen,
    },
  ];

  return (
    <>
      {/* 모바일 오버레이 */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={onClose}
        ></div>
      )}

      {/* 사이드바 */}
      <div
        className={`fixed md:static left-0 top-0 h-screen w-64 bg-indigo-900 text-white p-4 z-30 transform transition-transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0`}
      >
        <h2 className="text-2xl font-bold mb-8 text-center">설스터디</h2>

        <nav className="space-y-2 mb-8">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.href}
                onClick={() => {
                  router.push(item.href);
                  onClose();
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-indigo-800 transition"
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </>
  );
}

export default function MentorLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('로그아웃되었습니다');
    router.push('/login');
  };

  return (
    <ProtectedRoute requiredRole="mentor">
      <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
        {/* 사이드바 */}
        <MentorSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* 메인 콘텐츠 */}
        <div className="flex-1 flex flex-col">
          {/* 헤더 */}
          <header className="bg-white border-b sticky top-0 z-10">
            <div className="px-4 py-4 flex items-center justify-between">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="md:hidden text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              <div className="flex-1 ml-4"></div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <h1 className="font-semibold text-gray-900">{user?.name || '사용자'}</h1>
                  <p className="text-xs text-gray-500">멘토</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold">
                  {user?.name.charAt(0) || 'M'}
                </div>
              </div>
            </div>
          </header>

          {/* 페이지 콘텐츠 */}
          <main className="flex-1 overflow-auto p-4">
            {children}
          </main>

          {/* 하단 로그아웃 버튼 */}
          <div className="border-t bg-white p-4">
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full text-red-600 hover:text-red-700 bg-transparent"
            >
              <LogOut className="w-4 h-4 mr-2" />
              로그아웃
            </Button>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
