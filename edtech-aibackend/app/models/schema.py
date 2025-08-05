from pydantic import BaseModel, validator
from typing import List, Dict

class OptionItem(BaseModel):
    label: str
    text: str

class QuizResponse(BaseModel):
    quiz_id: int
    question: str
    options: List[OptionItem]  # ✅ 문자열 리스트 → 객체 리스트로 변경
    answer: str

class QuizSubmissionRequest(BaseModel):
    answers: Dict[str, str]  # ✅ 모든 키를 str로 받기
    summary_id: int
    user_id: str

    @validator("answers", pre=True)
    def convert_keys_to_str(cls, v):
        if isinstance(v, dict):
            return {str(k): v[k] for k in v}
        raise ValueError("answers 필드는 딕셔너리여야 합니다.")

