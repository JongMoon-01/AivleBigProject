from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import numpy as np
from scipy.stats import gaussian_kde
import datetime

from db.user.dummyData import dashboard_data
from db.admin.adminData import get_admin_data

app = FastAPI()

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ 점수 요청 모델
class ScoreRequest(BaseModel):
    scores: list[float]

# 사용자용 기존 API
@app.get("/api/dashboard")
def get_dashboard():
    return dashboard_data

# 관리자용 새 API
@app.get("/api/admin/dashboard")
def get_admin_dashboard():
    now = datetime.datetime.now().strftime("%H:%M:%S")
    data = [
        {"time": now, "focus": 70},
        {"time": now, "focus": 80},
        {"time": now, "focus": 90},
    ]
    return data

# ✅ KDE 계산 API
@app.post("/api/admin/kde")
def get_kde(data: ScoreRequest):
    # 1. numpy 배열 변환
    scores = np.array(data.scores, dtype=float)

    # 2. 결시자 제거 (None, NaN)
    scores = scores[~np.isnan(scores)]

    # 3. gaussian_kde 계산
    if len(scores) == 0:
        return {"x": [], "y": []}

    kde = gaussian_kde(scores)
    xs = np.linspace(0, 100, 200)  # 0~100점 구간 샘플
    ys = kde(xs)

    return {"x": xs.tolist(), "y": ys.tolist()}
