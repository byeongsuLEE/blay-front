'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { menteeAPI } from '@/lib/api';
import { toast } from 'sonner';
import { ArrowLeft, BookOpen, Award, TrendingUp, MessageSquare } from 'lucide-react';

interface SubjectStat {
  subject: string;
  completionRate: number;
  totalAssignments: number;
  completedAssignments: number;
}

interface MyPageData {
  profileImage?: string;
  name: string;
  email: string;
  joinDate: string;
  subjectStats: SubjectStat[];
  totalStudyMinutes: number;
  streak: number;
  // 주간/월간 성취도
  weeklyAchievements?: {
    week: string; // "2024-W1"
    completionRate: number;
    tasksCompleted: number;
    tasksTotal: number;
  }[];
  monthlyAchievements?: {
    month: string; // "2024-01"
    completionRate: number;
    tasksCompleted: number;
    tasksTotal: number;
  }[];
}

export default function MyPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [myPageData, setMyPageData] = useState<MyPageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMyPageData();
  }, []);

  const loadMyPageData = async () => {
    try {
      setLoading(true);
      
      // 실제 구현에서는 API 호출
      // const data = await menteeAPI.getMyPage();
      
      // 샘플 데이터
      setMyPageData({
        name: user?.name || '사용자',
        email: user?.email || '',
        joinDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        subjectStats: [
          {
            subject: '국어',
            completionRate: 85,
            totalAssignments: 20,
            completedAssignments: 17,
          },
          {
            subject: '영어',
            completionRate: 70,
            totalAssignments: 20,
            completedAssignments: 14,
          },
          {
            subject: '수학',
            completionRate: 90,
            totalAssignments: 20,
            completedAssignments: 18,
          },
        ],
        totalStudyMinutes: 4560,
        streak: 12,
        weeklyAchievements: [
          { week: '2024-W1', completionRate: 80, tasksCompleted: 16, tasksTotal: 20 },
          { week: '2024-W2', completionRate: 85, tasksCompleted: 17, tasksTotal: 20 },
          { week: '2024-W3', completionRate: 90, tasksCompleted: 18, tasksTotal: 20 },
          { week: '2024-W4', completionRate: 75, tasksCompleted: 15, tasksTotal: 20 },
        ],
        monthlyAchievements: [
          { month: '2024-01', completionRate: 82, tasksCompleted: 82, tasksTotal: 100 },
          { month: '2024-02', completionRate: 88, tasksCompleted: 79, tasksTotal: 90 },
        ],
      });
    } catch (error) {
      console.error('[v0] 마이페이지 데이터 로드 에러:', error);
      toast.error('마이페이지 데이터를 불러올 수 없습니다');
    } finally {
      setLoading(false);
    }
  };

  const formatStudyTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}시간 ${mins}분`;
  };

  const handleConsultation = () => {
    // 상담받아보기 버튼 클릭 시 구글 폼으로 이동
    window.open('https://forms.gle/FchKdDcm23JdGHpK9', '_blank');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <p className="mt-2 text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-2xl mx-auto pb-24">
      {/* 헤더 */}
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        돌아가기
      </Button>

      {/* 프로필 섹션 */}
      <Card className="mb-6 p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-600 to-indigo-700 flex items-center justify-center text-white text-2xl font-bold">
            {myPageData?.name.charAt(0) || 'M'}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{myPageData?.name}</h1>
            <p className="text-gray-600">{myPageData?.email}</p>
            <p className="text-sm text-gray-500">
              가입일: {new Date(myPageData?.joinDate || '').toLocaleDateString('ko-KR')}
            </p>
          </div>
        </div>
      </Card>

      {/* 학습 통계 */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card className="p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-600">총 학습 시간</p>
              <p className="text-lg font-bold text-gray-900">
                {formatStudyTime(myPageData?.totalStudyMinutes || 0)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-xs text-gray-600">연속 학습</p>
              <p className="text-lg font-bold text-gray-900">
                {myPageData?.streak || 0}일
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* 과목별 달성률 */}
      <Card className="mb-6 p-6">
        <div className="flex items-center gap-2 mb-6">
          <Award className="w-5 h-5 text-indigo-600" />
          <h2 className="text-lg font-semibold text-gray-900">과목별 달성률</h2>
        </div>

        <div className="space-y-4">
          {myPageData?.subjectStats.map((stat) => (
            <div key={stat.subject}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-gray-900">{stat.subject}</h3>
                <Badge className="bg-indigo-100 text-indigo-700">
                  {stat.completionRate}%
                </Badge>
              </div>
              <Progress value={stat.completionRate} className="h-2" />
              <p className="text-xs text-gray-500 mt-1">
                {stat.completedAssignments} / {stat.totalAssignments}개 완료
              </p>
            </div>
          ))}
        </div>
      </Card>

      {/* 주간 성취도 */}
      {myPageData?.weeklyAchievements && myPageData.weeklyAchievements.length > 0 && (
        <Card className="mb-6 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">주간 성취도</h2>
          <div className="space-y-3">
            {myPageData.weeklyAchievements.map((week) => (
              <div key={week.week} className="border rounded-lg p-3 bg-blue-50">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium text-gray-900">{week.week}</p>
                  <Badge className="bg-blue-100 text-blue-700">
                    {week.completionRate}%
                  </Badge>
                </div>
                <Progress value={week.completionRate} className="h-2 mb-2" />
                <p className="text-xs text-gray-600">
                  완료: {week.tasksCompleted} / {week.tasksTotal}개
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* 월간 성취도 */}
      {myPageData?.monthlyAchievements && myPageData.monthlyAchievements.length > 0 && (
        <Card className="mb-6 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">월간 성취도</h2>
          <div className="space-y-3">
            {myPageData.monthlyAchievements.map((month) => (
              <div key={month.month} className="border rounded-lg p-3 bg-green-50">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium text-gray-900">{month.month}</p>
                  <Badge className="bg-green-100 text-green-700">
                    {month.completionRate}%
                  </Badge>
                </div>
                <Progress value={month.completionRate} className="h-2 mb-2" />
                <p className="text-xs text-gray-600">
                  완료: {month.tasksCompleted} / {month.tasksTotal}개
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* 상담받아보기 버튼 */}
      <div className="fixed bottom-4 right-4 left-4 sm:left-auto sm:w-auto">
        <Button
          onClick={handleConsultation}
          className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-3"
        >
          <MessageSquare className="w-5 h-5 mr-2" />
          상담받아보기
        </Button>
      </div>
    </div>
  );
}
