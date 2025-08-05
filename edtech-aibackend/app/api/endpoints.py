from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.models.schema import QuizResponse, QuizSubmissionRequest, OptionItem
from app.services.quiz_service import generate_quiz_from_summary
from app.models.ai_quiz_model import AIQuiz
from app.models.summary_model import Summary  # ✅ Summary 모델 추가
from app.database import get_db
from datetime import datetime
import json

router = APIRouter()

# ✅ summary_id 및 user_id 기반 퀴즈 생성 API
@router.post("/generate-quiz/{summary_id}/{user_id}", response_model=List[QuizResponse])
def generate_quiz(summary_id: int, user_id: str, db: Session = Depends(get_db)):  # ✅ str로 수정됨
    quiz_list = generate_quiz_from_summary(summary_id=summary_id, user_id=user_id, db=db)
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
            fixed_options = [OptionItem(label=opt, text="") for opt in options_data]
        elif isinstance(options_data, list) and isinstance(options_data[0], dict):
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
        user_answer = str(user_answer_raw).strip().upper() if user_answer_raw else ""
        correct_answer = quiz.answer.strip().upper()

        is_correct = user_answer == correct_answer

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

# ✅ 테스트용 Summary 더미 데이터 삽입 API
@router.post("/insert-dummy-summary")
def insert_dummy_summary(db: Session = Depends(get_db)):
    dummy_content = """
    Python은 고급 프로그래밍 언어로, 코드 가독성이 높고 다양한 라이브러리 지원으로 유명합니다.
    Python은 웹 개발, 데이터 분석, 인공지능, 자동화 등 다양한 분야에서 활용됩니다.
    대표적인 웹 프레임워크로는 Django와 Flask가 있으며, 데이터 분석에서는 Pandas와 Numpy가 많이 사용됩니다.
    머신러닝과 딥러닝 분야에서는 TensorFlow, PyTorch 등의 라이브러리가 널리 활용됩니다.
    Python은 전 세계 개발자들에게 인기 있는 언어이며, 다양한 커뮤니티와 풍부한 자료를 제공합니다.
    """

    dummy = Summary(
        summary_id=1,
        lecture_id=1,
        user_id="user123",
        content=dummy_content.strip(),
        time=0,
        created_at=datetime.utcnow()
    )
    db.add(dummy)
    db.commit()
    return {"message": "더미 Summary 삽입 완료"}





