# 설스터디 - 셋업 가이드

## 프론트엔드 셋업 (Next.js)

### 필수 요구사항
- Node.js 18.17.0 이상
- npm 또는 yarn

### 설치 단계

1. **저장소 클론:**
   ```bash
   git clone <repository-url>
   cd selstudy
   ```

2. **의존성 설치:**
   ```bash
   npm install
   ```

3. **환경 변수 설정:**
   프로젝트 루트에 `.env.local` 파일 생성:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8080
   ```

4. **개발 서버 시작:**
   ```bash
   npm run dev
   ```
   브라우저에서 `http://localhost:3000` 열기

## 백엔드 셋업 (Spring Boot)

### 필수 요구사항
- Java 17 이상
- Spring Boot 3.x
- PostgreSQL 또는 MySQL
- Maven 또는 Gradle

### Spring Boot 프로젝트 구조

```
backend/
├── src/main/java/com/selstudy/
│   ├── config/                          # 설정
│   │   ├── CorsConfig.java             # CORS 설정
│   │   └── SecurityConfig.java         # Spring Security 설정
│   ├── controller/
│   │   ├── auth/
│   │   │   └── AuthController.java
│   │   ├── mentee/
│   │   │   ├── MenteeController.java
│   │   │   ├── PlannerController.java
│   │   │   └── FeedbackController.java
│   │   └── mentor/
│   │       ├── MentorController.java
│   │       └── AssignmentController.java
│   ├── service/
│   ├── repository/
│   ├── entity/
│   ├── dto/
│   ├── security/
│   │   ├── JwtProvider.java
│   │   └── JwtAuthenticationFilter.java
│   └── SelstudyApplication.java
├── src/main/resources/
│   └── application.yml
└── pom.xml (또는 build.gradle)
```

### 주요 설정 파일 예시

#### `application.yml`
```yaml
spring:
  application:
    name: selstudy
  jpa:
    hibernate:
      ddl-auto: validate
    properties:
      hibernate:
        dialect: org.hibernate.dialect.PostgreSQLDialect
  datasource:
    url: jdbc:postgresql://localhost:5432/selstudy
    username: postgres
    password: password
    driver-class-name: org.postgresql.Driver
  servlet:
    multipart:
      max-file-size: 5MB
      max-request-size: 5MB

jwt:
  secret: ${JWT_SECRET:your-secret-key-here}
  expiration: 86400000  # 24시간

server:
  port: 8080
  servlet:
    context-path: /api
```

#### `CorsConfig.java`
```java
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
            .allowedOrigins("http://localhost:3000")
            .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
            .allowedHeaders("*")
            .allowCredentials(true)
            .maxAge(3600);
    }
}
```

### 필수 의존성 (pom.xml)

```xml
<dependencies>
    <!-- Spring Boot Starters -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-jpa</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-security</artifactId>
    </dependency>

    <!-- Database -->
    <dependency>
        <groupId>org.postgresql</groupId>
        <artifactId>postgresql</artifactId>
        <scope>runtime</scope>
    </dependency>

    <!-- JWT -->
    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt-api</artifactId>
        <version>0.12.3</version>
    </dependency>
    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt-impl</artifactId>
        <version>0.12.3</version>
        <scope>runtime</scope>
    </dependency>
    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt-jackson</artifactId>
        <version>0.12.3</version>
        <scope>runtime</scope>
    </dependency>

    <!-- Lombok -->
    <dependency>
        <groupId>org.projectlombok</groupId>
        <artifactId>lombok</artifactId>
        <optional>true</optional>
    </dependency>

    <!-- Validation -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-validation</artifactId>
    </dependency>

    <!-- Testing -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-test</artifactId>
        <scope>test</scope>
    </dependency>
</dependencies>
```

## 데이터베이스 설계

### 주요 테이블

#### users (사용자)
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('mentor', 'mentee')),
    profile_image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### mentee_mentor (멘토-멘티 관계)
```sql
CREATE TABLE mentee_mentor (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mentee_id UUID NOT NULL REFERENCES users(id),
    mentor_id UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### todos (할 일)
```sql
CREATE TABLE todos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mentee_id UUID NOT NULL REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    subject VARCHAR(50) NOT NULL,
    date DATE NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    study_time_minutes INTEGER,
    is_fixed BOOLEAN DEFAULT FALSE,
    assignment_id UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### assignments (과제)
