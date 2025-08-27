#!/bin/bash

echo "AI 기반 에듀테크 플랫폼 서비스 시작..."

# FastAPI 서버 시작 (백그라운드)
echo "FastAPI 서버 시작 중..."
cd attention-model-fastapi-service
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 &
FASTAPI_PID=$!
cd ..

# React 프론트엔드 시작
echo "React 프론트엔드 시작 중..."
cd edtech-frontend
npm start &
REACT_PID=$!
cd ..

echo "=================================="
echo "서비스가 시작되었습니다!"
echo "=================================="
echo "FastAPI 서버: http://localhost:8000"
echo "API 문서: http://localhost:8000/docs"
echo "React 프론트엔드: http://localhost:3000"
echo "웹캠 분석 페이지: http://localhost:3000/webcam-analysis"
echo "=================================="
echo ""
echo "종료하려면 Ctrl+C를 누르세요."

# 종료 시그널 처리
trap "echo '서비스 종료 중...'; kill $FASTAPI_PID $REACT_PID; exit" INT TERM

# 프로세스 대기
wait