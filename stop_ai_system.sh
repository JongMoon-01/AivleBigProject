#!/bin/bash

echo "🛑 AI 집중도 분석 시스템 종료 스크립트"
echo "========================================="

# 색상 코드 정의
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# FastAPI 서버 종료
echo -e "${YELLOW}FastAPI 백엔드 서버 종료 중...${NC}"
pkill -f "uvicorn app.main:app"
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ FastAPI 서버 종료 완료${NC}"
else
    echo -e "${RED}⚠️  FastAPI 서버가 실행 중이지 않음${NC}"
fi

# React 서버 종료
echo -e "${YELLOW}React 프론트엔드 서버 종료 중...${NC}"
pkill -f "react-scripts start"
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ React 서버 종료 완료${NC}"
else
    echo -e "${RED}⚠️  React 서버가 실행 중이지 않음${NC}"
fi

echo ""
echo "========================================="
echo -e "${GREEN}🛑 AI 집중도 분석 시스템 종료 완료${NC}"
echo "========================================="