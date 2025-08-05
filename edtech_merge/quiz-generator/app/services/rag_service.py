import chromadb
from chromadb.config import Settings as ChromaSettings
from openai import OpenAI
from typing import List, Dict
import logging
from app.config import settings

logger = logging.getLogger(__name__)

class RAGService:
    """
    RAG (Retrieval-Augmented Generation) 서비스
    
    ChromaDB 벡터 데이터베이스와 OpenAI 임베딩을 사용하여
    텍스트 취크를 벡터로 변환하고 저장·검색하는 서비스
    """
    def __init__(self):
        """
        RAG 서비스 초기화
        - OpenAI 클라이언트 설정
        - ChromaDB 클라이언트 연결
        - 컵렉션 생성 또는 가져오기
        """
        self.openai_client = OpenAI(api_key=settings.OPENAI_API_KEY)
        
        # ChromaDB HTTP 클라이언트 설정
        self.chroma_client = chromadb.HttpClient(
            host=settings.CHROMADB_HOST,
            port=settings.CHROMADB_PORT,
            settings=ChromaSettings(anonymized_telemetry=False)
        )
        
        # 컵렉션 가져오기 또는 새로 생성
        try:
            self.collection = self.chroma_client.get_collection(name=settings.COLLECTION_NAME)
        except:
            # cosine 유사도 사용하는 HNSW 인덱스로 컵렉션 생성
            self.collection = self.chroma_client.create_collection(
                name=settings.COLLECTION_NAME,
                metadata={"hnsw:space": "cosine"}
            )
    
    def get_embedding(self, text: str) -> List[float]:
        """
        텍스트를 OpenAI 임베딩 벡터로 변환
        
        Args:
            text (str): 벡터로 변환할 텍스트
            
        Returns:
            List[float]: 1536차원 임베딩 벡터
        """
        response = self.openai_client.embeddings.create(
            model=settings.OPENAI_EMBEDDING_MODEL,  # text-embedding-ada-002
            input=text
        )
        return response.data[0].embedding
    
    def store_documents(self, course_type: str, chunks: List[str]):
        """
        텍스트 취크들을 벡터화하여 ChromaDB에 저장
        
        Args:
            course_type (str): 과목 타입 (필터링용)
            chunks (List[str]): 저장할 텍스트 취크 목록
        """
        # 이미 저장된 문서가 있는지 확인
        existing = self.collection.get(
            where={"course_type": course_type},
            limit=1
        )
        
        if existing['ids']:
            logger.info(f"Documents already exist for course: {course_type}")
            return
        
        # 저장용 데이터 준비
        ids = []
        embeddings = []
        metadatas = []
        documents = []
        
        for i, chunk in enumerate(chunks):
            doc_id = f"{course_type}_chunk_{i}"
            # 각 취크를 임베딩 벡터로 변환
            embedding = self.get_embedding(chunk)
            
            ids.append(doc_id)
            embeddings.append(embedding)
            documents.append(chunk)
            metadatas.append({
                "course_type": course_type,
                "chunk_id": i,
                "source": "vtt_subtitle"
            })
        
        # ChromaDB에 일괄 저장
        self.collection.add(
            ids=ids,
            embeddings=embeddings,
            documents=documents,
            metadatas=metadatas
        )
        
        logger.info(f"Stored {len(chunks)} chunks for course: {course_type}")
    
    def search_relevant_content(self, course_type: str, query: str = None, n_results: int = 3) -> List[Dict]:
        """
        과목에 따른 관련 콘텐츠를 벡터 유사도 검색
        
        Args:
            course_type (str): 과목 타입
            query (str, optional): 검색 쿼리. None이면 기본 쿼리 사용
            n_results (int): 반환할 결과 수 (기본 3개)
            
        Returns:
            List[Dict]: 검색된 문서 목록 (content, metadata, distance 포함)
        """
        if not query:
            query = f"{course_type} 강의 내용"
        
        # 쿼리를 임베딩 벡터로 변환
        query_embedding = self.get_embedding(query)
        
        # 벡터 유사도 검색 수행
        results = self.collection.query(
            query_embeddings=[query_embedding],
            where={"course_type": course_type},  # 해당 과목만 검색
            n_results=n_results
        )
        
        # 결과를 사용하기 쉬운 형태로 변환
        relevant_docs = []
        if results['documents'] and results['documents'][0]:
            for i, doc in enumerate(results['documents'][0]):
                relevant_docs.append({
                    'content': doc,
                    'metadata': results['metadatas'][0][i] if results['metadatas'] else {},
                    'distance': results['distances'][0][i] if results['distances'] else 0
                })
        
        logger.info(f"Found {len(relevant_docs)} relevant documents for course: {course_type}")
        return relevant_docs