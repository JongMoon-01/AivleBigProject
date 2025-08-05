import os
import json
from dotenv import load_dotenv
from openai import OpenAI
from sqlalchemy.orm import Session
from app.models.ai_quiz_model import AIQuiz, QuizTypeEnum
from app.models.summary_model import Summary  # Summary 테이블 불러오기

# 환경 변수 로드 및 OpenAI 클라이언트 설정
load_dotenv()
api_key = os.getenv("OPENAI_API_KEY")
openai = OpenAI(api_key=api_key)

def generate_quiz_from_summary(summary_id: int, user_id: str, db: Session):
    """
    Summary 테이블에서 content를 가져와 퀴즈 생성 후 AIQuiz에 저장

    Parameters:
    - summary_id (int): 요약 데이터 ID
    - user_id (str): 사용자 ID
    - db (Session): DB 세션

    Returns:
    - List[Dict]: 생성된 퀴즈 리스트 또는 에러 정보
    """
    summary = db.query(Summary).filter(Summary.summary_id == summary_id, Summary.user_id == user_id).first()
    if not summary:
        return [{"error": "Summary not found"}]

    content_text = summary.content.strip()

    # ✅ 퀴즈 5개 생성으로 수정
    prompt = f"""
    다음 내용을 바탕으로 총 5개의 퀴즈를 만들어줘.
    - O/X 문제 2개
    - 객관식 4지선다형 문제 3개
    - 모든 보기는 실제 텍스트로 채워줘.
    - 아래 JSON 형식으로만 출력하고 다른 말은 하지마:

    [
      {{
        "question": "문제 내용",
        "options": [
          {{ "label": "A", "text": "보기 내용1" }},
          {{ "label": "B", "text": "보기 내용2" }},
          {{ "label": "C", "text": "보기 내용3" }},
          {{ "label": "D", "text": "보기 내용4" }}
        ],
        "answer": "A"
      }},
      {{
        "question": "문제 내용",
        "options": [
          {{ "label": "O", "text": "맞다" }},
          {{ "label": "X", "text": "틀리다" }}
        ],
        "answer": "O"
      }}
    ]

    요약 내용:
    {content_text}
    """

    try:
        response = openai.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7
        )

        gpt_reply = response.choices[0].message.content
        print("🔍 GPT 응답:", gpt_reply)

        try:
            quiz_list_raw = json.loads(gpt_reply)

            # ✅ 퀴즈 수 최소 5개 확인
            if len(quiz_list_raw) < 5:
                print(f"❗퀴즈 수 부족: {len(quiz_list_raw)}개 생성됨")
                return [{"error": f"퀴즈 5개 생성 실패 (현재 {len(quiz_list_raw)}개)", "raw_response": gpt_reply}]

            quiz_list_raw = quiz_list_raw[:5]  # 초과 시 5개로 자르기

            saved_quizzes = []

            for quiz in quiz_list_raw:
                question = quiz.get("question", "").strip()
                options = quiz.get("options", [])
                answer = quiz.get("answer", "").strip()

                labels = [opt["label"] for opt in options]
                if labels == ["O", "X"]:
                    quiz_type = QuizTypeEnum.OX
                else:
                    quiz_type = QuizTypeEnum.MCQ

                new_quiz = AIQuiz(
                    summary_id=summary_id,
                    user_id=user_id,
                    quiz_type=quiz_type,
                    quiz_text=question,
                    answer=answer,
                    options=options
                )
                db.add(new_quiz)
                db.flush()

                saved_quizzes.append({
                    "quiz_id": new_quiz.id,
                    "question": question,
                    "options": options,
                    "answer": answer
                })

            db.commit()
            return saved_quizzes

        except json.JSONDecodeError as json_err:
            print("❗JSON 파싱 실패:", json_err)
            return [{"error": "JSON 파싱 실패", "raw_response": gpt_reply}]

    except Exception as e:
        print("❗OpenAI 오류:", e)
        return [{"error": "퀴즈 생성 실패", "details": str(e)}]







