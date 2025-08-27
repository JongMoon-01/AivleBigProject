#!/bin/bash

# AI 통합 집중도 분석 시스템 시작 스크립트
echo "🚀 AI 통합 집중도 분석 시스템을 시작합니다..."

# 현재 디렉토리 확인
if [ ! -f "start_integrated_system.sh" ]; then
    echo "❌ 오류: 프로젝트 루트 디렉토리에서 실행해주세요."
    exit 1
fi

# 포트 사용 중인지 확인 및 종료
echo "📋 기존 서비스 확인 중..."
if lsof -ti:3000 > /dev/null; then
    echo "⚠️  포트 3000이 사용 중입니다. 기존 프로세스를 종료합니다."
    pkill -f "npm start" || true
    sleep 2
fi

if lsof -ti:8000 > /dev/null; then
    echo "⚠️  포트 8000이 사용 중입니다. 기존 프로세스를 종료합니다."
    pkill -f "uvicorn" || true
    sleep 2
fi

# 가상환경 활성화 (필요한 경우)
if [ -d "venv" ]; then
    echo "🐍 Python 가상환경을 활성화합니다."
    source venv/bin/activate
fi

# 백엔드 서버 시작 (백그라운드)
echo "🤖 FastAPI 백엔드 서버를 시작합니다..."
cd attention-model-fastapi-service
nohup uvicorn app.main:app --reload --port 8000 > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
cd ..

# 로그 디렉토리 생성
mkdir -p logs

# 백엔드 서버가 시작될 때까지 대기
echo "⏳ 백엔드 서버 시작 대기 중..."
for i in {1..30}; do
    if curl -s http://localhost:8000/health > /dev/null 2>&1; then
        echo "✅ 백엔드 서버가 정상적으로 시작되었습니다."
        break
    fi
    if [ $i -eq 30 ]; then
        echo "❌ 백엔드 서버 시작에 실패했습니다."
        echo "로그를 확인하세요: tail -f logs/backend.log"
        exit 1
    fi
    sleep 1
done

# 프론트엔드 서버 시작 (백그라운드)
echo "🎨 React 프론트엔드 서버를 시작합니다..."
cd edtech-frontend
nohup npm start > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

# 프론트엔드 서버가 시작될 때까지 대기
echo "⏳ 프론트엔드 서버 시작 대기 중..."
for i in {1..60}; do
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        echo "✅ 프론트엔드 서버가 정상적으로 시작되었습니다."
        break
    fi
    if [ $i -eq 60 ]; then
        echo "❌ 프론트엔드 서버 시작에 실패했습니다."
        echo "로그를 확인하세요: tail -f logs/frontend.log"
        exit 1
    fi
    sleep 2
done

# PID 파일 저장
echo $BACKEND_PID > logs/backend.pid
echo $FRONTEND_PID > logs/frontend.pid

# 시작 완료 메시지
echo ""
echo "🎉 시스템이 성공적으로 시작되었습니다!"
echo ""
echo "📱 서비스 URL:"
echo "   메인 페이지: http://localhost:3000"
echo "   통합 분석: http://localhost:3000/integrated-analysis"
echo "   API 문서:  http://localhost:8000/docs"
echo ""
echo "📊 시스템 상태:"
echo "   백엔드 PID: $BACKEND_PID (포트 8000)"
echo "   프론트엔드 PID: $FRONTEND_PID (포트 3000)"
echo ""
echo "📋 명령어:"
echo "   서비스 중지: ./stop_integrated_system.sh"
echo "   로그 확인:  tail -f logs/backend.log 또는 tail -f logs/frontend.log"
echo ""
echo "✨ 통합 집중도 분석을 시작하세요!"