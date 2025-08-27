# AI 통합 집중도 분석 시스템 - 사용법

## 🚀 빠른 시작

### 1. 시스템 시작
```bash
# 프로젝트 루트 디렉토리에서 실행
./start_integrated_system.sh
```

### 2. 시스템 중지
```bash
./stop_integrated_system.sh
```

### 3. 상태 확인
```bash
./check_system_status.sh
```

---

## 📱 접속 URL

- **메인 페이지**: http://localhost:3000
- **통합 분석 페이지**: http://localhost:3000/integrated-analysis
- **API 문서**: http://localhost:8000/docs
- **API 상태**: http://localhost:8000/health

---

## 🎯 주요 기능

### 1. 통합 집중도 분석
- **실시간 얼굴 인식**: MediaPipe 기반 얼굴 검출
- **감정 분석**: MobileNet 기반 5가지 감정 상태 인식
- **시선 추적**: L2CS-Net 기반 시선 방향 분석
- **통합 점수**: 가중 평균으로 최종 집중도 계산

### 2. 프라이버시 보호
- **모자이크 기능**: 얼굴 영역을 모자이크 처리하여 프라이버시 보호
- **분석 유지**: 모자이크 상태에서도 정상적인 분석 수행

### 3. 실시간 시각화
- **바운딩 박스**: 실시간 얼굴 추적 표시
- **점수 표시**: 통합 집중도 및 개별 분석 결과
- **감정 그래프**: 각 감정별 확률 시각화

---

## ⚙️ 시스템 요구사항

### 소프트웨어
- **Python 3.8+** (백엔드)
- **Node.js 14+** (프론트엔드)
- **웹카메라** (실시간 분석용)

### 하드웨어 권장사양
- **CPU**: 4코어 이상
- **RAM**: 8GB 이상
- **GPU**: 선택사항 (CUDA 지원 시 성능 향상)

---

## 📊 사용 방법

### 1. 기본 사용법
1. 시스템 시작: `./start_integrated_system.sh`
2. 브라우저에서 http://localhost:3000/integrated-analysis 접속
3. "통합 분석 시작" 버튼 클릭
4. 웹캠 권한 허용
5. 실시간 집중도 분석 확인

### 2. 모자이크 기능 (데모용)
1. 분석 시작 후 "👤 모자이크 꺼짐" 버튼 클릭
2. 얼굴이 모자이크 처리되어 표시됨
3. 분석 결과는 정상적으로 출력됨

### 3. 가중치 조정
1. 감정 가중치와 시선 가중치 슬라이더 조정
2. "가중치 적용" 버튼 클릭
3. 조정된 가중치로 집중도 재계산

---

## 🛠️ 문제 해결

### 자주 발생하는 문제

#### 1. 포트 이미 사용 중
```bash
# 강제 중지 후 재시작
./stop_integrated_system.sh
./start_integrated_system.sh
```

#### 2. 웹캠 권한 문제
- 브라우저 설정에서 카메라 권한 허용
- HTTPS가 아닌 localhost에서도 권한 필요

#### 3. 모델 파일 누락
- `Mobilenet_model_trained.keras` 파일 확인
- `extracted_models/2. 학습 모델 파일/l2cs_trained.pkl` 파일 확인

#### 4. 느린 분석 속도
- GPU 사용 가능 시 CUDA 설치
- 브라우저 탭 수 줄이기
- 다른 응용프로그램 종료

### 로그 확인
```bash
# 백엔드 로그
tail -f logs/backend.log

# 프론트엔드 로그  
tail -f logs/frontend.log
```

---

## 📁 주요 파일 구조

```
AivleBigProject/
├── start_integrated_system.sh      # 시작 스크립트
├── stop_integrated_system.sh       # 중지 스크립트
├── check_system_status.sh          # 상태 확인 스크립트
├── AI_SYSTEM_MODEL_OVERVIEW.md     # 모델 기술 문서
├── README_USAGE.md                 # 사용법 (이 파일)
├── Mobilenet_model_trained.keras   # 감정 인식 모델
├── extracted_models/               # 추출된 모델들
├── attention-model-fastapi-service/ # 백엔드 서비스
├── edtech-frontend/                # 프론트엔드 서비스
└── logs/                           # 로그 파일들
```

---

## 🔧 개발자 정보

### 포트 정보
- **프론트엔드**: 3000
- **백엔드**: 8000

### API 엔드포인트
- `GET /health`: 서버 상태 확인
- `POST /api/analyze-integrated`: 통합 분석
- `POST /api/analyze-emotion`: 감정 분석  
- `POST /api/analyze-gaze`: 시선 분석

### 환경 변수
- 필요 시 `.env` 파일에서 설정 가능
- 기본 설정으로도 정상 작동

---

## 📞 지원

문제가 발생하거나 질문이 있으시면:
1. `./check_system_status.sh`로 시스템 상태 먼저 확인
2. 로그 파일 확인 (`logs/` 디렉토리)
3. 시스템 재시작 시도

---

*마지막 업데이트: 2025-08-25*