// Spring Boot API 클라이언트
// 환경 변수에서 API 서버 주소를 설정하세요 (기본값: http://localhost:8080)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
// 테스트 모드 (백엔드 없이 테스트할 때 사용)
// NEXT_PUBLIC_TEST_MODE가 설정되지 않으면 자동으로 활성화 (개발 단계)
const TEST_MODE = process.env.NEXT_PUBLIC_TEST_MODE !== 'false';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: 'mentor' | 'mentee';
  };
}

export interface AuthContextType {
  token: string | null;
  user: LoginResponse['user'] | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

// 테스트 데이터
const TEST_DATA = {
  users: {
    'mentor@example.com': {
      id: 'mentor-001',
      email: 'mentor@example.com',
      name: '김멘토',
      role: 'mentor' as const,
    },
    'mentee1@example.com': {
      id: 'mentee-001',
      email: 'mentee1@example.com',
      name: '김멘티',
      role: 'mentee' as const,
    },
    'mentee2@example.com': {
      id: 'mentee-002',
      email: 'mentee2@example.com',
      name: '이멘티',
      role: 'mentee' as const,
    },
  },
};

/**
 * API 요청 헬퍼 함수
 */
async function fetchApi<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  // 테스트 모드: 실제 API 호출 전에 테스트 엔드포인트 확인
  if (TEST_MODE) {
    const body = options.body ? JSON.parse(options.body as string) : {};
    
    // 테스트 로그인
    if (endpoint === '/api/auth/login' && options.method === 'POST') {
      const { email, password } = body;
      const testUser = TEST_DATA.users[email as keyof typeof TEST_DATA.users];
      
      if (testUser && password === 'password123') {
        const token = `test-token-${email}`;
        return {
          token,
          user: testUser,
        } as T;
      }
      throw new Error('이메일 또는 비밀번호가 잘못되었습니다');
    }
    
    // 테스트 현재 사용자 정보 조회
    if (endpoint === '/api/auth/me') {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (token) {
        const email = token.replace('test-token-', '');
        const testUser = TEST_DATA.users[email as keyof typeof TEST_DATA.users];
        if (testUser) {
          return testUser as T;
        }
      }
      throw new Error('인증 실패');
    }
  }

  const url = `${API_BASE_URL}${endpoint}`;
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      error: response.statusText,
    }));
    throw new Error(error.error || error.message || 'API 요청 실패');
  }

  return response.json();
}

/**
 * 인증 관련 API
 */
export const authAPI = {
  // 로그인
  login: (data: LoginRequest) =>
    fetchApi<LoginResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // 로그아웃
  logout: () =>
    fetchApi('/api/auth/logout', {
      method: 'POST',
    }),

  // 현재 사용자 정보
  getCurrentUser: () =>
    fetchApi<LoginResponse['user']>('/api/auth/me', {
      method: 'GET',
    }),

  // 토큰 검증
  validateToken: () =>
    fetchApi<{ valid: boolean }>('/api/auth/validate', {
      method: 'GET',
    }),
};

/**
 * 멘티 관련 API
 */
