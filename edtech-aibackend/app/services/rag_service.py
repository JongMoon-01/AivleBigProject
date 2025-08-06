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
    텍스트 청크를 벡터로 변환하고 저장·검색하는 서비스
    """
    def __init__(self):
        self.openai_client = OpenAI(api_key=settings.OPENAI_API_KEY)

        # ChromaDB HTTP 클라이언트 설정
        self.chroma_client = chromadb.HttpClient(
            host=settings.CHROMADB_HOST,
            port=settings.CHROMADB_PORT,
            settings=ChromaSettings(anonymized_telemetry=False)
        )

        # 컬렉션 가져오기 또는 새로 생성
        try:
            self.collection = self.chroma_client.get_collection(name=settings.COLLECTION_NAME)
        except:
            self.collection = self.chroma_client.create_collection(
                name=settings.COLLECTION_NAME,
                metadata={"hnsw:space": "cosine"}
            )

    def get_embedding(self, text: str) -> List[float]:
        """
        텍스트를 OpenAI 임베딩 벡터로 변환
        """
        response = self.openai_client.embeddings.create(
            model=settings.OPENAI_EMBEDDING_MODEL,
            input=text
        )
        return response.data[0].embedding

    def store_documents(self, course_type: str, chunks: List[str]):
        """
        텍스트 청크들을 벡터화하여 ChromaDB에 저장
        """
        existing = self.collection.get(
            where={"course_type": course_type},
            limit=1
        )

        if existing['ids']:
            logger.info(f"Documents already exist for course: {course_type}")
            return

        ids = []
        embeddings = []
        metadatas = []
        documents = []

        for i, chunk in enumerate(chunks):
            doc_id = f"{course_type}_chunk_{i}"
            embedding = self.get_embedding(chunk)

            ids.append(doc_id)
            embeddings.append(embedding)
            documents.append(chunk)
            metadatas.append({
                "course_type": course_type,
                "chunk_id": i,
                "source": "summary_content"
            })

        self.collection.add(
            ids=ids,
            embeddings=embeddings,
            documents=documents,
            metadatas=metadatas
        )

        logger.info(f"Stored {len(chunks)} chunks for course: {course_type}")

    def search_relevant_content(self, course_type: str, query: str = None, n_results: int = 3) -> List[Dict]:
        """
        course_type에 따라 관련 콘텐츠를 벡터 유사도 검색
        """
        if not query:
            query = f"{course_type} 관련 강의 내용"

        query_embedding = self.get_embedding(query)

        results = self.collection.query(
            query_embeddings=[query_embedding],
            where={"course_type": course_type},
            n_results=n_results
        )

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
