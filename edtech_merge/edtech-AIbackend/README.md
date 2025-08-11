# Edtech AI Backend

교육 콘텐츠 기반 AI 퀴즈 생성 서비스의 백엔드 애플리케이션입니다.

## 프로젝트 개요

이 프로젝트는 VTT 자막 파일에서 텍스트를 추출하고, OpenAI GPT를 활용하여 교육용 퀴즈를 자동으로 생성하는 Spring Boot 기반 백엔드 서비스입니다.

## 주요 기능

- **VTT 자막 파일 파싱**: 강의 영상의 자막 파일에서 텍스트 콘텐츠 추출
- **AI 기반 퀴즈 생성**: OpenAI GPT-3.5를 활용한 객관식 퀴즈 자동 생성
- **자막 텍스트 교정**: 음성 인식 오류 자동 수정
- **퀴즈 제출 및 채점**: 사용자 답안 검증 및 점수 계산
- **CORS 지원**: 프론트엔드 애플리케이션과의 원활한 통신

## 기술 스택

- **Framework**: Spring Boot 2.7.18
- **Language**: Java 11
- **Build Tool**: Gradle 7.6.1
- **AI Integration**: OpenAI GPT-3.5 Turbo
- **PDF Processing**: Apache PDFBox 2.0.29
- **JSON Processing**: Jackson
- **Code Enhancement**: Lombok

## API 엔드포인트

### 1. 한국사 퀴즈 생성
```
POST /api/quiz/korean-history
```
한국사 강의 자막을 기반으로 5개의 객관식 퀴즈를 생성합니다.

### 2. 선형대수학 퀴즈 생성
```
POST /api/quiz/linear-algebra
```
선형대수학 강의 자막을 기반으로 5개의 객관식 퀴즈를 생성합니다.

### 3. 퀴즈 제출
```
POST /api/quiz/submit
```
사용자의 퀴즈 답안을 제출하고 채점 결과를 받습니다.

**Request Body:**
```json
{
  "courseType": "korean-history",
  "answers": {
    "quiz-id-1": 0,
    "quiz-id-2": 2
  }
}
```

**Response:**
```json
{
  "totalQuestions": 5,
  "correctAnswers": 3,
  "score": 60.0
}
```

### 4. 헬스 체크
```
GET /api/quiz/health
```
서비스 상태를 확인합니다.

## 프로젝트 구조

```
edtech-AIbackend/
├── src/
│   ├── main/
│   │   ├── java/com/edtech/edtech_aibackend/
│   │   │   ├── config/
│   │   │   │   ├── CorsConfig.java         # CORS 설정
│   │   │   │   ├── JacksonConfig.java      # JSON 처리 설정
│   │   │   │   └── OpenAIConfig.java       # OpenAI 클라이언트 설정
│   │   │   ├── controller/
│   │   │   │   └── QuizController.java     # REST API 컨트롤러
│   │   │   ├── model/
│   │   │   │   ├── Quiz.java               # 퀴즈 데이터 모델
│   │   │   │   ├── QuizResponse.java       # 퀴즈 응답 모델
│   │   │   │   ├── QuizResult.java         # 퀴즈 결과 모델
│   │   │   │   └── QuizSubmission.java     # 퀴즈 제출 모델
│   │   │   ├── service/
│   │   │   │   ├── ContentExtractionService.java  # 콘텐츠 추출 서비스
│   │   │   │   └── QuizGenerationService.java     # 퀴즈 생성 서비스
│   │   │   └── EdtechAiBackendApplication.java   # 메인 애플리케이션
│   │   └── resources/
│   │       ├── application.yaml            # 애플리케이션 설정
│   │       ├── vtt/
│   │       │   ├── korean_history.vtt      # 한국사 강의 자막
│   │       │   └── linear_algebra.vtt      # 선형대수학 강의 자막
│   │       └── pdf/                        # PDF 파일 저장 디렉토리
├── build.gradle                            # Gradle 빌드 설정
└── settings.gradle                         # Gradle 프로젝트 설정
```

## 설치 및 실행 방법

### 1. 필수 사항
- Java 11 이상
- Gradle 7.6.1 이상
- OpenAI API 키

### 2. 환경 설정

#### 방법 1: 환경 변수 설정 (권장)
```bash
# Windows
set OPENAI_API_KEY=your-actual-api-key-here

# Mac/Linux
export OPENAI_API_KEY=your-actual-api-key-here
```

#### 방법 2: application.yaml 파일 직접 수정
`src/main/resources/application.yaml` 파일에서:
```yaml
openai:
  api:
    key: your-actual-api-key-here  # 여기에 실제 API 키 입력
```

### 3. 빌드
```bash
./gradlew build
```

### 4. 실행
```bash
./gradlew bootRun
```

애플리케이션은 기본적으로 `http://localhost:8081`에서 실행됩니다.

## 주요 기능 상세

### VTT 파일 처리
- WebVTT 포맷의 자막 파일을 파싱하여 텍스트 콘텐츠 추출
- 타임스탬프, 큐 식별자 등 메타데이터 제거
- 연속된 텍스트로 병합

### AI 퀴즈 생성 프로세스
1. VTT 파일에서 텍스트 추출
2. 음성 인식 오류 교정 (GPT-3.5 활용)
3. 텍스트를 적절한 크기로 청킹
4. 청크된 콘텐츠 기반으로 퀴즈 생성 프롬프트 작성
5. GPT-3.5를 통해 5개의 4지선다 퀴즈 생성
6. JSON 형식으로 파싱 및 응답

### 퀴즈 캐싱
- 생성된 퀴즈는 메모리에 캐싱되어 채점 시 활용
- 각 퀴즈는 고유 ID로 식별

## 개발자 참고사항

- CORS는 현재 `http://localhost:3000`에 대해 허용되어 있습니다
- 로깅 레벨은 INFO로 설정되어 있습니다
- PDF 파일 처리 기능도 구현되어 있으나 현재는 VTT 파일만 사용 중입니다

## 라이선스

이 프로젝트는 내부 교육 목적으로 개발되었습니다.