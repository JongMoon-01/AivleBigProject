# 🧠 AI 집중도 분석 시스템 사용 가이드

## 📋 시스템 개요
MobileNet 감정 분석과 L2CS-Net 시선 추적을 통합한 실시간 집중도 분석 시스템

## 🚀 빠른 시작

### 1. 시스템 시작
```bash
cd /workspace/AivleBigProject
./start_ai_system.sh
```

### 2. 시스템 종료
```bash
cd /workspace/AivleBigProject
./stop_ai_system.sh
```

## 📍 접속 URL

- **메인 대시보드**: https://3000-jongmoon01-aivlebigproj-nlz155kcbyd.ws-us121.gitpod.io/class/1/MyAttitude
- **AI 집중도 분석 직접 접속**: https://3000-jongmoon01-aivlebigproj-nlz155kcbyd.ws-us121.gitpod.io/integrated-analysis

## 🎯 사용 방법

1. **메인 대시보드에서 접속**
   - 메인 대시보드 우상단 `🧠 AI 집중도 분석` 버튼 클릭
   - 같은 창에서 AI 분석 페이지로 이동

2. **AI 집중도 분석 사용**
   - 웹캠 권한 허용
   - `통합 분석 시작` 버튼 클릭
   - 실시간 집중도 모니터링

## ⚙️ 기능 설명

### 분석 시스템
- **감정 분석**: MobileNet 기반 5가지 감정 분석 (집중, 졸음, 지루함, 혼란, 만족)
- **시선 추적**: L2CS-Net 기반 시선 방향 추적
- **통합 점수**: 동적 가중치를 적용한 최종 집중도 계산

### 가중치 조절
- 감정/시선 비율을 슬라이더로 실시간 조정 가능
- 기본값: 감정 60%, 시선 40%

### 집중도 레벨
- 매우 높음 (85점 이상)
- 높음 (70-85점)
- 보통 (50-70점)
- 낮음 (30-50점)
- 매우 낮음 (30점 미만)

## 🔧 문제 해결

### 서버가 시작되지 않는 경우
```bash
# 프로세스 확인
ps aux | grep -E "(uvicorn|react-scripts)"

# 수동으로 종료
pkill -f "uvicorn"
pkill -f "react-scripts"

# 다시 시작
./start_ai_system.sh
```

### 로그 확인
```bash
# FastAPI 백엔드 로그
tail -f /tmp/fastapi.log

# React 프론트엔드 로그
tail -f /tmp/react.log
```

### WebSocket 연결 실패
- 브라우저 새로고침 (F5)
- 브라우저 캐시 삭제 (Ctrl+Shift+Delete)
- 시크릿/프라이빗 모드에서 접속

## 📦 필요 패키지 (자동 설치됨)

### Backend (Python)
- FastAPI
- TensorFlow
- MediaPipe
- OpenCV
- Uvicorn

### Frontend (JavaScript)
- React
- react-webcam
- react-chartjs-2
- WebSocket API

## 🔒 보안 설정
- WebSocket은 HTTPS/WSS 자동 감지
- 동적 프로토콜 전환 구현
- CORS 설정 완료

## 📈 성능 최적화
- 실시간 분석: 초당 2-3프레임
- 차트 데이터: 최근 20개 포인트만 표시
- 히스토리: 최근 30개 기록만 메모리 유지

## 🎨 UI 특징
- 반응형 디자인
- 실시간 차트 (통합, 감정, 시선)
- 집중도 레벨별 색상 구분
- 통계 정보 실시간 업데이트

## 💡 팁
- 밝은 곳에서 사용 권장
- 카메라와 50-70cm 거리 유지
- 정면 응시 시 최적 성능

## 📝 주요 파일 경로

### Backend
- 메인 앱: `/workspace/AivleBigProject/attention-model-fastapi-service/app/main.py`
- 통합 분석기: `/workspace/AivleBigProject/attention-model-fastapi-service/app/ai/integrated_attention_analyzer.py`
- L2CS 시선 추적: `/workspace/AivleBigProject/attention-model-fastapi-service/app/ai/l2cs_gaze_tracker.py`

### Frontend
- 메인 대시보드: `/workspace/AivleBigProject/edtech-frontend/src/pages/MainDashboard.js`
- 통합 분석 페이지: `/workspace/AivleBigProject/edtech-frontend/src/pages/IntegratedAnalysisPage.js`
- 웹캠 컴포넌트: `/workspace/AivleBigProject/edtech-frontend/src/components/IntegratedWebcamAnalysis.js`

## 📞 지원
문제 발생 시 로그 파일과 함께 보고해주세요.