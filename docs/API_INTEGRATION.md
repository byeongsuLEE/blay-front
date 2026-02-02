# 설스터디 - Spring Boot API 통합 가이드

이 문서는 Next.js 프론트엔드와 Spring Boot 백엔드를 통합하기 위한 API 명세서입니다.

## 기본 설정

### 환경 변수
프로젝트 루트의 `.env.local` 파일에 다음을 추가하세요:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

## API 구조

모든 API 응답은 다음 형식을 따릅니다:

```json
{
  "success": true,
  "data": {},
  "message": "성공 메시지"
}
```

실패 시:

```json
{
  "success": false,
  "error": "에러 메시지"
}
```

## 인증 (Authentication)

### 로그인
- **엔드포인트:** `POST /api/auth/login`
- **요청:**
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- **응답:**
  ```json
  {
    "token": "jwt_token_here",
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "name": "사용자명",
      "role": "mentor" or "mentee"
    }
  }
  ```

### 로그아웃
- **엔드포인트:** `POST /api/auth/logout`
- **인증:** Bearer Token 필요

### 현재 사용자 정보
- **엔드포인트:** `GET /api/auth/me`
- **인증:** Bearer Token 필요
- **응답:** User 객체

### 토큰 검증
- **엔드포인트:** `GET /api/auth/validate`
- **인증:** Bearer Token 필요
- **응답:**
  ```json
  {
    "valid": true
  }
  ```

## 멘티 API

### 플래너 조회
- **엔드포인트:** `GET /api/mentee/planner?date=yyyy-MM-dd`
- **인증:** Bearer Token 필요
- **응답:**
  ```json
  {
    "date": "2024-01-15",
    "todos": [
      {
        "id": "todo_id",
        "title": "과제명",
        "subject": "국어",
        "completed": false,
        "studyTimeMinutes": 30,
        "isFixed": true,
        "assignmentId": "assignment_id"
      }
    ]
  }
  ```

### 할 일 추가
- **엔드포인트:** `POST /api/mentee/todos`
- **인증:** Bearer Token 필요
- **요청:**
  ```json
  {
    "date": "2024-01-15",
    "title": "새로운 할 일",
    "subject": "수학",
    "timeSpent": 45
  }
  ```

### 할 일 상태 변경
- **엔드포인트:** `PATCH /api/mentee/todos/{todoId}`
- **인증:** Bearer Token 필요
- **요청:**
  ```json
  {
    "completed": true
  }
  ```

### 공부 시간 기록
- **엔드포인트:** `PATCH /api/mentee/todos/{todoId}/study-time`
- **인증:** Bearer Token 필요
- **요청:**
  ```json
  {
    "minutes": 60
  }
  ```

### 과제 상세 조회
- **엔드포인트:** `GET /api/mentee/assignments/{assignmentId}`
- **인증:** Bearer Token 필요

### 과제 파일 다운로드 URL
- **엔드포인트:** `GET /api/mentee/assignments/{assignmentId}/file`
- **인증:** Bearer Token 필요
- **응답:**
  ```json
  {
    "downloadUrl": "https://..."
  }
  ```

### 과제 증명 사진 업로드
- **엔드포인트:** `POST /api/mentee/assignments/{assignmentId}/proof`
- **인증:** Bearer Token 필요 + multipart/form-data
- **요청:** `file` (이미지 파일, JPG/PNG)
- **응답:**
  ```json
  {
    "proofId": "proof_id",
    "proofImageUrl": "https://..."
  }
  ```

### 피드백 조회
- **엔드포인트:** `GET /api/mentee/feedback?date=yyyy-MM-dd`
- **인증:** Bearer Token 필요
- **응답:**
  ```json
  {
    "feedbacks": [
      {
        "id": "feedback_id",
        "subject": "국어",
        "summary": "주요 피드백",
        "content": "상세 피드백 내용",
        "createdAt": "2024-01-15T10:00:00Z"
      }
    ]
  }
  ```

### 코멘트 작성
- **엔드포인트:** `POST /api/mentee/comments`
- **인증:** Bearer Token 필요
- **요청:**
  ```json
  {
    "date": "2024-01-15",
    "content": "멘토에게 남길 코멘트"
  }
  ```

### 마이페이지 정보
- **엔드포인트:** `GET /api/mentee/mypage`
- **인증:** Bearer Token 필요
- **응답:**
  ```json
  {
    "profileImage": "https://...",
    "name": "이름",
    "email": "email@example.com",
    "joinDate": "2024-01-01T00:00:00Z",
    "totalStudyMinutes": 4560,
    "streak": 12
  }
  ```

### 과목별 달성률
- **엔드포인트:** `GET /api/mentee/stats/subjects`
- **인증:** Bearer Token 필요
- **응답:**
  ```json
  {
    "stats": [
      {
        "subject": "국어",
        "completionRate": 85,
        "totalAssignments": 20,
        "completedAssignments": 17
      }
    ]
  }
  ```

