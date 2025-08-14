# Quiz Generator API

RAG 기반 퀴즈 생성 시스템 (Python FastAPI + ChromaDB + OpenAI)

## 개요

Quiz Generator는 교육 콘텐츠(텍스트 파일)를 기반으로 자동으로 퀴즈를 생성하는 시스템입니다. RAG(Retrieval-Augmented Generation) 기술을 활용하여 대용량 강의 내용에서도 효과적으로 퀴즈를 생성할 수 있습니다.

## 작동 원리

### 1. 전체 프로세스
```
텍스트 파일 → 내용 읽기 → 청크 분할 → 벡터 임베딩 → ChromaDB 저장
                                                        ↓
프론트엔드 요청 ← 퀴즈 JSON 응답 ← GPT 퀴즈 생성 ← 관련 콘텐츠 검색 ←
```

### 2. 핵심 기술
- **RAG (Retrieval-Augmented Generation)**: 전체 강의 내용을 메모리에 올리지 않고, 필요한 부분만 검색하여 사용
- **벡터 데이터베이스 (ChromaDB)**: 텍스트를 벡터로 변환하여 의미적 유사도 검색 가능
- **OpenAI 임베딩**: 텍스트를 고차원 벡터로 변환하여 의미적 검색 지원
- **청크 기반 처리**: 긴 텍스트를 작은 단위로 분할하여 효율적 처리

### 3. 주요 구성 요소
1. **Content Extraction Service**: 텍스트 파일 읽기 및 청크 분할
2. **RAG Service**: ChromaDB와 통신하여 벡터 저장/검색
3. **Quiz Generation Service**: OpenAI API를 활용한 퀴즈 생성
4. **FastAPI Router**: HTTP 엔드포인트 제공

## 시스템 구조

```
quiz-generator/
├── app/
│   ├── main.py              # FastAPI 애플리케이션 진입점
│   ├── config.py             # 환경 설정 및 상수
│   ├── models/               # Pydantic 데이터 모델
│   │   ├── quiz.py          # 퀴즈 관련 모델
│   │   └── submission.py    # 답안 제출 모델
│   ├── routers/             # API 라우터
│   │   └── quiz.py          # 퀴즈 관련 엔드포인트
│   └── services/            # 비즈니스 로직
│       ├── content_extraction.py  # 텍스트 파일 처리
│       ├── quiz_generation.py     # 퀴즈 생성 로직
│       └── rag_service.py         # 벡터 DB 연동
├── resources/
│   └── txt/                 # 텍스트 파일
├── chroma_data/             # ChromaDB 데이터 저장소
└── requirements.txt         # Python 의존성

```

## 데이터 흐름

1. **초기 로드 시**:
   - 텍스트 파일 읽기 → 내용 추출
   - 텍스트를 500자 단위로 청크 분할
   - 각 청크를 OpenAI 임베딩으로 벡터화
   - ChromaDB에 벡터와 메타데이터 저장

2. **퀴즈 생성 요청 시**:
   - 해당 과목의 관련 콘텐츠 벡터 검색 (상위 3개)
   - 검색된 콘텐츠를 컨텍스트로 GPT에 전달
   - GPT가 5개의 객관식 문제 생성
   - JSON 형식으로 프론트엔드에 응답

## 설치 방법

<<터미널에서 cd quiz-generator로 이동해라 (중요!!!)>>

1. 가상환경 생성 및 활성화
```bash
python -m venv venv
# Windows
venv\Scripts\activate
# Linux/Mac
source venv/bin/activate
```
venv\Scripts\activate
2. 의존성 설치
```bash
pip install -r requirements.txt
```

3. ChromaDB 서버 실행
```bash
chroma run --path ./chroma_data --port 8000
```

4. 환경변수 설정
`.env` 파일에 OpenAI API 키 추가:
```
OPENAI_API_KEY=your_actual_api_key_here
```
-------------새로운 터미널을 열어라, 그리고 cd quiz-generator로 이동해라!!!! --------------

5.가상환경 활성화해라
```bash
# Windows
venv\Scripts\activate
# Linux/Mac
source venv/bin/activate
```

6. 애플리케이션 실행
```bash
python -m app.main
```

## API 엔드포인트

- `POST /api/quiz/korean-history` - 한국사 퀴즈 생성
- `POST /api/quiz/linear-algebra` - 선형대수학 퀴즈 생성
- `POST /api/quiz/submit` - 퀴즈 답안 제출
- `GET /api/quiz/health` - 헬스체크

## 포트 정보
- FastAPI: 8082
- ChromaDB: 8000
