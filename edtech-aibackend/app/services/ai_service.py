from openai import OpenAI
import os
from dotenv import load_dotenv

# ✅ 환경 변수 로드
load_dotenv()
api_key = os.getenv("OPENAI_API_KEY")

# ✅ OpenAI 클라이언트 생성
openai = OpenAI(api_key=api_key)


def summarize_text_with_gpt(text: str) -> str:
    """
    주어진 텍스트를 요약하는 함수 (GPT 기반)

    Parameters:
    - text (str): 요약할 원본 텍스트

    Returns:
    - str: 요약된 텍스트
    """
    prompt = f"""
    다음 내용을 간결하게 요약해줘:

    {text}
    """

    try:
        response = openai.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.5,
            max_tokens=300
        )
        summary = response.choices[0].message.content.strip()
        return summary

    except Exception as e:
        print("❗GPT 요약 오류:", e)
        return "요약 실패"