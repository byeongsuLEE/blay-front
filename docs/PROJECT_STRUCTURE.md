# 설스터디 - 프로젝트 구조

## 전체 구조

```
/
├── app/                           # Next.js App Router
│   ├── layout.tsx                 # 루트 레이아웃 (인증 제공자 포함)
│   ├── page.tsx                   # 홈 페이지 (역할별 리다이렉트)
│   ├── login/
│   │   └── page.tsx              # 로그인 페이지
│   ├── mentee/                    # 멘티 화면
│   │   ├── layout.tsx            # 멘티 레이아웃 (헤더 포함)
│   │   ├── page.tsx              # 일일 플래너 메인 페이지
│   │   ├── mypage/
│   │   │   └── page.tsx          # 마이페이지
│   │   └── assignment/
│   │       └── [id]/
│   │           └── page.tsx      # 과제 상세 페이지
│   └── mentor/                    # 멘토 화면
│       ├── layout.tsx            # 멘토 레이아웃 (사이드바 포함)
│       ├── page.tsx              # 학생 관리 페이지
│       ├── student/
│       │   └── [id]/
│       │       └── page.tsx      # 학생 상세 페이지
│       └── feedback/
│           ├── page.tsx          # 피드백 작성 페이지 (Suspense 래퍼)
│           └── page-client.tsx   # 피드백 작성 로직
│
├── components/
│   ├── ui/                        # shadcn/ui 컴포넌트 (자동 생성)
│   └── mentee/                    # 멘티 전용 컴포넌트
│       ├── date-navigator.tsx    # 날짜 네비게이션
│       ├── todo-item.tsx         # 할 일 아이템
│       ├── comment-section.tsx   # 코멘트 입력 영역
│       ├── feedback-section.tsx  # 피드백 표시 영역
│       └── mini-calendar.tsx     # 미니 캘린더
│
├── lib/
│   ├── api.ts                     # Spring Boot API 클라이언트
│   ├── auth-context.tsx           # 인증 컨텍스트
│   ├── protected-route.tsx        # 보호된 라우트 컴포넌트
│   └── utils.ts                   # 유틸리티 함수
│
├── docs/
│   ├── API_INTEGRATION.md         # API 명세서
│   └── PROJECT_STRUCTURE.md       # 이 파일
│
├── globals.css                    # 전역 스타일 (Tailwind)
├── layout.tsx                     # (deprecated - app/layout.tsx 사용)
└── package.json
```

## 핵심 파일 설명

### 인증 및 API

#### `/lib/api.ts`
- Spring Boot 백엔드와의 모든 통신을 담당
- 멘티, 멘토, 인증, 알림 관련 API 클라이언트 제공
- 토큰 기반 인증 처리
- multipart/form-data 파일 업로드 지원

#### `/lib/auth-context.tsx`
- React Context를 통한 전역 인증 상태 관리
- 로그인/로그아웃 기능
- localStorage에 토큰 저장
- `useAuth()` 훅으로 어디서나 인증 상태 접근 가능

#### `/lib/protected-route.tsx`
- 인증되지 않은 사용자 차단
- 역할별(멘토/멘티) 접근 제어
- 로딩 중 스피너 표시

### 페이지별 설명

#### 로그인 페이지 (`/app/login/page.tsx`)
- 이메일/비밀번호 입력
- 테스트 계정 빠른 로그인 버튼
- 역할 자동 감지 및 대시보드로 리다이렉트

#### 멘티 메인 페이지 (`/app/mentee/page.tsx`)
- **레이아웃:**
  - 왼쪽: 미니 캘린더 (날짜 선택)
  - 중앙: 일일 플래너
  - 최상단: 날짜 네비게이션

- **기능:**
  - 날짜별 할 일 목록 조회
  - 멘토가 지정한 할 일(수정 불가)과 사용자 추가 할 일 구분
  - 할 일 완료 체크
  - 공부 시간 기록
  - 멘토에게 코멘트/질문 남기기
  - 날짜별 피드백 확인

#### 과제 상세 페이지 (`/app/mentee/assignment/[id]/page.tsx`)
- 과제 목표 표시
- 학습 자료 다운로드 (PDF)
- 과제 증명 사진 업로드
- 이전 업로드 사진 갤러리

#### 마이페이지 (`/app/mentee/mypage/page.tsx`)
- 사용자 프로필
- 총 학습 시간, 연속 학습 일 수 통계
- 과목별 달성률 진행 바
- 상담받아보기 버튼 (구글 폼 연동)

