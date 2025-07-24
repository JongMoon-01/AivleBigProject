# 🔐 AivleBigProject - 관리자 권한 로그인 시스템

React 프론트엔드와 Spring Boot 백엔드로 구현된 **RSA 암호화** + **JWT 기반** 인증 시스템으로, **관리자와 일반 사용자를 구분하는 역할 기반 접근 제어**를 제공합니다.

## 📋 프로젝트 개요

- **프로젝트명**: AivleBigProject - 관리자 로그인 시스템
- **아키텍처**: Full-Stack (React + Spring Boot)
- **보안**: RSA 2048-bit 암호화 + BCrypt 해싱 + JWT 토큰
- **역할**: 관리자(Admin) / 일반사용자(User) 구분
- **데이터베이스**: H2 인메모리 데이터베이스

## 🏗️ 프로젝트 구조

```
AivleBigProject/
├── backend/                           # Spring Boot 백엔드 (포트: 8080)
│   ├── pom.xml                       # Maven 의존성 관리
│   └── src/main/
│       ├── java/com/example/auth/
│       │   ├── AuthApplication.java           # 메인 애플리케이션
│       │   ├── config/
│       │   │   ├── SecurityConfig.java       # Spring Security + CORS 설정
│       │   │   └── DataInitializer.java      # 관리자 계정 초기 데이터
│       │   ├── controller/
│       │   │   └── AuthController.java       # REST API 엔드포인트
│       │   ├── dto/                          # 데이터 전송 객체
│       │   │   ├── AuthResponse.java         # 인증 응답 DTO
│       │   │   ├── LoginRequest.java         # 로그인 요청 DTO
│       │   │   └── RegisterRequest.java      # 회원가입 요청 DTO
│       │   ├── entity/
│       │   │   └── User.java                 # 사용자 엔티티 (isAdmin 필드 포함)
│       │   ├── repository/
│       │   │   └── UserRepository.java       # JPA 리포지토리
│       │   └── service/
│       │       ├── AuthService.java          # 인증 비즈니스 로직
│       │       ├── JwtService.java           # JWT 토큰 관리
│       │       └── RSAService.java           # RSA 암호화/복호화
│       └── resources/
│           └── application.properties        # H2 DB 및 서버 설정
├── frontend/                         # React 프론트엔드 (포트: 3000)
│   ├── package.json                  # npm 의존성 관리
│   ├── public/
│   │   └── index.html               # 메인 HTML (내장 CSS 포함)
│   └── src/
│       ├── App.js                   # 메인 라우터 (/, /admin, /dashboard)
│       ├── index.js                 # React DOM 렌더링
│       ├── components/
│       │   ├── Login.js             # 로그인 컴포넌트 (RSA 암호화)
│       │   ├── Register.js          # 회원가입 컴포넌트
│       │   ├── AdminDashboard.js    # 관리자 전용 대시보드
│       │   └── UserDashboard.js     # 일반사용자 대시보드
│       └── utils/
│           └── rsaEncrypt.js        # RSA 암호화 유틸리티
├── test-api.js                      # Node.js API 테스트 스크립트
├── test-rsa-encryption.html         # 브라우저 RSA 암호화 테스트
└── README.md                        # 프로젝트 문서
```

## 🔐 보안 아키텍처

### 다층 보안 시스템
```
클라이언트                서버
┌─────────────────┐      ┌─────────────────┐
│ 1. 평문 비밀번호  │      │ 4. RSA 복호화    │
│      ↓          │      │      ↓          │
│ 2. RSA 2048     │─────►│ 5. BCrypt 해싱   │
│    공개키 암호화  │      │      ↓          │
│      ↓          │      │ 6. DB 저장       │
│ 3. 서버 전송     │      │      ↓          │
│                 │      │ 7. JWT 토큰 생성  │
└─────────────────┘      └─────────────────┘
```

### 보안 기능
- **RSA 2048-bit 암호화**: 클라이언트에서 비밀번호 암호화 후 전송
- **BCrypt 해싱**: 서버에서 비밀번호 해시 저장
- **JWT 토큰**: 24시간 유효기간, stateless 인증
- **CORS 보호**: localhost:3000만 허용
- **역할 기반 접근 제어**: Admin/User 권한 구분

## 👥 사용자 역할 시스템

### 🔑 사전 등록된 관리자 계정
```
사용자명 / 비밀번호
├── jihyeon / 4308
├── donghee / 4623  
├── jongmoon / 1519
├── yura / 4115
├── seongwoo / 8775
└── yongsun / 3751
```

### 🚪 접근 제어
- **관리자 로그인** → `/admin` (AdminDashboard.js)
- **일반사용자 로그인** → `/dashboard` (UserDashboard.js)
- **미인증 사용자** → `/` (홈페이지)

## 📡 API 엔드포인트

### 🔐 인증 API

#### 1. RSA 공개키 조회
```http
GET /api/auth/public-key

응답:
{
  "publicKey": "-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG..."
}
```

#### 2. 회원가입
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "사용자명",
  "email": "email@example.com",
  "password": "평문비밀번호"
}

응답 (성공):
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "username": "사용자명",
  "message": "Registration successful",
  "admin": false
}
```

#### 3. 로그인 (RSA 암호화)
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "사용자명",
  "encryptedPassword": "RSA로 암호화된 비밀번호",
  "password": null
}

응답 (성공):
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "username": "사용자명", 
  "message": "Login successful",
  "admin": true  // 관리자인 경우 true
}
```

## 🔄 인증 플로우

