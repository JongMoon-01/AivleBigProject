# EdTech AI Backend

퀴즈 생성을 위한 AI 백엔드 서버입니다.

## 설정

### OpenAI API 키 설정

1. OpenAI API 키가 필요합니다. https://platform.openai.com/api-keys 에서 발급받으세요.

2. 다음 중 하나의 방법으로 API 키를 설정하세요:

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

## 실행 방법

### 1. AI 백엔드 서버 실행 (포트 8081)
```bash
cd edtech-AIbackend
./gradlew bootRun
```

### 2. 메인 백엔드 서버 실행 (포트 8080)
```bash
cd ../edtech-backend
./gradlew bootRun
```

### 3. 프론트엔드 실행 (포트 3000)
```bash
cd ../edtech-frontend
npm install
npm start
```

## 기능

- AICE 대비 강좌 퀴즈 생성
- 한화에어로스페이스 취업 대비 강좌 퀴즈 생성
- PDF 문서 기반 RAG 기술을 활용한 퀴즈 생성
- 5문제 객관식 4지선다형 퀴즈
- 퀴즈 결과 채점 및 피드백

## API 엔드포인트

- `POST /api/quiz/aice` - AICE 퀴즈 생성
- `POST /api/quiz/hanwha` - 한화에어로스페이스 퀴즈 생성
- `POST /api/quiz/submit` - 퀴즈 답안 제출 및 채점
- `GET /api/quiz/health` - 서버 상태 확인