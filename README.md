# 🔐 회원가입 & 로그인 시스템

React 프론트엔드와 Spring Boot 백엔드로 구현된 JWT 기반 인증 시스템입니다.

## 📁 프로젝트 구조

```
회원가입/
├── backend/                          # Spring Boot 백엔드
│   ├── pom.xml                      # Maven 의존성 설정
│   └── src/main/
│       ├── java/com/example/auth/
│       │   ├── AuthApplication.java  # 메인 애플리케이션
│       │   ├── config/
│       │   │   └── SecurityConfig.java    # Spring Security 설정
│       │   ├── controller/
│       │   │   └── AuthController.java    # REST API 컨트롤러
│       │   ├── dto/                       # 데이터 전송 객체
│       │   │   ├── AuthResponse.java
│       │   │   ├── LoginRequest.java
│       │   │   └── RegisterRequest.java
│       │   ├── entity/
│       │   │   └── User.java              # 사용자 엔티티
│       │   ├── repository/
│       │   │   └── UserRepository.java    # JPA 리포지토리
│       │   └── service/
│       │       ├── AuthService.java       # 인증 서비스
│       │       └── JwtService.java        # JWT 토큰 서비스
│       └── resources/
│           └── application.properties     # 애플리케이션 설정
├── frontend/                        # React 프론트엔드
│   ├── package.json                 # npm 의존성 설정
│   ├── public/
│   │   └── index.html              # 메인 HTML 템플릿
│   └── src/
│       ├── App.js                  # 메인 앱 컴포넌트
│       ├── index.js               # React DOM 렌더링
│       └── components/
│           ├── Login.js           # 로그인 컴포넌트
│           └── Register.js        # 회원가입 컴포넌트
└── README.md                       # 프로젝트 문서
```

## 🏗️ 시스템 아키텍처

```
┌─────────────────────────────────────────────────────────────────┐
│                    클라이언트 (브라우저)                          │
│                     http://localhost:3000                       │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      │ HTTP 요청/응답
                      │ (JSON 형태)
                      │
┌─────────────────────▼───────────────────────────────────────────┐
│                React 프론트엔드                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │   App.js    │  │  Login.js   │  │     Register.js         │  │
│  │  (메인 앱)   │  │  (로그인)    │  │     (회원가입)           │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
│                             │                                   │
│                             │ fetch API 호출                     │
└─────────────────────────────┼───────────────────────────────────┘
                              │
                              │ CORS 허용된 API 요청
                              │ Content-Type: application/json
                              │
┌─────────────────────────────▼───────────────────────────────────┐
│                Spring Boot 백엔드                                │
│                http://localhost:8080                            │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │              AuthController                                 │ │
│  │  ┌─────────────────┐    ┌─────────────────┐                │ │
│  │  │ POST /register  │    │ POST /login     │                │ │
│  │  │  회원가입 API    │    │  로그인 API      │                │ │
│  │  └─────────────────┘    └─────────────────┘                │ │
│  └─────────────┬───────────────────┬───────────────────────────┘ │
│                │                   │                             │
│                ▼                   ▼                             │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                   AuthService                               │ │
│  │  ┌─────────────────┐    ┌─────────────────┐                │ │
│  │  │  register()     │    │    login()      │                │ │
│  │  │  사용자 등록      │    │   사용자 인증     │                │ │
│  │  └─────────────────┘    └─────────────────┘                │ │
│  └─────────────┬───────────────────┬───────────────────────────┘ │
│                │                   │                             │
│                ▼                   ▼                             │
│  ┌─────────────────────┐    ┌─────────────────────────────────┐  │
│  │   UserRepository    │    │         JwtService              │  │
│  │  데이터베이스 접근    │    │       JWT 토큰 생성/검증         │  │
│  └─────────────┬───────┘    └─────────────────────────────────┘  │
│                │                                                 │
│                ▼                                                 │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                H2 In-Memory Database                        │ │
│  │               (users 테이블)                                 │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## 🔄 API 통신 흐름

### 회원가입 플로우
```
브라우저                React                 Spring Boot              데이터베이스
   │                     │                        │                       │
   │  사용자 입력          │                        │                       │
   ├──────────────────►   │                        │                       │
   │                     │  POST /api/auth/register│                       │
   │                     ├────────────────────────►│                       │
   │                     │  {username, email, pwd} │                       │
   │                     │                        │  중복 확인              │
   │                     │                        ├──────────────────────►│
   │                     │                        │◄──────────────────────┤
   │                     │                        │  사용자 저장            │
   │                     │                        ├──────────────────────►│
   │                     │                        │◄──────────────────────┤
   │                     │                        │  JWT 토큰 생성          │
   │                     │                        │                       │
   │                     │  {token, username, msg}│                       │
   │                     │◄───────────────────────┤                       │
   │  성공 메시지 표시      │                        │                       │
   │◄──────────────────  │                        │                       │
