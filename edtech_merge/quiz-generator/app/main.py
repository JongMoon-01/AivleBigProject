from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging
from app.config import settings
from app.routers import quiz

# 로깅 설정 - 애플리케이션 전체의 로그 출력 형식 정의
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

# FastAPI 애플리케이션 인스턴스 생성
app = FastAPI(
    title="Quiz Generation API",
    description="RAG-based quiz generation system for educational content",
    version="1.0.0"
)

# CORS (Cross-Origin Resource Sharing) 미들웨어 설정
# 프론트엔드(localhost:3000)에서 API 호출을 허용하기 위해 필요
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React 개발 서버 주소
    allow_credentials=True,
    allow_methods=["*"],  # 모든 HTTP 메서드 허용
    allow_headers=["*"],  # 모든 헤더 허용
)

# 라우터 등록 - 퀴즈 관련 엔드포인트들을 애플리케이션에 포함
app.include_router(quiz.router)

@app.get("/")
async def root():
    """
    API 루트 엔드포인트 - 서비스 정보와 사용 가능한 엔드포인트 목록 제공
    
    Returns:
        dict: 서비스 정보 및 엔드포인트 목록
    """
    return {
        "message": "Quiz Generation API",
        "version": "1.0.0",
        "endpoints": {
            "generate_korean_history_quiz": "POST /api/quiz/korean-history",
            "generate_linear_algebra_quiz": "POST /api/quiz/linear-algebra",
            "submit_quiz": "POST /api/quiz/submit",
            "health": "GET /api/quiz/health"
        }
    }

# 직접 실행 시 개발 서버 구동
if __name__ == "__main__":
    import uvicorn
    # Uvicorn ASGI 서버로 FastAPI 애플리케이션 실행
    uvicorn.run(
        "app.main:app",           # 앱 모듈 경로
        host="0.0.0.0",           # 모든 네트워크 인터페이스에서 접근 허용
        port=settings.APP_PORT,   # config.py에서 설정한 포트 (기본 8082)
        reload=True               # 코드 변경 시 자동 재시작 (개발용)
    )