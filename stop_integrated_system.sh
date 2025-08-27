#!/bin/bash

# AI 통합 집중도 분석 시스템 중지 스크립트
echo "🛑 AI 통합 집중도 분석 시스템을 중지합니다..."

# PID 파일에서 프로세스 ID 읽기
if [ -f "logs/backend.pid" ]; then
    BACKEND_PID=$(cat logs/backend.pid)
    if ps -p $BACKEND_PID > /dev/null 2>&1; then
        echo "🤖 백엔드 서버 중지 중... (PID: $BACKEND_PID)"
        kill $BACKEND_PID
        sleep 2
        if ps -p $BACKEND_PID > /dev/null 2>&1; then
            echo "⚠️  강제 종료 중..."
            kill -9 $BACKEND_PID
        fi
    fi
    rm -f logs/backend.pid
fi

if [ -f "logs/frontend.pid" ]; then
    FRONTEND_PID=$(cat logs/frontend.pid)
    if ps -p $FRONTEND_PID > /dev/null 2>&1; then
        echo "🎨 프론트엔드 서버 중지 중... (PID: $FRONTEND_PID)"
        kill $FRONTEND_PID
        sleep 2
        if ps -p $FRONTEND_PID > /dev/null 2>&1; then
            echo "⚠️  강제 종료 중..."
            kill -9 $FRONTEND_PID
        fi
    fi
    rm -f logs/frontend.pid
fi

# 포트를 사용하는 모든 프로세스 종료 (안전장치)
echo "🔍 포트 정리 중..."
pkill -f "uvicorn.*8000" 2>/dev/null || true
pkill -f "npm start" 2>/dev/null || true

# 포트 사용 확인
if lsof -ti:8000 > /dev/null 2>&1; then
    echo "⚠️  포트 8000이 여전히 사용 중입니다."
    lsof -ti:8000 | xargs kill -9 2>/dev/null || true
fi

if lsof -ti:3000 > /dev/null 2>&1; then
    echo "⚠️  포트 3000이 여전히 사용 중입니다."
    lsof -ti:3000 | xargs kill -9 2>/dev/null || true
fi

echo ""
echo "✅ 시스템이 성공적으로 중지되었습니다."
echo "📋 다시 시작하려면: ./start_integrated_system.sh"