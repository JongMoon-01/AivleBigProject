#!/bin/bash

echo "🚀 AI 집중도 분석 시스템 시작 스크립트"
echo "========================================="

# 색상 코드 정의
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 1. FastAPI 백엔드 서버 시작
echo -e "${YELLOW}1. FastAPI 백엔드 서버 시작 중...${NC}"
cd /workspace/AivleBigProject/attention-model-fastapi-service

# 기존 프로세스 종료
pkill -f "uvicorn app.main:app" 2>/dev/null

# 백그라운드에서 FastAPI 서버 시작
nohup uvicorn app.main:app --host 0.0.0.0 --port 8000 > /tmp/fastapi.log 2>&1 &
BACKEND_PID=$!

# 서버 시작 대기
sleep 5

# FastAPI 서버 상태 확인
if ps -p $BACKEND_PID > /dev/null; then
    echo -e "${GREEN}✅ FastAPI 백엔드 서버 시작 완료 (PID: $BACKEND_PID)${NC}"
    echo "   URL: http://8000-jongmoon01-aivlebigproj-nlz155kcbyd.ws-us121.gitpod.io"
else
    echo -e "${RED}❌ FastAPI 백엔드 서버 시작 실패${NC}"
    echo "   로그 확인: tail -f /tmp/fastapi.log"
    exit 1
fi

# 2. React 프론트엔드 서버 시작
echo -e "${YELLOW}2. React 프론트엔드 서버 시작 중...${NC}"
cd /workspace/AivleBigProject/edtech-frontend

# 기존 프로세스 종료
pkill -f "react-scripts start" 2>/dev/null

# 백그라운드에서 React 서버 시작
nohup npm start > /tmp/react.log 2>&1 &
FRONTEND_PID=$!

# 서버 시작 대기
echo "   React 서버 시작 중... (약 30초 소요)"
sleep 30

# React 서버 상태 확인
if ps -p $FRONTEND_PID > /dev/null; then
    echo -e "${GREEN}✅ React 프론트엔드 서버 시작 완료 (PID: $FRONTEND_PID)${NC}"
    echo "   URL: https://3000-jongmoon01-aivlebigproj-nlz155kcbyd.ws-us121.gitpod.io"
else
    echo -e "${RED}❌ React 프론트엔드 서버 시작 실패${NC}"
    echo "   로그 확인: tail -f /tmp/react.log"
    exit 1
fi

echo ""
echo "========================================="
echo -e "${GREEN}🎉 AI 집중도 분석 시스템 시작 완료!${NC}"
echo "========================================="
echo ""
echo "📍 접속 URL:"
echo "   - 메인 대시보드: https://3000-jongmoon01-aivlebigproj-nlz155kcbyd.ws-us121.gitpod.io/class/1/MyAttitude"
echo "   - AI 집중도 분석: https://3000-jongmoon01-aivlebigproj-nlz155kcbyd.ws-us121.gitpod.io/integrated-analysis"
echo ""
echo "📌 사용 방법:"
echo "   1. 메인 대시보드에서 우상단 '🧠 AI 집중도 분석' 버튼 클릭"
echo "   2. 웹캠 권한 허용"
echo "   3. '통합 분석 시작' 버튼 클릭"
echo ""
echo "🔧 서버 상태 확인:"
echo "   - FastAPI 로그: tail -f /tmp/fastapi.log"
echo "   - React 로그: tail -f /tmp/react.log"
echo ""
echo "⛔ 서버 종료:"
echo "   - ./stop_ai_system.sh"