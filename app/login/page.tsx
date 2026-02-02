'use client';

import React from "react"

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Mail, Lock, BookOpen } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isMentor, setIsMentor] = useState(false);

  // 이미 로그인되어 있으면 대시보드로 이동
  if (isAuthenticated && user) {
    router.push(user.role === 'mentor' ? '/mentor' : '/mentee');
    return null;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error('이메일과 비밀번호를 입력해주세요');
      return;
    }

    try {
      setLoading(true);
      const response = await login(email, password);
      toast.success('로그인 되었습니다');
      // 로그인 직후 user 객체 업데이트 지연 방지하기 위해 setTimeout 사용
      setTimeout(() => {
        router.push(isMentor ? '/mentor' : '/mentee');
      }, 100);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '로그인에 실패했습니다');
    } finally {
      setLoading(false);
    }
  };

  // 테스트 계정으로 자동 로그인
  const autoLogin = async (testEmail: string, testPassword: string, isMentorAccount: boolean) => {
    try {
      setLoading(true);
      setEmail(testEmail);
      setPassword(testPassword);
      setIsMentor(isMentorAccount);
      await login(testEmail, testPassword);
      toast.success('테스트 계정으로 로그인했습니다');
      setTimeout(() => {
        router.push(isMentorAccount ? '/mentor' : '/mentee');
      }, 100);
    } catch (error) {
      toast.error('테스트 로그인에 실패했습니다');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <BookOpen className="w-8 h-8 text-indigo-600" />
            <h1 className="text-3xl font-bold text-gray-900">설스터디</h1>
          </div>
          <p className="text-gray-600">멘토링 학습 플랫폼에 로그인하세요</p>
        </div>

        {/* 로그인 카드 */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>로그인</CardTitle>
            <CardDescription>계정 정보로 로그인해주세요</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {/* 이메일 입력 */}
              <div className="space-y-2">
                <Label htmlFor="email">이메일</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="example@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* 비밀번호 입력 */}
              <div className="space-y-2">
                <Label htmlFor="password">비밀번호</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* 로그인 버튼 */}
              <Button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700"
                disabled={loading}
              >
                {loading ? '로그인 중...' : '로그인'}
              </Button>
            </form>

            {/* 구분선 */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">테스트 계정</span>
              </div>
            </div>

            {/* 테스트 계정 버튼 */}
            <div className="space-y-2">
              <Button
                type="button"
                variant="outline"
                className="w-full bg-transparent"
                onClick={() => autoLogin('mentor@example.com', 'password123', true)}
                disabled={loading}
              >
                멘토 테스트 계정으로 로그인
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full bg-transparent"
                onClick={() => autoLogin('mentee1@example.com', 'password123', false)}
                disabled={loading}
              >
                멘티 테스트 계정으로 로그인
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 안내 텍스트 */}
        <div className="mt-6 p-4 bg-white rounded-lg border border-gray-200">
          <p className="text-xs text-gray-600">
            <strong>테스트 계정 정보:</strong>
            <br />
            멘토: mentor@example.com / password123
            <br />
            멘티1: mentee1@example.com / password123
            <br />
            멘티2: mentee2@example.com / password123
          </p>
        </div>
      </div>
    </div>
  );
}
