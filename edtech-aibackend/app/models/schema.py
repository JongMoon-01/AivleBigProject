from pydantic import BaseModel
from typing import List, Dict

class QuizResponse(BaseModel):
    quiz_id: int
    question: str
    options: List[str]
    answer: str

class QuizSubmissionRequest(BaseModel):
    answers: Dict[int, str]  # key를 int로 수정해 실제 quiz_id와 매핑
    summary_id: int
    user_id: int
