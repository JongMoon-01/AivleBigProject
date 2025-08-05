import os
import pandas as pd

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CSV_PATH = os.path.join(BASE_DIR, "tableau_admin_dashboard_sample.csv")

def get_admin_data():
    # UTF-8-SIG로 읽기 (윈도우에서 CSV 저장 시 BOM 방지)
    df = pd.read_csv(CSV_PATH, encoding="utf-8-sig", header=None)

    # 헤더를 직접 생성 (col_0, col_1 ...)
    df.columns = [f"col_{i}" for i in range(df.shape[1])]

    # NaN -> 공백
    df = df.fillna("")

    # JSON 변환
    return df.to_dict(orient="records")