### 로그인 프로세스
```
1. [클라이언트] 사용자가 로그인 폼 작성
2. [클라이언트] GET /api/auth/public-key로 RSA 공개키 요청
3. [서버] RSA 공개키 반환
4. [클라이언트] JSEncrypt로 비밀번호 암호화
5. [클라이언트] POST /api/auth/login으로 암호화된 데이터 전송
6. [서버] RSA 개인키로 비밀번호 복호화
7. [서버] 사용자 조회 및 BCrypt로 비밀번호 검증
8. [서버] JWT 토큰 생성 및 사용자 역할(admin) 포함하여 응답
9. [클라이언트] localStorage에 토큰과 역할 정보 저장
10. [클라이언트] 역할에 따른 페이지 리다이렉트
    - admin: true → /admin (관리자 대시보드)
    - admin: false → /dashboard (일반사용자 대시보드)
```

## 🛠️ 기술 스택

### 백엔드 (Spring Boot 3.2.0)
- **Spring Security** - 보안 설정 및 CORS
- **Spring Data JPA** - 데이터 접근 계층
- **JWT (jjwt 0.11.5)** - 토큰 기반 인증
- **H2 Database** - 인메모리 데이터베이스
- **Lombok** - 보일러플레이트 코드 감소
- **Maven** - 의존성 관리

### 프론트엔드 (React 19.1.0)
- **React Router DOM 7.7.0** - 클라이언트 사이드 라우팅
- **JSEncrypt 3.3.2** - RSA 암호화
- **Fetch API** - HTTP 통신
- **CSS3** - 스타일링 (탭 기반 UI)

## 🚀 실행 방법

### 사전 요구사항
- **Java 17+**
- **Node.js 16+**
- **Maven 3.6+**

### 1. 백엔드 실행
```bash
cd backend
mvn clean install
mvn spring-boot:run
```
또는 IDE에서 `AuthApplication.java` 실행

### 2. 프론트엔드 실행
```bash
cd frontend
npm install
npm start
```

### 3. 접속 주소
- **프론트엔드**: http://localhost:3000
- **백엔드 API**: http://localhost:8080
- **H2 데이터베이스 콘솔**: http://localhost:8080/h2-console
  - JDBC URL: `jdbc:h2:mem:testdb`
  - Username: `sa`
  - Password: (비어있음)

## 🧪 테스트

### API 테스트
```bash
# Node.js API 테스트 스크립트
node test-api.js

# 브라우저에서 RSA 암호화 테스트
# test-rsa-encryption.html 파일을 브라우저로 열기
```

### 수동 테스트
1. **관리자 로그인 테스트**:
   - 사용자명: `jihyeon`, 비밀번호: `4308`
   - 로그인 후 `/admin` 페이지로 리다이렉트 확인

2. **일반사용자 테스트**:
   - 새 계정 회원가입
   - 로그인 후 `/dashboard` 페이지로 리다이렉트 확인

## 📊 데이터베이스 스키마

### users 테이블
| 필드명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | BIGINT | PRIMARY KEY, AUTO_INCREMENT | 사용자 ID |
| username | VARCHAR(255) | UNIQUE, NOT NULL | 사용자명 |
| email | VARCHAR(255) | UNIQUE, NOT NULL | 이메일 |
| password | VARCHAR(255) | NOT NULL | BCrypt 해시된 비밀번호 |
| is_admin | BOOLEAN | NOT NULL, DEFAULT FALSE | 관리자 권한 여부 |

## 🎯 주요 기능

### ✅ 구현된 기능
- **역할 기반 접근 제어** (Admin/User)
- **RSA + BCrypt 이중 암호화**
- **JWT 토큰 기반 인증**
- **반응형 탭 기반 UI**
- **실시간 폼 검증**
- **자동 리다이렉트** (역할별 대시보드)
- **세션 관리** (localStorage)
- **에러 처리** 및 사용자 피드백

### 🔒 보안 특징
- 비밀번호 평문 전송 차단
- 클라이언트 사이드 암호화
- 서버 사이드 해싱
- CORS 보호
- JWT 토큰 만료 관리

## 📝 사용법

1. **브라우저에서** http://localhost:3000 **접속**
2. **관리자 테스트**: 
   - 로그인 탭 클릭
   - 사용자명: `jihyeon`, 비밀번호: `4308` 입력
   - 관리자 대시보드로 이동 확인
3. **일반사용자 테스트**:
   - 회원가입 탭에서 새 계정 생성
   - 로그인 후 일반사용자 대시보드로 이동 확인
4. **로그아웃**: 각 대시보드의 로그아웃 버튼 클릭

## 🔧 환경 설정

### application.properties
```properties
# H2 Database
spring.datasource.url=jdbc:h2:mem:testdb
spring.h2.console.enabled=true

# JPA
spring.jpa.hibernate.ddl-auto=create-drop

# Server
server.port=8080

# JWT
jwt.secret=mySecretKey
jwt.expiration=86400000
```

## 🐛 문제 해결

### 일반적인 문제
1. **관리자 로그인 시 일반사용자 대시보드로 이동**
   - 해결됨: frontend/Login.js에서 `data.admin` 속성 사용 확인

2. **CORS 에러**
   - backend/SecurityConfig.java에서 localhost:3000 허용 확인

3. **RSA 암호화 실패**
   - 공개키 조회 API 응답 확인
   - JSEncrypt 라이브러리 로드 확인

## 🔮 향후 개선 사항

- [ ] PostgreSQL/MySQL 연동
- [ ] 관리자 페이지 사용자 관리 기능
- [ ] Docker 컨테이너화

---

**개발자**: AivleBigProject Team  
**최종 업데이트**: 2025년 7월 24일일 
**라이선스**: MIT License