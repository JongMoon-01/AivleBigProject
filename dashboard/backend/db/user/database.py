from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# MySQL 연결 정보
DB_USER = "root"        # 본인 MySQL 계정
DB_PASSWORD = "비밀번호"  # 본인 비밀번호
DB_HOST = "127.0.0.1"   # 로컬 MySQL
DB_PORT = "3306"        # 기본 포트
DB_NAME = "dashboard"   # 사용할 DB명

DATABASE_URL = f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

# SQLAlchemy 엔진 생성
engine = create_engine(DATABASE_URL, echo=True)

# 세션 팩토리
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 의존성 주입용 함수
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
