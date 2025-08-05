from pydantic import BaseModel
from typing import Dict

class QuizSubmission(BaseModel):
    courseType: str
    answers: Dict[str, int]

class QuizResult(BaseModel):
    totalQuestions: int
    correctAnswers: int
    score: float