#### 멘토 학생 관리 (`/app/mentor/page.tsx`)
- 담당 학생 카드 형태 나열
- 학생별 통계 (완료율, 과제 수)
- 마지막 활동 시간 표시
- 상세보기 및 과제 할당 버튼
- 과제 할당 다이얼로그

#### 학생 상세 페이지 (`/app/mentor/student/[id]/page.tsx`)
- 학생 프로필 및 통계 (학습 시간, 완료율, 과제, 증명 제출)
- 탭 형식의 정보 표시:
  - **과제 현황:** 할당된 과제 목록, 완료 여부, 증명 제출 여부
  - **피드백:** 작성된 피드백 목록, 주요 피드백 강조
  - **코멘트:** 학생이 남긴 코멘트

#### 피드백 작성 페이지 (`/app/mentor/feedback/page.tsx`)
- **레이아웃:**
  - 왼쪽: 학생 선택 (학생 리스트)
  - 오른쪽: 피드백 작성 영역

- **기능:**
  - 학생 선택
  - 날짜 선택
  - 기존 피드백 표시 (과목별)
  - 새 피드백 작성 (과목, 주요 피드백, 상세 내용)
  - 기존 피드백 수정

### 멘티 컴포넌트

#### DateNavigator
- 날짜 네비게이션 (이전/다음/오늘)
- 현재 날짜 표시

#### TodoItem
- 할 일 체크박스
- 과목별 색상 배지
- 공부 시간 기록 (인라인 수정)
- 상세보기/삭제 버튼
- 멘토 고정 할 일은 수정 불가

#### CommentSection
- 멘토에게 남길 코멘트 입력
- 날짜별로 저장

#### FeedbackSection
- 과목별 피드백 표시
- 주요 피드백 강조 (아코디언 확장)
- 협소한 화면에서도 가독성 유지

#### MiniCalendar
- 월간 캘린더 보기
- 날짜 클릭으로 이동
- 오늘 날짜 하이라이트
- 선택된 날짜 표시

## 데이터 흐름

### 로그인 플로우
```
로그인 페이지 → API 로그인 요청 → 토큰 + 사용자 정보 반환
→ localStorage에 저장 → 역할 확인 → 대시보드로 리다이렉트
```

### 멘티 데이터 플로우
```
날짜 선택 → API 플래너 조회 → 할 일 목록 + 피드백 표시
→ 할 일 클릭 → 과제 상세 페이지 → 파일 다운로드/증명 업로드
```

### 멘토 데이터 플로우
```
멘토 대시보드 → 학생 선택 → 학생 상세 페이지 → 과제 현황/피드백 확인
→ 새 과제 할당 또는 피드백 작성
```

## 상태 관리

### 전역 상태
- **인증 상태:** `useAuth()` 훅 (Context API)
  - `token`, `user`, `loading`, `isAuthenticated`
  - `login()`, `logout()` 메서드

### 지역 상태
- 각 페이지/컴포넌트는 `useState`로 자체 상태 관리
- 페이지별 데이터 로딩은 `useEffect`에서 처리
- API 호출 중 에러는 `toast` 알림으로 표시

## 스타일링

- **Tailwind CSS v4:** 프리마리 스타일링
- **shadcn/ui:** UI 컴포넌트 라이브러리
- **색상 팔레트:**
  - Primary: 인디고 (Indigo 600)
  - Secondary: 보라색 (Purple)
  - Success: 초록색 (Green)
  - Warning: 주황색 (Amber/Orange)
  - Error: 빨강색 (Red)
- **반응형:** 모바일 우선 설계

## API 클라이언트 확장

새로운 API를 추가할 때는 `/lib/api.ts`에서:

```typescript
export const newAPI = {
  // 새로운 엔드포인트
  getData: () => fetchApi('/api/endpoint', { method: 'GET' }),
  
  // 파일 업로드가 필요한 경우
  uploadFile: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const token = localStorage.getItem('token');
    return fetch(`${API_BASE_URL}/api/endpoint`, {
      method: 'POST',
      body: formData,
      headers: { Authorization: `Bearer ${token}` },
    });
  }
};
```

## 배포 준비

1. **환경 변수 설정:**
   - Vercel/호스팅 플랫폼에서 `NEXT_PUBLIC_API_URL` 설정

2. **CORS 설정:**
   - Spring Boot에서 프로덕션 도메인 허용

3. **빌드:**
   ```bash
   npm run build
   npm start
   ```

4. **테스트:**
   - 로그인 기능 확인
   - 멘티/멘토 페이지 접근성 확인
   - 파일 업로드/다운로드 확인
