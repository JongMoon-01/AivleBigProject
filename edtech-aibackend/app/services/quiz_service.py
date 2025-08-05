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
    from app.models.ai_quiz_model import AIQuiz, QuizTypeEnum

    # 1️⃣ 파일 내용 읽기 및 디코딩
    contents = await file.read()
    text = contents.decode("utf-8")

    # 2️⃣ 시간 정보 제거
    cleaned = re.sub(r"\d{2}:\d{2}:\d{2}.\d{3} --> .*", "", text)

    # 3️⃣ 빈 줄 제거
    cleaned_text = "\n".join([line.strip() for line in cleaned.splitlines() if line.strip()])

    # 4️⃣ GPT 프롬프트 (보기 텍스트 포함 구조 요구)
    prompt = f"""
    다음 자막 내용을 바탕으로 총 10개의 퀴즈를 만들어줘.
    - O/X 문제 5개
    - 객관식 4지선다형 문제 5개
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
        print("🔍 GPT 응답:", gpt_reply)

        try:
            # 6️⃣ JSON 파싱
            quiz_list_raw = json.loads(gpt_reply)

            if len(quiz_list_raw) < 10:
                print(f"❗퀴즈 수 부족: {len(quiz_list_raw)}개 생성됨")
                return [{"error": f"퀴즈 10개 생성 실패 (현재 {len(quiz_list_raw)}개)", "raw_response": gpt_reply}]

            # 6-2️⃣ 초과 시 잘라서 사용
            quiz_list_raw = quiz_list_raw[:10]

            saved_quizzes = []

            for quiz in quiz_list_raw:
                question = quiz.get("question", "").strip()
                options = quiz.get("options", [])
                answer = quiz.get("answer", "").strip()

                # ✅ 퀴즈 유형 판단
                labels = [opt["label"] for opt in options]
                if labels == ["O", "X"]:
                    quiz_type = QuizTypeEnum.OX
                else:
                    quiz_type = QuizTypeEnum.MCQ

                # ✅ DB 저장
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




