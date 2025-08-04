from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.models.schema import QuizResponse, QuizSubmissionRequest
from app.services import quiz_service
from app.models.ai_quiz_model import AIQuiz, QuizTypeEnum
from app.database import get_db

router = APIRouter()

# ✅ VTT 업로드 및 퀴즈 생성
@router.post("/generate-quiz", response_model=List[QuizResponse])
async def generate_quiz(file: UploadFile = File(...), db: Session = Depends(get_db)):
    quiz_list = await quiz_service.process_vtt_and_generate_quiz(file, db=db, user_id=1, summary_id=1)
    return quiz_list

# ✅ 특정 강의의 퀴즈 조회
@router.get("/quiz/{summary_id}", response_model=List[QuizResponse])
def get_quiz(summary_id: int, db: Session = Depends(get_db)):
    quizzes = db.query(AIQuiz).filter(AIQuiz.summary_id == summary_id).all()
    if not quizzes:
        raise HTTPException(status_code=404, detail="해당 강의의 퀴즈가 없습니다.")

    result = []
    for quiz in quizzes:
        options = ["O", "X"] if quiz.quiz_type == QuizTypeEnum.OX else ["A", "B", "C", "D"]
        result.append(QuizResponse(
            quiz_id=quiz.id,
            question=quiz.quiz_text,
            options=options,
            answer=quiz.answer
        ))

    return result

# ✅ 퀴즈 제출 및 결과 평가
@router.post("/submit-quiz")
def submit_quiz(request: QuizSubmissionRequest, db: Session = Depends(get_db)):
    quizzes = db.query(AIQuiz).filter(AIQuiz.summary_id == request.summary_id).all()
    if not quizzes:
        raise HTTPException(status_code=404, detail="해당 summary_id의 퀴즈가 없습니다.")

    correct_count = 0
    feedback = []

    for quiz in quizzes:
        user_answer = request.answers.get(str(quiz.id))
        if user_answer is None:
            continue

        is_correct = user_answer == quiz.answer
        if is_correct:
            correct_count += 1

        feedback.append({
            "question": quiz.quiz_text,
            "selected": user_answer,
            "correct": quiz.answer,
            "is_correct": is_correct
        })

    total = len(quizzes)
    score = round((correct_count / total) * 100, 1) if total > 0 else 0

    return {
        "total": total,
        "correct": correct_count,
        "score": score,
        "feedback": feedback
    }