```

### 로그인 플로우
```
브라우저                React                 Spring Boot              데이터베이스
   │                     │                        │                       │
   │  사용자 입력          │                        │                       │
   ├──────────────────►   │                        │                       │
   │                     │  POST /api/auth/login   │                       │
   │                     ├────────────────────────►│                       │
   │                     │  {username, password}   │                       │
   │                     │                        │  사용자 조회            │
   │                     │                        ├──────────────────────►│
   │                     │                        │◄──────────────────────┤
   │                     │                        │  비밀번호 검증          │
   │                     │                        │  JWT 토큰 생성          │
   │                     │                        │                       │
   │                     │  {token, username, msg}│                       │
   │                     │◄───────────────────────┤                       │
   │  성공 메시지 표시      │                        │                       │
   │◄──────────────────  │                        │                       │
```

## 📡 API 엔드포인트

### 🔐 인증 API

#### 회원가입
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "사용자명",
  "email": "이메일@example.com", 
  "password": "비밀번호"
}
```

**응답 (성공)**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "username": "사용자명",
  "message": "Registration successful"
}
```

**응답 (실패)**
```json
{
  "token": null,
  "username": null,
  "message": "Username already exists"
}
```

#### 로그인
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "사용자명",
  "password": "비밀번호"
}
```

**응답 (성공)**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "username": "사용자명", 
  "message": "Login successful"
}
```

**응답 (실패)**
```json
{
  "token": null,
  "username": null,
  "message": "Invalid credentials"
}
```

## 🛠️ 기술 스택

### 백엔드
- **Spring Boot 3.2.0** - 웹 프레임워크
- **Spring Security** - 보안 및 인증
- **Spring Data JPA** - 데이터 접근 계층
- **JWT (jjwt 0.11.5)** - 토큰 기반 인증
- **H2 Database** - 인메모리 데이터베이스
- **Maven** - 의존성 관리

### 프론트엔드
- **React 19.1.0** - UI 라이브러리
- **JavaScript (ES6+)** - 프로그래밍 언어
- **Fetch API** - HTTP 통신
- **CSS3** - 스타일링

## 🚀 실행 방법

### 1. 백엔드 실행
IDE에서 `AuthApplication.java` 파일을 실행하거나, 다음 명령어를 사용:
```bash
cd backend
mvn clean install
mvn spring-boot:run
```

### 2. 프론트엔드 실행
```bash
cd frontend
npm install
npm start
```

### 3. 접속
- **프론트엔드**: http://localhost:3000
- **백엔드 API**: http://localhost:8080
- **H2 데이터베이스 콘솔**: http://localhost:8080/h2-console

## 🔒 보안 기능

- **비밀번호 암호화**: BCrypt 해싱
- **JWT 토큰**: 24시간 유효기간
- **CORS 설정**: localhost:3000만 허용
- **입력 검증**: 필수 필드 검증
- **중복 방지**: 사용자명/이메일 중복 체크

## 📋 주요 특징

- ✅ 반응형 웹 디자인
- ✅ 실시간 폼 검증
- ✅ 토큰 기반 세션 관리
- ✅ 에러 핸들링 및 사용자 피드백
- ✅ RESTful API 설계
- ✅ 컴포넌트 기반 아키텍처

## 🎯 사용법

1. 브라우저에서 http://localhost:3000 접속
2. "회원가입" 탭에서 새 계정 생성
3. "로그인" 탭에서 계정으로 로그인
4. 성공 시 JWT 토큰이 localStorage에 저장됨