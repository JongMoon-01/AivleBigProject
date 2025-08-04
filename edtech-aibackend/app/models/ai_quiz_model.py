from sqlalchemy import Column, Integer, String, Enum
from app.database import Base  # ✅ 중앙 선언 Base import
import enum

# 퀴즈 유형 열거형
class QuizTypeEnum(str, enum.Enum):
    OX = "OX"
    MCQ = "MCQ"  # MultipleChoice의 약어

# AIQuiz 테이블 모델
class AIQuiz(Base):
    __tablename__ = "ai_quiz"

    id = Column(Integer, primary_key=True, index=True)
    summary_id = Column(Integer, index=True)
    user_id = Column(Integer, index=True)
    quiz_type = Column(Enum(QuizTypeEnum, native_enum=False), nullable=False)  # ✅ 문자열로 저장
    quiz_text = Column(String(1000), nullable=False)  # ✅ 충분한 길이 확보
    answer = Column(String(255), nullable=False)      # ✅ 답변도 길이 확보 (객관식 대비)