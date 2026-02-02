# 설스터디 - 멘토링 학습 관리 플랫폼

멘토와 멘티를 위한 학습 관리 플랫폼입니다. 이 프로젝트는 **Next.js 프론트엔드**와 **Spring Boot 백엔드**로 구성되어 있습니다.

## 주요 기능

### 멘티 (학생) 화면
- **일일 플래너**: 날짜별 할 일 관리, 공부 시간 기록
- **미니 캘린더**: 월간/주간 캘린더 보기, 날짜 선택
- **과제 관리**: 멘토의 과제 조회, 학습자료 다운로드, 증명 사진 업로드
- **피드백 확인**: 과목별 피드백 확인, 주요 피드백 강조
- **코멘트**: 멘토에게 질문/코멘트 남기기
- **마이페이지**: 프로필, 학습 현황, 과목별 달성률
- **알림**: 미완료 과제 리마인드, 피드백 알림

### 멘토 (선생님) 화면
- **학생 관리**: 담당 학생 목록, 완료율 모니터링
- **과제 할당**: 학생별 날짜별 과제 생성
- **학습지 제공**: PDF 파일 업로드 또는 설스터디 칼럼 링크
- **피드백 작성**: 과목별 피드백 작성, 주요 내용 요약
- **학생 상세**: 과제 현황, 증명 제출, 학습 통계
- **효율적 관리**: 다중 학생 한 화면에서 관리

## 기술 스택

### 프론트엔드
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4, shadcn/ui
- **State Management**: React Context API
- **HTTP Client**: Fetch API
- **UI Components**: Radix UI
- **Icons**: Lucide React
- **Date**: date-fns

### 백엔드
- **Framework**: Spring Boot 3.x
- **Language**: Java 17+
- **Database**: PostgreSQL
- **Authentication**: JWT (JSON Web Token)
- **ORM**: Spring Data JPA
- **Validation**: Jakarta Validation
- **Security**: Spring Security

## 프로젝트 구조

```
설스터디/
├── frontend/              # Next.js 프론트엔드
│   ├── app/              # 페이지 라우트
│   ├── components/       # React 컴포넌트
│   ├── lib/             # 유틸리티, API 클라이언트
│   └── docs/            # 문서
├── backend/             # Spring Boot 백엔드 (별도 저장소)
└── README.md
```

자세한 구조는 [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)를 참조하세요.

## 빠른 시작

### 필수 요구사항
- Node.js 18.17.0+
- npm 또는 yarn
- Java 17+ (백엔드)
- PostgreSQL (백엔드)

### 프론트엔드 설치 및 실행

```bash
# 1. 프로젝트 클론
git clone <repository-url>
cd selstudy

# 2. 의존성 설치
npm install

# 3. 환경 변수 설정
# .env.local 파일 생성
echo "NEXT_PUBLIC_API_URL=http://localhost:8080" > .env.local

# 4. 개발 서버 시작
npm run dev
```

브라우저에서 `http://localhost:3000` 열기

### 테스트 계정

| 역할 | 이메일 | 비밀번호 |
|-----|--------|---------|
| 멘토 | mentor@example.com | password123 |
| 멘티1 | mentee1@example.com | password123 |
| 멘티2 | mentee2@example.com | password123 |

### 백엔드 설정

[SETUP_GUIDE.md](./SETUP_GUIDE.md)의 "백엔드 셋업" 섹션을 참조하세요.

## API 명세

모든 API 엔드포인트와 요청/응답 형식은 [API_INTEGRATION.md](./API_INTEGRATION.md)를 참조하세요.

### 주요 API 엔드포인트

#### 인증
- `POST /api/auth/login` - 로그인
- `POST /api/auth/logout` - 로그아웃
- `GET /api/auth/me` - 현재 사용자 정보

#### 멘티
- `GET /api/mentee/planner?date=yyyy-MM-dd` - 일일 플래너 조회
- `POST /api/mentee/todos` - 할 일 추가
- `GET /api/mentee/assignments/{id}` - 과제 상세 조회
- `POST /api/mentee/assignments/{id}/proof` - 증명 사진 업로드
- `GET /api/mentee/feedback?date=yyyy-MM-dd` - 피드백 조회

#### 멘토
- `GET /api/mentor/mentees` - 담당 학생 목록
- `POST /api/mentor/mentees/{id}/assignments` - 과제 생성
- `POST /api/mentor/mentees/{id}/feedback` - 피드백 작성
- `GET /api/mentor/mentees/{id}` - 학생 상세 정보

## 주요 페이지

### 공통
- **로그인** (`/login`) - 역할별 로그인

### 멘티
- **플래너** (`/mentee`) - 일일 학습 플래너
- **과제 상세** (`/mentee/assignment/[id]`) - 과제 상세 및 증명
- **마이페이지** (`/mentee/mypage`) - 학습 현황 대시보드

### 멘토
- **학생 관리** (`/mentor`) - 담당 학생 관리
- **학생 상세** (`/mentor/student/[id]`) - 학생 정보 및 통계
- **피드백 작성** (`/mentor/feedback`) - 피드백 작성 및 관리

## 개발 가이드

### 새 API 추가

1. `/lib/api.ts`에 API 클라이언트 메서드 추가
2. 페이지/컴포넌트에서 `useEffect`와 함께 호출
3. 토큰은 자동으로 포함됨

### 새 페이지 추가

1. `app/[role]/[feature]/page.tsx` 생성
2. `ProtectedRoute` 래퍼로 감싸기
3. 필요한 컴포넌트 작성

### 스타일링

- Tailwind CSS 유틸리티 클래스 사용
- shadcn/ui 컴포넌트 활용
- 반응형 디자인은 모바일 우선

## 배포

### Vercel (권장)

```bash
npm run build
vercel deploy
```

### 수동 배포

```bash
npm run build
npm start
```

## 성능 최적화

- 이미지 최적화
- 번들 크기 모니터링 (`next/bundle-analyzer`)
- API 응답 캐싱
- 데이터베이스 인덱스 최적화

## 보안

- JWT 토큰 기반 인증
- CORS 정책 구성
- 민감한 정보는 환경 변수로 관리
- 파일 업로드 크기 제한 (5MB)
- 파일 형식 검증

## 기여하기

1. 이슈 생성 또는 기존 이슈에 댓글
2. 브랜치 생성 (`git checkout -b feature/AmazingFeature`)
3. 변경사항 커밋 (`git commit -m 'Add AmazingFeature'`)
4. 브랜치에 푸시 (`git push origin feature/AmazingFeature`)
5. Pull Request 생성

## 라이선스

이 프로젝트는 [MIT 라이선스](LICENSE)에 따릅니다.

## 문제 해결

자주 발생하는 문제와 해결 방법은 [SETUP_GUIDE.md](./SETUP_GUIDE.md)의 "문제 해결" 섹션을 참조하세요.

## 지원

질문이나 버그 리포트는 GitHub Issues를 통해 제출해주세요.

## 로드맵

- [ ] 실시간 알림 (WebSocket)
- [ ] 비디오 튜토리얼 통합
- [ ] 모바일 네이티브 앱
- [ ] AI 학습 분석
- [ ] 그룹 스터디 기능

## 감사의 말

- [Next.js](https://nextjs.org/)
- [Spring Boot](https://spring.io/projects/spring-boot)
- [shadcn/ui](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com)

---

**설스터디**로 학습을 더 효율적으로 관리하세요! 🚀
