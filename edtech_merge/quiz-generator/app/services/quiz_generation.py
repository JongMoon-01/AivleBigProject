import json
import logging
from typing import List, Dict
from openai import OpenAI
from app.config import settings
from app.models.quiz import Quiz, QuizResponse
from app.services.content_extraction import ContentExtractionService
from app.services.rag_service import RAGService

logger = logging.getLogger(__name__)

class QuizGenerationService:
    """
    퀴즈 생성 서비스
    
    VTT 자막 파일에서 텍스트를 추출하고, RAG 기법을 사용하여
    관련 콘텐츠를 검색한 후 OpenAI GPT를 활용해 퀴즈를 생성합니다.
    """
    
    def __init__(self):
        """서비스 초기화 - OpenAI 클라이언트와 필요한 서비스들을 설정"""
        self.openai_client = OpenAI(api_key=settings.OPENAI_API_KEY)
        self.content_service = ContentExtractionService()
        self.rag_service = RAGService()
    
    def generate_quiz(self, course_type: str) -> QuizResponse:
        """
        주어진 과목에 대한 퀴즈를 생성하는 메인 함수
        
        Args:
            course_type (str): 과목 타입 ('korean-history' 또는 'linear-algebra')
            
        Returns:
            QuizResponse: 생성된 퀴즈 응답 객체
            
        Process:
            1. VTT 파일에서 텍스트 추출 및 오류 수정
            2. 수정된 콘텐츠를 벡터 DB에 저장
            3. RAG를 사용해 관련 콘텐츠 검색
            4. GPT를 사용해 퀴즈 생성
        """
        # 1. VTT 파일에서 텍스트 추출하고 GPT로 오류 수정
        corrected_content = self._extract_and_correct_content(course_type)
        
        # 2. 수정된 콘텐츠를 청크로 나누어 벡터 DB에 저장
        self._store_content_in_vector_db(course_type, corrected_content)
        
        # 3. RAG를 사용해 관련성 높은 콘텐츠 검색 (상위 3개)
        relevant_docs = self.rag_service.search_relevant_content(course_type)
        
        # 4. 검색된 콘텐츠를 바탕으로 퀴즈 생성
        prompt = self._create_rag_quiz_prompt(course_type, relevant_docs)
        response = self.openai_client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=settings.OPENAI_TEMPERATURE,
            max_tokens=settings.OPENAI_MAX_TOKENS
        )
        
        quiz_content = response.choices[0].message.content
        logger.info(f"Generated quiz response for {course_type}")
        
        return self._parse_quiz_response(quiz_content, course_type)
    
    def _extract_and_correct_content(self, course_type: str) -> str:
        """
        VTT 파일에서 텍스트를 추출하고 오류를 수정
        
        Args:
            course_type (str): 과목 타입
            
        Returns:
            str: 오류가 수정된 텍스트
        """
        # VTT 파일 경로 가져오기
        vtt_path = self._get_vtt_path(course_type)
        
        # VTT 파일에서 원본 텍스트 추출
        raw_content = self.content_service.extract_text_from_vtt(vtt_path)
        
        # GPT를 사용해 음성 인식 오류 수정
        correction_prompt = self._create_correction_prompt(raw_content)
        response = self.openai_client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=[{"role": "user", "content": correction_prompt}],
            temperature=0.3,  # 낮은 temperature로 일관된 수정
            max_tokens=2000
        )
        
        corrected_content = response.choices[0].message.content
        logger.info(f"Content corrected for course type: {course_type}")
        
        return corrected_content
    
    def _store_content_in_vector_db(self, course_type: str, content: str):
        """
        콘텐츠를 청크로 나누어 벡터 DB에 저장
        
        Args:
            course_type (str): 과목 타입
            content (str): 저장할 콘텐츠
        """
        # 텍스트를 500자 단위로 청크 분할
        chunks = self.content_service.chunk_text(content, settings.CHUNK_SIZE)
        # 각 청크를 벡터화하여 ChromaDB에 저장
        self.rag_service.store_documents(course_type, chunks)
    
    def _create_rag_quiz_prompt(self, course_type: str, relevant_docs: List[Dict]) -> str:
        """
        퀴즈 생성을 위한 프롬프트 생성
        
        Args:
            course_type (str): 과목 타입
            relevant_docs (List[Dict]): 검색된 관련 문서들
            
        Returns:
            str: GPT에 전달할 프롬프트
        """
        # 검색된 문서들을 하나의 컨텍스트로 결합
        context = "\n\n".join([doc['content'] for doc in relevant_docs])
        course_name = self._get_course_display_name(course_type)
        
        return f"""다음은 {course_name} 강의의 주요 내용입니다:

{context}

위 강의 내용을 바탕으로 한국어로 객관식 퀴즈 5문제를 생성해주세요.

요구사항:
1. 5개의 객관식 문제 (4지선다)
2. 각 문제는 강의 내용과 직접적으로 관련이 있어야 함
3. 난이도는 중간 정도
4. 강의 내용을 잘 이해했는지 확인할 수 있는 문제
5. JSON 형식으로 반환
6. 문제 출제 배분:
     - 강의 전반부(처음 1/3): 1문제
     - 강의 중반부(중간 1/3): 2문제
     - 강의 후반부(마지막 1/3): 2문제
7. 형식:
{{
  "quizzes": [
    {{
      "question": "문제",
      "options": ["선택지1", "선택지2", "선택지3", "선택지4"],
      "correctAnswer": 0,
      "explanation": "설명"
    }}
  ]
}}"""
    
    def _create_correction_prompt(self, content: str) -> str:
        """
        음성 인식 오류 수정을 위한 프롬프트 생성
        
        Args:
            content (str): 원본 자막 텍스트
            
        Returns:
            str: 오류 수정 요청 프롬프트
        """
        return f"""다음은 음성 인식으로 생성된 강의 자막입니다.
음성 인식 오류를 수정하고, 맞춤법과 문법을 교정하여
논리적으로 맞는 내용으로,
원래 의미와 내용은 그대로 유지하되, 명확하게 수정해주세요.

자막 내용:
{content}

교정된 내용만 반환해주세요. 추가 설명은 필요 없습니다."""
    
    def _get_vtt_path(self, course_type: str) -> str:
        """
        과목 타입에 따른 VTT 파일 경로 반환
        
        Args:
            course_type (str): 과목 타입
            
        Returns:
            str: VTT 파일 경로
            
        Raises:
            ValueError: 알 수 없는 과목 타입인 경우
        """
        if course_type == "korean-history":
            return f"{settings.VTT_DIR}/korean_history.vtt"
        elif course_type == "linear-algebra":
            return f"{settings.VTT_DIR}/linear_algebra.vtt"
        else:
            raise ValueError(f"Unknown course type: {course_type}")
    
    def _get_course_display_name(self, course_type: str) -> str:
        """
        과목 타입의 한글 표시명 반환
        
        Args:
            course_type (str): 과목 타입
            
        Returns:
            str: 한글 과목명
        """
        if course_type == "korean-history":
            return "한국 역사"
        elif course_type == "linear-algebra":
            return "선형대수학"
        return course_type
    
    def _parse_quiz_response(self, json_response: str, course_type: str) -> QuizResponse:
        """
        GPT 응답을 QuizResponse 객체로 파싱
        
        Args:
            json_response (str): GPT의 JSON 형식 응답
            course_type (str): 과목 타입
            
        Returns:
            QuizResponse: 파싱된 퀴즈 응답 객체
        """
        try:
            # GPT 응답에서 마크다운 코드 블록 제거
            json_response = json_response.strip()
            if json_response.startswith("```json"):
                json_response = json_response[7:]
            if json_response.endswith("```"):
                json_response = json_response[:-3]
            
            # JSON 파싱 및 Quiz 객체 생성
            data = json.loads(json_response)
            quizzes = [Quiz(**quiz_data) for quiz_data in data['quizzes']]
            
            return QuizResponse(
                courseType=course_type,
                quizzes=quizzes
            )
        except Exception as e:
            logger.error(f"Failed to parse quiz response: {e}")
            # 파싱 실패 시 기본 퀴즈 반환
            return self._create_default_quiz_response(course_type)
    
    def _create_default_quiz_response(self, course_type: str) -> QuizResponse:
        """
        파싱 실패 시 반환할 기본 퀴즈 생성
        
        Args:
            course_type (str): 과목 타입
            
        Returns:
            QuizResponse: 기본 퀴즈 응답 객체
        """
        quizzes = []
        for i in range(1, 6):
            quiz = Quiz(
                question=f"문제 {i}",
                options=["선택지 1", "선택지 2", "선택지 3", "선택지 4"],
                correctAnswer=0,
                explanation="설명"
            )
            quizzes.append(quiz)
        
        return QuizResponse(
            courseType=course_type,
            quizzes=quizzes
        )