export const menteeAPI = {
  // 플래너 조회
  getPlannerByDate: (dateString: string) =>
    fetchApi(`/api/mentee/planner?date=${dateString}`, {
      method: 'GET',
    }),

  // 할 일 추가
  addTodo: (data: {
    date: string;
    title: string;
    subject: string;
    timeSpent?: number;
  }) =>
    fetchApi('/api/mentee/todos', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // 할 일 완료 표시
  updateTodoStatus: (todoId: string, completed: boolean) =>
    fetchApi(`/api/mentee/todos/${todoId}`, {
      method: 'PATCH',
      body: JSON.stringify({ completed }),
    }),

  // 할 일 시간 기록
  recordStudyTime: (todoId: string, minutes: number) =>
    fetchApi(`/api/mentee/todos/${todoId}/study-time`, {
      method: 'PATCH',
      body: JSON.stringify({ minutes }),
    }),

  // 과제 상세 조회
  getAssignmentDetail: (assignmentId: string) =>
    fetchApi(`/api/mentee/assignments/${assignmentId}`, {
      method: 'GET',
    }),

  // 과제 파일 다운로드 URL 조회
  getAssignmentFileUrl: (assignmentId: string) =>
    fetchApi<{ downloadUrl: string }>(`/api/mentee/assignments/${assignmentId}/file`, {
      method: 'GET',
    }),

  // 과제 인증 사진 업로드
  uploadAssignmentProof: (assignmentId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    return fetch(`${API_BASE_URL}/api/mentee/assignments/${assignmentId}/proof`, {
      method: 'POST',
      body: formData,
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    }).then(res => {
      if (!res.ok) throw new Error('업로드 실패');
      return res.json();
    });
  },

  // 피드백 조회
  getFeedback: (dateString: string) =>
    fetchApi(`/api/mentee/feedback?date=${dateString}`, {
      method: 'GET',
    }),

  // 코멘트 작성
  addComment: (data: { date: string; content: string }) =>
    fetchApi('/api/mentee/comments', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // 마이페이지 정보
  getMyPage: () =>
    fetchApi('/api/mentee/mypage', {
      method: 'GET',
    }),

  // 과목별 달성률
  getSubjectStats: () =>
    fetchApi('/api/mentee/stats/subjects', {
      method: 'GET',
    }),

  // 월간 학습 현황
  getMonthlyStats: (yearMonth: string) =>
    fetchApi(`/api/mentee/stats/monthly?month=${yearMonth}`, {
      method: 'GET',
    }),
};

/**
 * 멘토 관련 API
 */
export const mentorAPI = {
  // 담당 학생 목록
  getMentees: () =>
    fetchApi('/api/mentor/mentees', {
      method: 'GET',
    }),

  // 특정 학생 조회
  getMenteeDetail: (menteeId: string) =>
    fetchApi(`/api/mentor/mentees/${menteeId}`, {
      method: 'GET',
    }),

  // 학생의 과제 목록
  getMenteeAssignments: (menteeId: string, dateString?: string) => {
    const url = dateString 
      ? `/api/mentor/mentees/${menteeId}/assignments?date=${dateString}`
      : `/api/mentor/mentees/${menteeId}/assignments`;
    return fetchApi(url, { method: 'GET' });
  },

  // 학생의 플래너 조회
  getMenteePlanner: (menteeId: string, dateString: string) =>
    fetchApi(`/api/mentor/mentees/${menteeId}/planner?date=${dateString}`, {
      method: 'GET',
    }),

  // 할 일 생성
  createAssignment: (menteeId: string, data: {
    title: string;
    subject: string;
    date: string;
    goalDescription: string;
    fileUrl?: string;
    fileType: 'pdf' | 'column';
  }) =>
    fetchApi(`/api/mentor/mentees/${menteeId}/assignments`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // 할 일 업로드 (PDF 파일)
  uploadAssignmentFile: (menteeId: string, assignmentId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    return fetch(`${API_BASE_URL}/api/mentor/mentees/${menteeId}/assignments/${assignmentId}/file`, {
      method: 'POST',
      body: formData,
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    }).then(res => {
      if (!res.ok) throw new Error('파일 업로드 실패');
      return res.json();
    });
  },

  // 피드백 작성
  createFeedback: (menteeId: string, data: {
    date: string;
    assignmentId?: string;
    subject: string;
    summary?: string;
    content: string;
  }) =>
    fetchApi(`/api/mentor/mentees/${menteeId}/feedback`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // 피드백 수정
  updateFeedback: (menteeId: string, feedbackId: string, data: {
    subject: string;
    summary?: string;
    content: string;
  }) =>
    fetchApi(`/api/mentor/mentees/${menteeId}/feedback/${feedbackId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  // 과제 템플릿 목록 조회
  getAssignmentTemplates: () =>
    fetchApi('/api/mentor/assignment-templates', {
      method: 'GET',
    }),

  // 과제 템플릿 저장
  saveAssignmentTemplate: (data: {
    title: string;
    subject: string;
    goalDescription: string;
    fileType: 'pdf' | 'column';
  }) =>
    fetchApi('/api/mentor/assignment-templates', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // 과제 템플릿 삭제
  deleteAssignmentTemplate: (templateId: string) =>
    fetchApi(`/api/mentor/assignment-templates/${templateId}`, {
      method: 'DELETE',
    }),

  // 피드백 조회
  getFeedback: (menteeId: string, dateString?: string) => {
    const url = dateString
      ? `/api/mentor/mentees/${menteeId}/feedback?date=${dateString}`
      : `/api/mentor/mentees/${menteeId}/feedback`;
    return fetchApi(url, { method: 'GET' });
  },

  // 학생별 통계
  getMenteeStats: (menteeId: string) =>
    fetchApi(`/api/mentor/mentees/${menteeId}/stats`, {
      method: 'GET',
    }),
};

/**
 * 알림 관련 API
 */
export const notificationAPI = {
  // 알림 목록
  getNotifications: () =>
    fetchApi('/api/notifications', {
      method: 'GET',
    }),

  // 알림 읽음 표시
  markAsRead: (notificationId: string) =>
    fetchApi(`/api/notifications/${notificationId}/read`, {
      method: 'PATCH',
    }),

  // 모든 알림 읽음
  markAllAsRead: () =>
    fetchApi('/api/notifications/read-all', {
      method: 'PATCH',
    }),

  // 푸시 알림 구독
  subscribeToPushNotifications: (subscription: PushSubscription) =>
    fetchApi('/api/notifications/subscribe', {
      method: 'POST',
      body: JSON.stringify(subscription),
    }),
};

export default fetchApi;
