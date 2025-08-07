# app/services/summary_to_rag.py

from sqlalchemy.orm import Session
from app.models.summary_model import Summary
from app.services.rag_service import RAGService
from app.services.text_chunker import split_into_chunks

def save_summary_to_rag(summary_id: int, db: Session):
    """
    Summary 테이블의 content를 청크로 분리하여 RAG 저장

    Args:
        summary_id (int): 저장할 summary의 ID
        db (Session): DB 세션
    """
    # 1. summary 테이블에서 데이터 조회
    summary = db.query(Summary).filter(Summary.summary_id == summary_id).first()
    if not summary:
        print(f"❗ Summary ID {summary_id} 없음")
        return

    content_text = summary.content.strip()

    # 2. 텍스트 청크 분리
    chunks = split_into_chunks(content_text)

    # 3. RAG 저장
    rag_service = RAGService()
    course_type = f"summary_{summary_id}"
    rag_service.store_documents(course_type=course_type, chunks=chunks)

    print(f"✅ Summary {summary_id} → RAG 저장 완료 ({len(chunks)}개 청크)")
