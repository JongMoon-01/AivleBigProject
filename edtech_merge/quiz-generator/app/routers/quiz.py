from fastapi import APIRouter, HTTPException
from typing import Dict
import logging
from app.models.quiz import QuizResponse
from app.models.submission import QuizSubmission, QuizResult
from app.services.quiz_generation import QuizGenerationService

logger = logging.getLogger(__name__)
# API 라우터 인스턴스 생성 - 모든 퀴즈 관련 엔드포인트를 그룹화
router = APIRouter(prefix="/api/quiz", tags=["quiz"])

# 퀴즈 생성 서비스 초기화
quiz_service = QuizGenerationService()

# 인메모리 퀴즈 캐시 - 사용자가 풀어야 할 퀴즈와 정답을 임시 저장
quiz_cache: Dict[str, QuizResponse] = {}

@router.post("/korean-history", response_model=QuizResponse)
async def generate_korean_history_quiz():
    """
    한국사 퀴즈 생성 엔드포인트
    
    Returns:
        QuizResponse: 생성된 한국사 퀴즈 5문제
        
    Raises:
        HTTPException: 퀴즈 생성 실패 시 500 에러
    """
    try:
        # RAG 기반 한국사 퀴즈 생성
        quiz = quiz_service.generate_quiz("korean-history")
        
        # 생성된 퀴즈를 캐시에 저장 (답안 채점용)
        cache_key = f"korean-history_{quiz.quizzes[0].id}"
        quiz_cache[cache_key] = quiz
        
        return quiz
    except Exception as e:
        logger.error(f"Failed to generate Korean History quiz: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"퀴즈 생성에 실패했습니다: {str(e)}"
        )

@router.post("/linear-algebra", response_model=QuizResponse)
async def generate_linear_algebra_quiz():
    """
    선형대수학 퀴즈 생성 엔드포인트
    
    Returns:
        QuizResponse: 생성된 선형대수학 퀴즈 5문제
        
    Raises:
        HTTPException: 퀴즈 생성 실패 시 500 에러
    """
    try:
        # RAG 기반 선형대수학 퀴즈 생성
        quiz = quiz_service.generate_quiz("linear-algebra")
        
        # 생성된 퀴즈를 캐시에 저장 (답안 채점용)
        cache_key = f"linear-algebra_{quiz.quizzes[0].id}"
        quiz_cache[cache_key] = quiz
        
        return quiz
    except Exception as e:
        logger.error(f"Failed to generate Linear Algebra quiz: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"퀴즈 생성에 실패했습니다: {str(e)}"
        )

@router.post("/submit", response_model=QuizResult)
async def submit_quiz(submission: QuizSubmission):
    """
    퀴즈 답안 제출 및 채점 엔드포인트
    
    Args:
        submission (QuizSubmission): 사용자가 제출한 답안 데이터
        
    Returns:
        QuizResult: 채점 결과 (전체 문제 수, 정답 수, 점수)
        
    Raises:
        HTTPException: 캐시에서 퀴즈를 찾을 수 없거나 채점 실패 시
    """
    try:
        # 캐시 키 생성 - 첫 번째 문제 ID를 사용
        first_quiz_id = list(submission.answers.keys())[0] if submission.answers else ""
        cache_key = f"{submission.courseType}_{first_quiz_id}"
        
        logger.info(f"Looking for quiz with cache key: {cache_key}")
        logger.info(f"Available cache keys: {list(quiz_cache.keys())}")
        
        # 캐시에서 해당 퀴즈 가져오기
        cached_quiz = quiz_cache.get(cache_key)
        
        if not cached_quiz:
            logger.error(f"Quiz not found in cache. Cache key: {cache_key}")
            raise HTTPException(
                status_code=400,
                detail=f"퀴즈를 찾을 수 없습니다. 캐시 키: {cache_key}"
            )
        
        # 답안 채점 로직
        correct_count = 0
        total_questions = len(cached_quiz.quizzes)
        
        for quiz_id, answer in submission.answers.items():
            # 문제 ID로 해당 문제 찾기
            quiz = next((q for q in cached_quiz.quizzes if q.id == quiz_id), None)
            # 정답과 비교하여 맞으면 점수 추가
            if quiz and quiz.correctAnswer == answer:
                correct_count += 1
        
        # 점수 계산 (100점 만점)
        score = (correct_count / total_questions * 100) if total_questions > 0 else 0
        
        return QuizResult(
            totalQuestions=total_questions,
            correctAnswers=correct_count,
            score=score
        )
    except HTTPException:
        # HTTP 예외는 그대로 전달
        raise
    except Exception as e:
        logger.error(f"Failed to submit quiz: {e}")
        raise HTTPException(
            status_code=500,
            detail="퀴즈 제출에 실패했습니다"
        )

@router.get("/health")
async def health_check():
    """
    서비스 상태 확인용 헬스체크 엔드포인트
    
    Returns:
        dict: 서비스 상태 정보
    """
    return {"status": "healthy", "service": "quiz-generation"}