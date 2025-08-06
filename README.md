# 📚 EdTech AI Quiz Backend (FastAPI with RAG)

AI 기반 **요약 컨텐츠를 RAG 기술로 차치하고**, 사용자 응답을 채점하는 FastAPI 백업드 시스템입니다.

---

## 📂️ 프로젝트 구조

```
edtech-aibackend/
├── app/
│   ├── api/                # FastAPI 라우터
│   ├── models/             # SQLAlchemy 모델, Pydantic 스키마
│   ├── services/           # RAG, 퀴즈 생성 서비스
│   ├── database.py         # DB 연결 설정
│   ├── main.py             # FastAPI 실행 짱입점
│   └── create_tables.py    # 테이블 생성용 스크립트
├── .env                    # 환경변수 파일 (Git 제외)
├── requirements.txt        # 패키지 목록
```

---

## ⚙️ .env 설정 (RAG + FastAPI)

```env
# 🔑 OpenAI API Key
OPENAI_API_KEY=sk-...

# 🧠 OpenAI Embedding 모델
OPENAI_EMBEDDING_MODEL=text-embedding-ada-002

# 💃 ChromaDB 환경
CHROMADB_HOST=localhost
CHROMADB_PORT=8000
COLLECTION_NAME=lecture_chunks

# 📃 MySQL DB URL
DATABASE_URL=mysql+pymysql://root:yourpassword@localhost:3306/edtech
```

> ❗ `.env` 파일은 Git에 포함하지 마세요. `.gitignore` 바로보기:

```
.env
__pycache__/
venv/
```

---

## 🚀 서버 & 테이블 생성 & RAG 실행

### ✅ 1. 의존성 설치

```bash
pip install -r requirements.txt
```

---

### ✅ 2. 테이블 생성

```bash
python app/create_tables.py
```

> 성공 예시:

```
🟢 테이블 생성 시작...
✅ 테이블 생성 완료.
```

---

### ✅ 3. ChromaDB (RAG 벡터 DB) 시작

1️⃣ chroma.exe 위치 확인 (PowerShell)
```powershell
Get-Command chroma.exe | Select-Object Source
```

```powershell
{위 명령어 반환 값} run --path ./chroma_db_data
```

> • 8000번 포트에 시작

---

### ✅ 4. FastAPI 서버 시작

```bash
uvicorn app.main:app --reload --port 8081
```

---

## 🤞 시험용 Summary → RAG 저장 & 퀴즈 생성

### ✅ Summary 더미 생성 (REST API)

```powershell
Invoke-WebRequest -Uri http://localhost:8081/insert-dummy-summary -Method POST
```

---

### ✅ Summary → ChromaDB (RAG) 저장

```bash
python test_save_rag.py
```

> 실행 결과 예시:

```
✅ Summary 1 → RAG 저장 완료 (1개 청크)
```

---

### ✅ 퀴즈 생성 (RAG 활용 기반)

```powershell
Invoke-WebRequest -Uri http://localhost:8081/generate-quiz/1/user123 -Method POST
```

---

### ✅ 퀴즈 조회

```powershell
Invoke-WebRequest -Uri http://localhost:8081/quiz/1
```








