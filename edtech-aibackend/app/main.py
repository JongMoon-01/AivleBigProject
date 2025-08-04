from fastapi import FastAPI
from app.api.endpoints import router
from dotenv import load_dotenv

load_dotenv()  # ✅ .env 환경변수 로드

app = FastAPI()

# ✅ 라우터 등록
app.include_router(router)

# ✅ 앱 직접 실행 (uvicorn으로 실행 가능하게)
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8081, reload=True)
