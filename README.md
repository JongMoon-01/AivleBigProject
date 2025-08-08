
# 📊 Admin Dashboard

관리자를 위한 학습 데이터 시각화 대시보드입니다.  
수업별 주요 KPI를 시각적으로 확인할 수 있습니다.

---

## 📁 프로젝트 구조

```
AdminDashboard/
├── backend/                # FastAPI 백엔드 서버
│   ├── db/                 # 관리자 / 유저용 더미 데이터
│   └── main.py             # 백엔드 진입점
│
├── frontend/               # React 프론트엔드
│   ├── src/
│   │   ├── api/            # API 요청 함수
│   │   ├── components/     # 공통, 관리자, 유저 컴포넌트
│   │   ├── utils/          # 헬퍼 함수
│   │   └── App.js          # 전체 라우팅 구성
│   └── public/             # 정적 리소스
```

---

## 🚀 실행 방법

### ✅ 프론트엔드 실행 (React)

```bash
cd frontend
npm install
npm start
```

### ✅ 백엔드 실행 (FastAPI)

```bash
cd backend
python -m venv venv
source venv/Scripts/activate   # 윈도우 기준 (Mac은 source venv/bin/activate)

pip install --upgrade pip
pip install uvicorn[standard] fastapi numpy scipy
pip install pandas

uvicorn main:app --reload
```

---

## 🧰 사용 기술

- **Frontend**: React, Tailwind CSS, Recharts
- **Backend**: FastAPI, Pandas, NumPy, SciPy
- **환경 구성**: Vite + npm + virtualenv

---

## 📌 주요 기능 (관리자 기준)

| 기능 | 파일명 | 설명 |
|------|--------|------|
| 관리자 홈 대시보드 | `AdminHomePage.js` | 과목 선택 카드 UI (수학, 영어, 과학 등) |
| KPI 요약 페이지 | `AdminKpiPage.js` | 평균값 및 미니 차트 요약 |
| 상세 KPI 페이지 | `AdminKpiDetailPage.js` | 항목별 상세 시각화 페이지 |
| 주간 집중도 변화 | `AdminWeeklyFocusChart.js` | 주별 평균 집중도 + 학생별 비교 |
| 응답시간 분포 | `AdminResponseHistogram.js` | 유저 응답 시간 정규분포 시각화 |
| 시험 점수 정규분포 | `AdminTestScoreChart.js` | 점수 기반 정규분포 그래프 |
| 출석률 라인 차트 | `AdminAttendanceLineChart.js` | 평균 출석률 시각화 |
| 복습률 라인 차트 | `AdminReviewRateCard.js` | 평균 복습률 시각화 |
| 집중률 라인 차트 | `AdminFocusLineChart.js` | 평균 집중률 시각화 |
| Mini 요약 차트 | `MiniChart.js` | KPI 카드형 미니 차트 |

---

## 🔗 API 연동

- `/api/admin/dashboard` 등 FastAPI로 연결
- `frontend/src/api/adminApi.js`에 정의된 fetch 함수 사용

---

## 📌 기타

- 프로젝트는 관리자 대시보드 구현을 목적으로로 제작되었습니다.
- 모든 데이터는 더미 데이터 기반으로 구성되어 있습니다.
