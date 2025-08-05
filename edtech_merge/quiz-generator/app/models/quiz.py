from pydantic import BaseModel
from typing import List, Optional
import uuid

class Quiz(BaseModel):
    id: str = ""
    question: str
    options: List[str]
    correctAnswer: int
    explanation: str
    
    def __init__(self, **data):
        super().__init__(**data)
        if not self.id:
            self.id = str(uuid.uuid4())

class QuizResponse(BaseModel):
    courseType: Optional[str] = None
    quizzes: List[Quiz]