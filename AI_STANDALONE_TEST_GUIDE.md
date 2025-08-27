# AI 집중도 분석 시스템 - 독립 실행 가이드

## 🎯 시스템 개요
MobileNet과 L2CS를 활용한 AI 기반 실시간 집중도 분석 시스템입니다.
- **감정 인식**: MobileNet 모델을 통한 5가지 감정 상태 분류
- **시선 추적**: L2CS-Net 모델을 통한 시선 각도 분석
- **통합 분석**: 감정과 시선 정보를 결합한 집중도 점수 산출

## 📋 필수 요구사항
- Python 3.8 이상
- 웹캠 (테스트용)
- 최소 4GB RAM
- Chrome, Firefox, Edge 등 최신 브라우저

## 🚀 AI 시스템만 독립 실행하기

### 1. 필요 패키지 설치
```bash
cd attention-model-fastapi-service
pip install -r requirements.txt
```

### 2. AI 서버 실행
```bash
# FastAPI 서버 시작 (포트 8000)
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 3. API 테스트

#### 방법 1: 브라우저에서 Swagger UI 접속
```
http://localhost:8000/docs
```

#### 방법 2: curl 명령으로 테스트
```bash
# 헬스체크
curl http://localhost:8000/health

# 감정 분석 테스트 (Base64 이미지 필요)
curl -X POST "http://localhost:8000/api/mobilenet/analyze" \
  -H "Content-Type: application/json" \
  -d '{"base64_image": "data:image/jpeg;base64,YOUR_BASE64_IMAGE", "user_id": "test_user", "session_id": "test_session"}'

# 통합 집중도 분석 테스트
curl -X POST "http://localhost:8000/api/integrated/analyze" \
  -H "Content-Type: application/json" \
  -d '{"base64_image": "data:image/jpeg;base64,YOUR_BASE64_IMAGE", "user_id": "test_user", "session_id": "test_session"}'
```

#### 방법 3: Python 스크립트로 테스트
```python
import requests
import base64
import cv2

# 웹캠에서 이미지 캡처
cap = cv2.VideoCapture(0)
ret, frame = cap.read()
cap.release()

# Base64 인코딩
_, buffer = cv2.imencode('.jpg', frame)
base64_image = base64.b64encode(buffer).decode('utf-8')

# API 호출
url = "http://localhost:8000/api/integrated/analyze"
data = {
    "base64_image": f"data:image/jpeg;base64,{base64_image}",
    "user_id": "test_user",
    "session_id": "test_session"
}

response = requests.post(url, json=data)
print(response.json())
```

## 🧪 전체 시스템 테스트 (프론트엔드 포함)

### 1. 전체 시스템 실행
```bash
# 프로젝트 루트에서 실행
./start_integrated_system.sh
```

### 2. 웹 인터페이스 접속
```
http://localhost:3000/integrated-analysis
```

### 3. 시스템 상태 확인
```bash
./check_system_status.sh
```

### 4. 시스템 종료
```bash
./stop_integrated_system.sh
```

## 📁 핵심 파일 구조
```
attention-model-fastapi-service/
├── app/
│   ├── main.py                              # FastAPI 메인 서버
│   ├── ai/
│   │   ├── mobilenet_processor.py           # MobileNet 감정 분석
│   │   ├── l2cs_gaze_tracker.py            # L2CS 시선 추적
│   │   └── integrated_attention_analyzer.py # 통합 분석기
│   └── routers/
│       ├── mobilenet.py                     # MobileNet API 엔드포인트
│       └── integrated_attention.py          # 통합 분석 API
├── requirements.txt                         # Python 의존성
└── README.md                                # 상세 문서

Mobilenet_model_trained.keras                # 감정 인식 모델 파일
extracted_models/
└── 2. 학습 모델 파일/
    └── l2cs_trained.pkl                    # 시선 추적 모델 파일
```

## 🔍 주요 API 엔드포인트

### 감정 분석 (MobileNet)
- `POST /api/mobilenet/analyze` - 단일 프레임 감정 분석
- `GET /api/mobilenet/history` - 분석 히스토리 조회
- `GET /api/mobilenet/statistics` - 통계 정보 조회

### 통합 집중도 분석
- `POST /api/integrated/analyze` - 감정+시선 통합 분석
- `GET /api/integrated/history` - 통합 분석 히스토리
- `GET /api/integrated/statistics` - 통합 통계 정보

### WebSocket (실시간)
- `WS /api/ws/mobilenet/{client_id}` - 실시간 감정 분석
- `WS /api/ws/integrated/{client_id}` - 실시간 통합 분석

## 📊 출력 데이터 형식

### 감정 분석 결과
```json
{
  "timestamp": "2025-08-27T10:30:00",
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

### 통합 분석 결과
```json
{
  "timestamp": "2025-08-27T10:30:00",
  "integrated_attention_score": 82.5,
  "attention_level": "높음",
  "emotion_data": {
    "emotion": "집중",
    "confidence": 0.85,
    "emotion_based_attention": 85
  },
  "gaze_data": {
    "yaw": -5.2,
    "pitch": 3.1,
    "gaze_attention_score": 78.5
  },
  "face_detected": true,
  "processing_time": 0.125
}
```

## 🐛 문제 해결

### 모델 파일 오류
```bash
# 모델 파일 위치 확인
ls -la Mobilenet_model_trained.keras
ls -la extracted_models/2.\ 학습\ 모델\ 파일/l2cs_trained.pkl
```

### 패키지 설치 오류
```bash
# Python 버전 확인 (3.8 이상 필요)
python --version

# 가상환경 사용 권장
python -m venv venv
source venv/bin/activate  # Linux/Mac
# 또는
venv\Scripts\activate  # Windows

pip install -r attention-model-fastapi-service/requirements.txt
```

### 포트 충돌
```bash
# 8000 포트 사용 중인 프로세스 확인
lsof -i :8000  # Linux/Mac
netstat -ano | findstr :8000  # Windows

# 다른 포트로 실행
uvicorn app.main:app --port 8001
```

## 📝 성능 지표
- **처리 속도**: 단일 프레임 약 100-150ms
- **정확도**: 감정 인식 85%, 시선 추적 80%
- **메모리 사용량**: 약 500MB-1GB
- **CPU 사용률**: 평균 20-30%

## 🔗 참고 자료
- [MobileNet 논문](https://arxiv.org/abs/1704.04861)
- [L2CS-Net 논문](https://arxiv.org/abs/2203.03339)
- [FastAPI 문서](https://fastapi.tiangolo.com)
- [프로젝트 전체 README](AI_SYSTEM_README.md)
- [모델 상세 설명](AI_SYSTEM_MODEL_OVERVIEW.md)

---
*작성일: 2025-08-27*
*버전: 1.0*