### 월간 학습 현황
- **엔드포인트:** `GET /api/mentee/stats/monthly?month=yyyy-MM`
- **인증:** Bearer Token 필요

## 멘토 API

### 담당 학생 목록
- **엔드포인트:** `GET /api/mentor/mentees`
- **인증:** Bearer Token 필요
- **응답:**
  ```json
  {
    "mentees": [
      {
        "id": "mentee_id",
        "name": "학생명",
        "email": "email@example.com",
        "completionRate": 85,
        "totalAssignments": 20,
        "completedAssignments": 17,
        "lastActivityDate": "2024-01-15T10:00:00Z"
      }
    ]
  }
  ```

### 특정 학생 상세 조회
- **엔드포인트:** `GET /api/mentor/mentees/{menteeId}`
- **인증:** Bearer Token 필요

### 학생 과제 목록
- **엔드포인트:** `GET /api/mentor/mentees/{menteeId}/assignments?date=yyyy-MM-dd`
- **인증:** Bearer Token 필요

### 학생 플래너 조회
- **엔드포인트:** `GET /api/mentor/mentees/{menteeId}/planner?date=yyyy-MM-dd`
- **인증:** Bearer Token 필요

### 과제 생성
- **엔드포인트:** `POST /api/mentor/mentees/{menteeId}/assignments`
- **인증:** Bearer Token 필요
- **요청:**
  ```json
  {
    "title": "과제명",
    "subject": "국어",
    "date": "2024-01-15",
    "goalDescription": "학습 목표",
    "fileType": "pdf" or "column",
    "fileUrl": "https://..." (선택사항)
  }
  ```

### 과제 파일 업로드
- **엔드포인트:** `POST /api/mentor/mentees/{menteeId}/assignments/{assignmentId}/file`
- **인증:** Bearer Token 필요 + multipart/form-data
- **요청:** `file` (PDF 파일)

### 피드백 작성
- **엔드포인트:** `POST /api/mentor/mentees/{menteeId}/feedback`
- **인증:** Bearer Token 필요
- **요청:**
  ```json
  {
    "date": "2024-01-15",
    "assignmentId": "assignment_id (선택사항)",
    "subject": "국어",
    "summary": "주요 피드백 (선택사항)",
    "content": "상세 피드백 내용"
  }
  ```

### 피드백 수정
- **엔드포인트:** `PATCH /api/mentor/mentees/{menteeId}/feedback/{feedbackId}`
- **인증:** Bearer Token 필요
- **요청:**
  ```json
  {
    "subject": "국어",
    "summary": "주요 피드백 (선택사항)",
    "content": "상세 피드백 내용"
  }
  ```

### 피드백 조회
- **엔드포인트:** `GET /api/mentor/mentees/{menteeId}/feedback?date=yyyy-MM-dd`
- **인증:** Bearer Token 필요

### 학생별 통계
- **엔드포인트:** `GET /api/mentor/mentees/{menteeId}/stats`
- **인증:** Bearer Token 필요

## 알림 API

### 알림 목록
- **엔드포인트:** `GET /api/notifications`
- **인증:** Bearer Token 필요

### 알림 읽음 표시
- **엔드포인트:** `PATCH /api/notifications/{notificationId}/read`
- **인증:** Bearer Token 필요

### 모든 알림 읽음 표시
- **엔드포인트:** `PATCH /api/notifications/read-all`
- **인증:** Bearer Token 필요

### 푸시 알림 구독
- **엔드포인트:** `POST /api/notifications/subscribe`
- **인증:** Bearer Token 필요
- **요청:** PushSubscription 객체

## 인증 토큰 처리

프론트엔드는 로그인 후 반환된 JWT 토큰을 `localStorage`에 저장하고, 모든 API 요청의 `Authorization` 헤더에 다음과 같이 포함시킵니다:

```
Authorization: Bearer {token}
```

토큰이 만료되면 `401 Unauthorized` 응답을 받으며, 이 경우 자동으로 로그인 페이지로 리다이렉트됩니다.

## 에러 처리

API가 에러를 반환할 때는 다음과 같은 HTTP 상태 코드를 사용합니다:

- **400 Bad Request:** 요청 데이터가 잘못됨
- **401 Unauthorized:** 인증이 필요하거나 토큰이 유효하지 않음
- **403 Forbidden:** 접근 권한이 없음
- **404 Not Found:** 리소스를 찾을 수 없음
- **500 Internal Server Error:** 서버 에러

## CORS 설정

Spring Boot에서 CORS를 활성화해야 합니다:

```java
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
            .allowedOrigins("http://localhost:3000", "http://localhost:3001")
            .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
            .allowedHeaders("*")
            .allowCredentials(true)
            .maxAge(3600);
    }
}
```

## 테스트 계정

로그인 페이지에서 아래 테스트 계정을 사용할 수 있습니다:

- **멘토:** mentor@example.com / password123
- **멘티1:** mentee1@example.com / password123
- **멘티2:** mentee2@example.com / password123
