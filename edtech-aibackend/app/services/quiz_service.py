import os
import re
import json
from dotenv import load_dotenv
from openai import OpenAI
from sqlalchemy.orm import Session

# 환경 변수 로드 및 OpenAI 클라이언트 설정
load_dotenv()
api_key = os.getenv("OPENAI_API_KEY")
openai = OpenAI(api_key=api_key)

async def process_vtt_and_generate_quiz(file, db: Session, user_id: int, summary_id: int):
    # ⬇️ 순환 참조 방지: 함수 내부에서 모델 import
    from app.models.ai_quiz_model import AIQuiz, QuizTypeEnum

    # 1️⃣ 파일 내용 읽기 및 디코딩
    contents = await file.read()
    text = contents.decode("utf-8")

    # 2️⃣ 시간 정보 제거
    cleaned = re.sub(r"\d{2}:\d{2}:\d{2}.\d{3} --> .*", "", text)

    # 3️⃣ 빈 줄 제거
    cleaned_text = "\n".join([line.strip() for line in cleaned.splitlines() if line.strip()])

    # 4️⃣ GPT 프롬프트 생성
    prompt = f"""
    다음 자막 내용을 바탕으로 O/X 문제 1개와 4지선다형 객관식 문제 1개를 만들어줘.
    반드시 아래 형식의 JSON만 출력해. 설명이나 인사말은 쓰지마.

    [
        {{
            "question": "문제1",
            "options": ["O", "X"],
            "answer": "O"
        }},
        {{
            "question": "문제2",
            "options": ["A", "B", "C", "D"],
            "answer": "B"
        }}
    ]

    자막 내용:
    {cleaned_text}
    """

    try:
        # 5️⃣ GPT 호출
        response = openai.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7
        )

        gpt_reply = response.choices[0].message.content
        print("🔍 GPT 응답:", gpt_reply)  # 디버깅용 출력

        try:
            # 6️⃣ JSON 파싱
            quiz_list_raw = json.loads(gpt_reply)
            saved_quizzes = []

            # 7️⃣ DB 저장 및 반환용 리스트 구성
            for quiz in quiz_list_raw:
                quiz_type = QuizTypeEnum.OX if quiz["options"] == ["O", "X"] else QuizTypeEnum.MCQ
                new_quiz = AIQuiz(
                    summary_id=summary_id,
                    user_id=user_id,
                    quiz_type=quiz_type,
                    quiz_text=quiz["question"],
                    answer=quiz["answer"]
                )
                db.add(new_quiz)
                db.flush()  # ID 확보 위해 flush → 이후 db.commit()

                saved_quizzes.append({
                    "quiz_id": new_quiz.id,
                    "question": new_quiz.quiz_text,
                    "options": quiz["options"],
                    "answer": new_quiz.answer
                })

            db.commit()
            return saved_quizzes

        except json.JSONDecodeError as json_err:
            print("❗JSON 파싱 실패:", json_err)
            return [{"error": "JSON 파싱 실패", "raw_response": gpt_reply}]

    except Exception as e:
        print("❗OpenAI 오류:", e)
        return [{"error": "퀴즈 생성 실패", "details": str(e)}]
