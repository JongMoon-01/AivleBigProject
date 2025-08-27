# AI 기반 학습 태도 분석 서비스

MobileNet 모델을 활용한 실시간 웹캠 기반 학습 태도 및 감정 분석 서비스입니다.

## 주요 기능

- **실시간 감정 분석**: MobileNet V3 모델을 사용한 5가지 감정 상태 분류 (집중, 졸음, 지루함, 혼란, 만족)
- **집중도 점수 계산**: 감정 상태를 기반으로 0-100점 스케일의 집중도 점수 제공
- **WebSocket 실시간 통신**: 5초 간격 자동 분석
- **REST API 지원**: 단일 프레임 분석 및 통계 조회
- **분석 히스토리 관리**: 세션별 분석 결과 저장 및 조회

## 설치 방법

### 1. 필요 패키지 설치

```bash
pip install -r requirements.txt
```

### 2. 모델 파일 준비

MobileNet 학습 모델 파일(`Mobilenet_model.h5`)을 프로젝트 루트 디렉토리에 배치합니다.

### 3. 서버 실행

```bash
cd attention-model-fastapi-service
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## API 엔드포인트

### REST API

#### 단일 프레임 분석
```
POST /api/mobilenet/analyze
```

요청 본문:
```json
{
  "base64_image": "data:image/jpeg;base64,...",
  "user_id": "student1",
  "session_id": "session_123"
}
```

응답:
```json
{
  "timestamp": "2024-08-24T10:30:00",
  "emotion": "집중",
  "confidence": 0.85,
  "attention_score": 85,
  "face_detected": true,
  "emotion_scores": {
    "집중": 0.85,
    "만족": 0.10,
    "혼란": 0.03,
    "지루함": 0.01,
    "졸음": 0.01
  }
}
```

#### 분석 히스토리 조회
```
GET /api/mobilenet/history?user_id=student1&limit=100
```

#### 통계 정보 조회
```
GET /api/mobilenet/statistics?user_id=student1
```

응답:
```json
{
  "total_analyses": 150,
  "average_attention": 72.5,
  "emotion_distribution": {
    "집중": 60.0,
    "만족": 20.0,
    "혼란": 10.0,
    "지루함": 7.0,
    "졸음": 3.0
  },
  "face_detection_rate": 95.5
}
```

### WebSocket API

#### 실시간 분석 연결
```
WS /api/ws/mobilenet/{client_id}
```

메시지 형식:

클라이언트 → 서버:
```json
{
  "type": "frame",
  "base64_image": "data:image/jpeg;base64,...",
  "session_id": "session_123"
}
```

서버 → 클라이언트:
```json
{
  "type": "analysis_result",
  "timestamp": "2024-08-24T10:30:00",
  "emotion": "집중",
  "confidence": 0.85,
  "attention_score": 85,
  "face_detected": true,
  "emotion_scores": {...},
  "focus_level": "매우 집중"
}
```

## 프론트엔드 통합

React 애플리케이션에서 웹캠 분석 페이지 접근:

```
http://localhost:3000/webcam-analysis
```

## 감정 분류 및 집중도 매핑

| 감정 상태 | 집중도 점수 | 집중도 레벨 |
|---------|----------|-----------|
| 집중 | 100 | 매우 집중 |
| 만족 | 80 | 집중 |
| 혼란 | 60 | 보통 |
| 지루함 | 40 | 산만 |
| 졸음 | 20 | 매우 산만 |

## 주의사항

- 웹캠 권한이 필요합니다
- 얼굴이 명확히 보여야 정확한 분석이 가능합니다
- 조명이 적절해야 얼굴 감지가 잘 작동합니다
- Chrome, Edge, Firefox 등 최신 브라우저 사용을 권장합니다

## 문제 해결

### 모델 파일을 찾을 수 없는 경우
`Mobilenet_model.h5` 파일이 올바른 경로에 있는지 확인하세요.

### WebSocket 연결 실패
- CORS 설정 확인
- 방화벽 설정 확인
- 서버가 실행 중인지 확인

### 얼굴 감지 실패
- 카메라 각도 조정
- 조명 개선
- 카메라와의 거리 조정 (50-100cm 권장)