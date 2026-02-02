'use client';

import React from "react"

import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { useAuth } from './auth-context';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'mentor' | 'mentee';
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const router = useRouter();
  const { isAuthenticated, user, loading } = useAuth();
  const hasCheckedAuth = useRef(false);

  useEffect(() => {
    // 로딩 중일 때는 아무것도 하지 않음
    if (loading) {
      return;
    }

    // 이미 확인했으면 다시 확인하지 않음
    if (hasCheckedAuth.current) {
      return;
    }

    hasCheckedAuth.current = true;

    // 인증되지 않았으면 로그인 페이지로 이동
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    // 역할 확인
    if (requiredRole && user?.role !== requiredRole) {
      router.push(user?.role === 'mentor' ? '/mentor' : '/mentee');
    }
  }, [isAuthenticated, loading, requiredRole, user?.role, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-2 text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return null;
  }

  return <>{children}</>;
}
