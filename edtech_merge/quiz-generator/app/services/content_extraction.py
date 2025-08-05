from typing import List
from pathlib import Path

class ContentExtractionService:
    """
    텍스트 파일에서 콘텐츠를 추출하고 처리하는 서비스
    
    텍스트 파일을 읽어서 퀴즈 생성에 적합한 크기로 청크를 분할
    """
    
    def extract_text_from_txt(self, file_path: str) -> str:
        """
        텍스트 파일에서 내용을 읽어옴
        
        Args:
            file_path (str): 텍스트 파일 경로
            
        Returns:
            str: 파일의 전체 텍스트 내용
        """
        with open(file_path, 'r', encoding='utf-8') as file:
            content = file.read()
        
        return content.strip()
    
    def chunk_text(self, text: str, max_chunk_size: int = 500) -> List[str]:
        """
        긴 텍스트를 지정된 크기로 취크 분할
        
        Args:
            text (str): 분할할 원본 텍스트
            max_chunk_size (int): 최대 취크 크기 (자수 기준)
            
        Returns:
            List[str]: 분할된 취크 목록
            
        Strategy:
            - 문장 단위로 분할하여 의미적 일관성 유지
            - 지정된 최대 크기를 초과하지 않도록 제어
            - 마지막 취크도 포함하여 반환
        """
        chunks = []
        sentences = text.split('. ')  # 마침표 기준으로 문장 분할
        
        current_chunk = []
        current_size = 0
        
        for sentence in sentences:
            sentence_with_period = sentence + '.'
            sentence_size = len(sentence_with_period)
            
            # 현재 취크에 추가하면 최대 크기를 초과하는 경우
            if current_size + sentence_size > max_chunk_size and current_chunk:
                chunks.append(' '.join(current_chunk))
                current_chunk = []
                current_size = 0
            
            # 현재 취크에 문장 추가
            current_chunk.append(sentence_with_period)
            current_size += sentence_size
        
        # 마지막 취크 처리
        if current_chunk:
            chunks.append(' '.join(current_chunk))
        
        return chunks