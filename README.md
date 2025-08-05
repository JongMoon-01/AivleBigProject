# 📚 EdTech AI Quiz Backend (FastAPI)

AI 기반 요약 콘텐츠로 퀴즈를 생성하고 사용자 응답을 채점하는 FastAPI 백엔드 시스템입니다.

---

## 🗂️ 프로젝트 구조
```
edtech-aibackend/
├── app/
│   ├── api/                # FastAPI 라우터
│   ├── models/             # SQLAlchemy 모델, Pydantic 스키마
│   ├── services/           # 퀴즈 생성 서비스
│   ├── database.py         # DB 연결 설정
│   ├── main.py             # FastAPI 실행 진입점
│   └── create_tables.py    # 테이블 생성용 스크립트
├── .env                    # 환경변수 파일 (Git 제외)
├── requirements.txt        # 패키지 목록
```

---

## ⚙️ .env 설정 (필수)
```env
OPENAI_API_KEY=your_openai_api_key
DATABASE_URL=mysql+pymysql://username:password@localhost:3306/edtech
```

> ❗ `.env` 파일은 절대 Git에 푸시하지 말 것  
`.gitignore`에 반드시 포함:
```
.env
__pycache__/
venv/
```

---

## 🚀 서버 및 테이블 생성 방법

### ✅ 1. 의존성 설치
```bash
pip install -r requirements.txt
```

---

### ✅ 2. 테이블 생성
```bash
python app/create_tables.py
```

> 실행 결과 예시:
```
🟢 테이블 생성 시작...
✅ 테이블 생성 완료.
```

→ `ai_quiz` 및 `summary` 테이블 자동 생성됨

---

### ✅ 3. FastAPI 서버 실행
```bash
uvicorn app.main:app --reload --port 8081
```

---

## 🧪 테스트: 더미 Summary로 퀴즈 생성하기

### ✅ 더미 Summary 삽입
```powershell
Invoke-WebRequest -Uri http://localhost:8081/insert-dummy-summary -Method POST
```

---

### ✅ 퀴즈 생성
```powershell
Invoke-WebRequest -Uri http://localhost:8081/generate-quiz/1/user123 -Method POST
```

---

### ✅ 퀴즈 조회
```powershell
Invoke-WebRequest -Uri http://localhost:8081/quiz/1
```

---

## 📝 주요 변경 사항
- ✅ 퀴즈 생성 방식 변경: **VTT → Summary content 기반**
- ✅ 더미 Summary로 퀴즈 생성 및 DB 저장 가능
- ✅ 테이블 생성 자동화 (`create_tables.py`)



