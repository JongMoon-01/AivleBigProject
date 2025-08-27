#!/bin/bash

# AI 통합 집중도 분석 시스템 상태 확인 스크립트
echo "📊 AI 통합 집중도 분석 시스템 상태 확인"
echo "================================================"

# 포트 사용 상태 확인
echo "🌐 포트 사용 상태:"
if lsof -ti:8000 > /dev/null 2>&1; then
    echo "   ✅ 포트 8000 (백엔드): 실행 중"
    BACKEND_PID=$(lsof -ti:8000)
    echo "      PID: $BACKEND_PID"
else
    echo "   ❌ 포트 8000 (백엔드): 중지됨"
fi

if lsof -ti:3000 > /dev/null 2>&1; then
    echo "   ✅ 포트 3000 (프론트엔드): 실행 중"
    FRONTEND_PID=$(lsof -ti:3000)
    echo "      PID: $FRONTEND_PID"
else
    echo "   ❌ 포트 3000 (프론트엔드): 중지됨"
fi

# 서비스 응답 확인
echo ""
echo "🔍 서비스 응답 테스트:"
if curl -s http://localhost:8000/health > /dev/null 2>&1; then
    echo "   ✅ 백엔드 API: 정상 응답"
else
    echo "   ❌ 백엔드 API: 응답 없음"
fi

if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "   ✅ 프론트엔드: 정상 응답"
else
    echo "   ❌ 프론트엔드: 응답 없음"
fi

# 모델 파일 확인
echo ""
echo "🤖 모델 파일 상태:"
if [ -f "Mobilenet_model_trained.keras" ]; then
    echo "   ✅ MobileNet 모델: 존재함"
    ls -lh Mobilenet_model_trained.keras | awk '{print "      크기:", $5}'
else
    echo "   ❌ MobileNet 모델: 누락됨"
fi

if [ -f "extracted_models/2. 학습 모델 파일/l2cs_trained.pkl" ]; then
    echo "   ✅ L2CS 모델: 존재함"
    ls -lh "extracted_models/2. 학습 모델 파일/l2cs_trained.pkl" | awk '{print "      크기:", $5}'
else
    echo "   ❌ L2CS 모델: 누락됨"
fi

# 로그 파일 확인
echo ""
echo "📝 로그 파일 상태:"
if [ -d "logs" ]; then
    echo "   📁 logs/ 디렉토리: 존재함"
    if [ -f "logs/backend.log" ]; then
        BACKEND_LOG_SIZE=$(wc -l < logs/backend.log 2>/dev/null || echo "0")
        echo "      백엔드 로그: $BACKEND_LOG_SIZE 줄"
    fi
    if [ -f "logs/frontend.log" ]; then
        FRONTEND_LOG_SIZE=$(wc -l < logs/frontend.log 2>/dev/null || echo "0")
        echo "      프론트엔드 로그: $FRONTEND_LOG_SIZE 줄"
    fi
else
    echo "   📁 logs/ 디렉토리: 없음"
fi

# 시스템 리소스 확인
echo ""
echo "💻 시스템 리소스:"
echo "   CPU 사용률: $(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | sed 's/%us,//' || echo "확인 불가")%"
echo "   메모리 사용률: $(free | grep Mem | awk '{printf "%.1f", $3/$2 * 100.0}')%"
echo "   디스크 사용률: $(df -h . | awk 'NR==2{print $5}')"

echo ""
echo "================================================"
echo "📋 사용 가능한 명령어:"
echo "   시작: ./start_integrated_system.sh"
echo "   중지: ./stop_integrated_system.sh"
echo "   상태: ./check_system_status.sh"
echo ""
if lsof -ti:3000 > /dev/null 2>&1 && lsof -ti:8000 > /dev/null 2>&1; then
    echo "🎉 시스템이 정상 작동 중입니다!"
    echo "   📱 통합 분석: http://localhost:3000/integrated-analysis"
else
    echo "⚠️  시스템이 완전히 실행되지 않았습니다."
    echo "   ./start_integrated_system.sh 를 실행하세요."
fi