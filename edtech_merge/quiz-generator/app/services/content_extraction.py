import re
from typing import List
from pathlib import Path

class ContentExtractionService:
    """
    VTT (WebVTT) 자막 파일에서 텍스트를 추출하고 처리하는 서비스
    
    VTT 파일에서 타임스탬프와 메타데이터를 제거하고
    순수 텍스트만 추출한 후, 퀴즈 생성에 적합한 크기로 취크를 분할
    """
    # VTT 파일 파싱용 정규식 패턴
    TIMESTAMP_PATTERN = re.compile(r'^\d{2}:\d{2}:\d{2}\.\d{3}\s+-->\s+\d{2}:\d{2}:\d{2}\.\d{3}$')  # 타임스탬프 패턴
    WEBVTT_HEADER = re.compile(r'^WEBVTT')  # WEBVTT 헤더 패턴
    
    def extract_text_from_vtt(self, file_path: str) -> str:
        """
        VTT 파일에서 순수 텍스트만 추출
        
        Args:
            file_path (str): VTT 파일 경로
            
        Returns:
            str: 추출된 순수 텍스트
            
        Process:
            1. WEBVTT 헤더 제거
            2. 타임스탬프 라인 제거
            3. 빈 라인 제거
            4. Cue ID (숫자) 제거
            5. 순수 자막 텍스트만 수집
        """
        content = []
        
        with open(file_path, 'r', encoding='utf-8') as file:
            for line in file:
                line = line.strip()
                
                # WEBVTT 헤더 제거
                if self.WEBVTT_HEADER.match(line):
                    continue
                
                # 빈 라인 제거
                if not line:
                    continue
                
                # 타임스탬프 라인 제거 (00:00:00.000 --> 00:00:05.000)
                if self.TIMESTAMP_PATTERN.match(line):
                    continue
                
                # Cue ID (타임스탬프 전에 나오는 숫자) 제거
                if line.isdigit():
                    continue
                
                # 순수 자막 텍스트 추가
                content.append(line)
        
        return ' '.join(content)
    
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