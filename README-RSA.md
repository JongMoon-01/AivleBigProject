# RSA 암호화 적용 가이드

RSA 공개키 암호화 방식이 로그인/회원가입 시스템에 추가되었습니다.

## 변경 사항

### 백엔드
1. **RSAService.java** - RSA 키 페어 생성 및 복호화 서비스
2. **PublicKeyResponse.java** - 공개키 응답 DTO
3. **AuthController.java** - `/api/auth/public-key` 엔드포인트 추가
4. **AuthService.java** - 암호화된 비밀번호 복호화 로직 추가
5. **LoginRequest.java, RegisterRequest.java** - `encryptedPassword` 필드 추가

### 프론트엔드
1. **jsencrypt** 라이브러리 설치
2. **rsaEncrypt.js** - RSA 암호화 유틸리티 함수
3. **Login.js, Register.js** - 비밀번호 암호화 후 전송

## 동작 방식

1. 클라이언트가 로그인/회원가입 시도 시 서버로부터 RSA 공개키를 요청
2. 서버는 Base64로 인코딩된 RSA 공개키 반환
3. 클라이언트는 JSEncrypt를 사용해 비밀번호를 암호화
4. 암호화된 비밀번호를 `encryptedPassword` 필드로 전송
5. 서버는 개인키로 복호화 후 BCrypt로 해싱하여 저장/검증

## 실행 방법

### 백엔드 (Spring Boot)
IDE에서 `backend/src/main/java/com/example/auth/AuthApplication.java`를 실행

### 프론트엔드 (React)
```bash
cd frontend
npm start
```

## 보안 개선 사항

- 비밀번호가 네트워크를 통해 평문으로 전송되지 않음
- RSA 2048비트 키 사용
- 기존 BCrypt 해싱과 함께 이중 보안 제공

## 주의 사항

- 프로덕션 환경에서는 HTTPS 사용 필수
- RSA 키는 주기적으로 갱신 권장
- JWT 시크릿 키를 환경변수로 관리 필요