```sql
CREATE TABLE assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mentee_id UUID NOT NULL REFERENCES users(id),
    mentor_id UUID NOT NULL REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    subject VARCHAR(50) NOT NULL,
    goal_description TEXT,
    file_url VARCHAR(500),
    file_type VARCHAR(20),
    date DATE NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### assignment_proofs (과제 증명)
```sql
CREATE TABLE assignment_proofs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID NOT NULL REFERENCES assignments(id),
    image_url VARCHAR(500) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### feedbacks (피드백)
```sql
CREATE TABLE feedbacks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mentee_id UUID NOT NULL REFERENCES users(id),
    mentor_id UUID NOT NULL REFERENCES users(id),
    subject VARCHAR(50) NOT NULL,
    summary TEXT,
    content TEXT NOT NULL,
    date DATE NOT NULL,
    assignment_id UUID REFERENCES assignments(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### comments (코멘트)
```sql
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mentee_id UUID NOT NULL REFERENCES users(id),
    content TEXT NOT NULL,
    date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### notifications (알림)
```sql
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    read BOOLEAN DEFAULT FALSE,
    related_id UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 로컬 개발 환경 설정

### Docker Compose (선택사항)

`docker-compose.yml`:
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: selstudy
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  pgadmin:
    image: dpage/pgadmin4
    environment:
      PGADMIN_DEFAULT_EMAIL: admin@example.com
      PGADMIN_DEFAULT_PASSWORD: admin
    ports:
      - "5050:80"
    depends_on:
      - postgres

volumes:
  postgres_data:
```

실행:
```bash
docker-compose up
```

## 테스트 계정 생성 스크립트

Spring Boot에서 초기 테스트 계정을 생성:

```java
@Component
@Slf4j
public class DataInitializer {
    @Autowired
    private UserRepository userRepository;
    
    @EventListener(ApplicationReadyEvent.class)
    public void initializeData() {
        if (userRepository.count() == 0) {
            User mentor = User.builder()
                .email("mentor@example.com")
                .password(passwordEncoder().encode("password123"))
                .name("멘토")
                .role(UserRole.MENTOR)
                .build();
            userRepository.save(mentor);

            User mentee1 = User.builder()
                .email("mentee1@example.com")
                .password(passwordEncoder().encode("password123"))
                .name("김멘티")
                .role(UserRole.MENTEE)
                .build();
            userRepository.save(mentee1);

            User mentee2 = User.builder()
                .email("mentee2@example.com")
                .password(passwordEncoder().encode("password123"))
                .name("이멘티")
                .role(UserRole.MENTEE)
                .build();
            userRepository.save(mentee2);
            
            log.info("테스트 계정이 생성되었습니다");
        }
    }
}
```

## 통합 테스트 실행

### 프론트엔드 테스트
```bash
npm test
```

### 백엔드 테스트
```bash
mvn test
```

## 배포 체크리스트

### 프론트엔드
- [ ] 환경 변수 설정 (API_URL)
- [ ] 빌드 성공 확인: `npm run build`
- [ ] 프로덕션 빌드 테스트: `npm start`
- [ ] CORS 도메인 확인

### 백엔드
- [ ] 데이터베이스 마이그레이션
- [ ] JWT 시크릿 키 설정
- [ ] CORS 프로덕션 도메인 설정
- [ ] 보안 헤더 설정
- [ ] 로깅 구성
- [ ] 파일 업로드 경로 설정

## 문제 해결

### CORS 에러
- Spring Boot의 CorsConfig 확인
- 프론트엔드의 API_URL 확인
- 브라우저 콘솔의 정확한 에러 메시지 확인

### 파일 업로드 실패
- 최대 파일 크기 설정 확인 (5MB)
- 파일 형식 검증 (JPG, PNG, PDF)
- 서버 디스크 공간 확인

### 로그인 실패
- JWT 시크릿 키 일치 확인
- 데이터베이스 연결 확인
- 사용자 정보 정확성 확인

## 성능 최적화 팁

1. **데이터베이스:**
   - 자주 사용하는 쿼리에 인덱스 추가
   - N+1 쿼리 문제 해결 (JPA join fetch)

2. **프론트엔드:**
   - 이미지 최적화
   - 번들 크기 모니터링
   - 불필요한 리렌더링 제거

3. **백엔드:**
   - 응답 캐싱
   - 느린 쿼리 모니터링
   - API 응답 페이징

## 추가 리소스

- [Next.js 문서](https://nextjs.org/docs)
- [Spring Boot 문서](https://spring.io/projects/spring-boot)
- [shadcn/ui 문서](https://ui.shadcn.com)
- [Tailwind CSS 문서](https://tailwindcss.com/docs)
