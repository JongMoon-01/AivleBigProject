from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.models.schema import QuizResponse, QuizSubmissionRequest, OptionItem
from app.services import quiz_service
from app.models.ai_quiz_model import AIQuiz, QuizTypeEnum
from app.database import get_db

import json

router = APIRouter()

# ✅ VTT 업로드 및 퀴즈 생성
@router.post("/generate-quiz", response_model=List[QuizResponse])
async def generate_quiz(file: UploadFile = File(...), db: Session = Depends(get_db)):
    quiz_list = await quiz_service.process_vtt_and_generate_quiz(file, db=db, user_id=1, summary_id=1)
    if not quiz_list or "error" in quiz_list[0]:
        raise HTTPException(status_code=500, detail="퀴즈 생성 실패")
    return quiz_list

# ✅ 특정 강의의 퀴즈 조회
@router.get("/quiz/{summary_id}", response_model=List[QuizResponse])
def get_quiz(summary_id: int, db: Session = Depends(get_db)):
    quizzes = db.query(AIQuiz).filter(AIQuiz.summary_id == summary_id).all()
    if not quizzes:
        raise HTTPException(status_code=404, detail="해당 강의의 퀴즈가 없습니다.")

    result = []
    for quiz in quizzes:
        options_data = quiz.options

        # ✅ options 형식 변환: 문자열 → OptionItem 객체로 보정
        fixed_options = []
        if isinstance(options_data, str):
            try:
                options_data = json.loads(options_data)
            except Exception:
                raise HTTPException(status_code=500, detail="옵션 데이터 JSON 파싱 실패")

        if isinstance(options_data, list) and isinstance(options_data[0], str):
            # 문자열 리스트인 경우 (예: ["A", "B"])
            fixed_options = [OptionItem(label=opt, text="") for opt in options_data]
        elif isinstance(options_data, list) and isinstance(options_data[0], dict):
            # dict 리스트인 경우
            fixed_options = [OptionItem(**opt) for opt in options_data]
        else:
            raise HTTPException(status_code=500, detail="옵션 데이터 형식 오류")

        result.append(QuizResponse(
            quiz_id=quiz.id,
            question=quiz.quiz_text,
            options=fixed_options,
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
        user_answer_raw = request.answers.get(str(quiz.id))
        print(f"\n🔎 문제 ID: {quiz.id}")
        print(f"🔎 사용자 답안 (원본): {user_answer_raw} ({type(user_answer_raw)})")
        print(f"🔎 정답 (DB): {quiz.answer} ({type(quiz.answer)})")

        user_answer = str(user_answer_raw).strip().upper() if user_answer_raw else ""
        correct_answer = quiz.answer.strip().upper()

        is_correct = user_answer == correct_answer
        print(f"✅ 채점 결과: {'정답' if is_correct else '오답'}")

        if is_correct:
            correct_count += 1

        feedback.append({
            "question": quiz.quiz_text,
            "selected": user_answer,
            "correct": correct_answer,
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


