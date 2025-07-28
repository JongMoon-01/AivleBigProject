# EdTech Platform

교육 기술 플랫폼으로, 관리자와 학생을 위한 웹 기반 학습 관리 시스템입니다.

## 📋 프로젝트 개요

이 프로젝트는 교육 기관에서 사용할 수 있는 종합적인 EdTech 플랫폼으로, 관리자의 학생 관리 기능과 학생의 학습 추적 기능을 제공합니다.

## 🏗️ 아키텍처

### Frontend (React)
- **Framework**: React 19.1.0
- **Styling**: TailwindCSS 3.4.17
- **Routing**: React Router DOM 7.6.3
- **HTTP Client**: Axios 1.10.0
- **UI Components**: React Calendar, Framer Motion

### Backend (Spring Boot)
- **Framework**: Spring Boot 3.5.3
- **Language**: Java 17
- **Database**: MySQL 8.0 (이전에는 MariaDB)
- **Security**: Spring Security + JWT
- **ORM**: Spring Data JPA with Hibernate

## 🚀 주요 기능

### 🔐 인증 시스템
- JWT 기반 인증
- 역할 기반 접근 제어 (관리자/학생)
- 관리자의 학생 권한 위임 기능

### 👨‍💼 관리자 기능
- 학생 계정 조회 및 관리
- 학생 권한으로 시스템 접근 (Impersonation)
- 관리자 전용 대시보드

### 👨‍🎓 학생 기능
- 개인 대시보드
- 강의 목록 및 상세 보기
- 학습 캘린더
- 게시판 기능

### 📚 교육 관리
- 강의 목록 관리
- 강의별 상세 정보
- 학습 진도 추적
- 캘린더 기반 일정 관리

## 📁 프로젝트 구조

```
AivleBigProject/
├── edtech-frontend/          # React 프론트엔드
│   ├── src/
│   │   ├── components/       # 재사용 가능한 컴포넌트
│   │   │   ├── Header.js
│   │   │   ├── Sidebar.js
│   │   │   ├── CourseTable.js
│   │   │   └── ...
│   │   ├── pages/           # 페이지 컴포넌트
│   │   │   ├── LoginPage.js
│   │   │   ├── AdminDashboard.js
│   │   │   ├── HomePage.js
│   │   │   └── ...
│   │   ├── context/         # React Context
│   │   │   └── AuthContext.js
│   │   └── api/             # API 통신
│   │       └── axiosInstance.js
│   └── public/
└── edtech-backend/          # Spring Boot 백엔드
    └── src/main/java/com/edtech/edtech_backend/
        ├── controller/      # REST 컨트롤러
        ├── service/         # 비즈니스 로직
        ├── entity/          # JPA 엔티티
        ├── repository/      # 데이터 접근 계층
        ├── dto/             # 데이터 전송 객체
        ├── security/        # 보안 설정
        └── config/          # 설정 클래스
```

## 🛠️ 설치 및 실행

### 사전 요구사항
- Node.js 16+ 
- Java 17+
- MySQL 8.0
- npm 또는 yarn

### Backend 설정

1. MySQL 데이터베이스 생성:
```sql
CREATE DATABASE edtech;
```

2. 애플리케이션 설정 (`application.yaml`):
```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/edtech?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
    username: root
    password: your_password
    driver-class-name: com.mysql.cj.jdbc.Driver
```

3. 백엔드 실행:
```bash
cd edtech-backend
./gradlew bootRun
```

### Frontend 설정

1. 의존성 설치:
```bash
cd edtech-frontend
npm install
```

2. 개발 서버 실행:
```bash
npm start
```

애플리케이션이 http://localhost:3000에서 실행됩니다.

## 🔧 개발 스크립트

### Frontend
```bash
npm start          # 개발 서버 실행
npm build          # 프로덕션 빌드
npm test           # 테스트 실행
```

### Backend
```bash
./gradlew bootRun  # 애플리케이션 실행
./gradlew test     # 테스트 실행
./gradlew build    # 빌드
```

## 🔐 보안 특징

- **JWT 토큰 인증**: 안전한 stateless 인증
- **역할 기반 접근 제어**: 관리자/학생 권한 분리
- **안전한 권한 위임**: 관리자가 학생 권한으로 안전하게 전환
- **CORS 설정**: 프론트엔드-백엔드 간 안전한 통신

## 🌟 주요 특징

### 권한 위임 시스템
- 관리자는 학생의 권한을 위임받아 학생 시점에서 시스템을 확인할 수 있습니다
- 위임 상태에서 "관리자 모드로 돌아가기" 버튼으로 언제든 원래 권한으로 복귀 가능
- 로그아웃 시 위임 정보가 자동으로 정리되어 보안상 안전합니다

### 반응형 디자인
- TailwindCSS를 사용한 모바일 친화적 반응형 UI
- 다크모드 지원 준비

### 확장 가능한 구조
- 컴포넌트 기반 설계로 재사용성 높음
- RESTful API 설계로 확장성 보장

## 🚧 향후 개발 계획

- [ ] 코스별 관리자/학생 페이지 분기 시스템
- [ ] 실시간 알림 시스템
- [ ] 파일 업로드/다운로드 기능
- [ ] 성적 관리 시스템
- [ ] 모바일 앱 지원

## 📝 라이선스

이 프로젝트는 개발용으로 제작되었습니다.

## 👥 기여

프로젝트에 기여하고 싶으시다면:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

---

**개발 환경**: Windows 11, Java 17, Node.js 16+, MySQL 8.0