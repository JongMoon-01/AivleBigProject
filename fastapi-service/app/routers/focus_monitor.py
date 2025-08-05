from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
import asyncio
import time
import random
from typing import Dict, List, Optional
import logging

router = APIRouter(prefix="/focus-monitor", tags=["focus-monitor"])

# 집중도 모니터링 설정
class FocusSettings(BaseModel):
    low_threshold: int = 30
    critical_threshold: int = 15
    monitoring_interval: int = 5000  # milliseconds
    alert_cooldown: int = 30000      # milliseconds

# 집중도 알림 데이터
class FocusAlert(BaseModel):
    user_id: int
    alert_type: str  # 'warning' or 'critical'
    focus_score: int
    timestamp: float
    message: str

# 실시간 집중도 데이터 저장소 (실제로는 Redis 사용 권장)
focus_data_store: Dict[int, Dict] = {}
alert_history: Dict[int, List[FocusAlert]] = {}

@router.get("/current-score/{user_id}")
async def get_current_focus_score(user_id: int):
    """현재 사용자의 실시간 집중도 점수 조회"""
    try:
        # 실제 구현에서는 AI 모델에서 계산된 실시간 집중도 사용
        # 현재는 시뮬레이션 데이터
        
        # 사용자별 패턴 시뮬레이션
        base_scores = {1: 45, 2: 65, 3: 35, 4: 55}
        base_score = base_scores.get(user_id, 50)
        
        # 시간대별 변동 추가
        current_hour = time.localtime().tm_hour
        time_modifier = 0
        if 8 <= current_hour <= 10:  # 오전
            time_modifier = random.randint(-5, 15)
        elif 14 <= current_hour <= 16:  # 오후
            time_modifier = random.randint(-10, 20)
        elif 18 <= current_hour <= 20:  # 저녁
            time_modifier = random.randint(-15, 10)
        
        # 랜덤 변동 추가
        random_variation = random.randint(-20, 25)
        
        focus_score = max(0, min(100, base_score + time_modifier + random_variation))
        
        # 데이터 저장
        focus_data_store[user_id] = {
            "score": focus_score,
            "timestamp": time.time(),
            "base_score": base_score,
            "modifiers": {
                "time": time_modifier,
                "random": random_variation
            }
        }
        
        return {
            "user_id": user_id,
            "focus_score": focus_score,
            "timestamp": time.time(),
            "status": "success"
        }
        
    except Exception as e:
        logging.error(f"집중도 점수 조회 실패: {e}")
        raise HTTPException(status_code=500, detail=f"집중도 점수 조회 실패: {str(e)}")

@router.get("/history/{user_id}")
async def get_focus_history(user_id: int, limit: int = 50):
    """사용자의 집중도 히스토리 조회"""
    try:
        # 실제 구현에서는 데이터베이스에서 조회
        # 현재는 시뮬레이션 데이터 생성
        
        history = []
        current_time = time.time()
        
        for i in range(limit):
            timestamp = current_time - (i * 300)  # 5분 간격
            
            # 시뮬레이션 점수 생성
            base_scores = {1: 45, 2: 65, 3: 35, 4: 55}
            base_score = base_scores.get(user_id, 50)
            score = max(0, min(100, base_score + random.randint(-25, 30)))
            
            history.append({
                "timestamp": timestamp,
                "focus_score": score,
                "session_id": f"session_{int(timestamp)}"
            })
        
        return {
            "user_id": user_id,
            "history": history[::-1],  # 최신순 정렬
            "total_records": len(history)
        }
        
    except Exception as e:
        logging.error(f"집중도 히스토리 조회 실패: {e}")
        raise HTTPException(status_code=500, detail=f"집중도 히스토리 조회 실패: {str(e)}")

@router.post("/alert/{user_id}")
async def record_focus_alert(user_id: int, alert: FocusAlert):
    """집중도 알림 기록"""
    try:
        if user_id not in alert_history:
            alert_history[user_id] = []
        
        alert.user_id = user_id
        alert.timestamp = time.time()
        
        alert_history[user_id].append(alert)
        
        # 최근 100개만 유지
        if len(alert_history[user_id]) > 100:
            alert_history[user_id] = alert_history[user_id][-100:]
        
        logging.info(f"집중도 알림 기록됨 - User: {user_id}, Type: {alert.alert_type}, Score: {alert.focus_score}")
        
        return {
            "status": "success",
            "message": "알림이 기록되었습니다",
            "alert_id": len(alert_history[user_id])
        }
        
    except Exception as e:
        logging.error(f"집중도 알림 기록 실패: {e}")
        raise HTTPException(status_code=500, detail=f"집중도 알림 기록 실패: {str(e)}")

@router.get("/alerts/{user_id}")
async def get_focus_alerts(user_id: int, limit: int = 20):
    """사용자의 집중도 알림 히스토리 조회"""
    try:
        user_alerts = alert_history.get(user_id, [])
        
        # 최신순으로 정렬하여 반환
        recent_alerts = sorted(user_alerts, key=lambda x: x.timestamp, reverse=True)[:limit]
        
        return {
            "user_id": user_id,
            "alerts": [
                {
                    "alert_type": alert.alert_type,
                    "focus_score": alert.focus_score,
                    "timestamp": alert.timestamp,
                    "message": alert.message
                } for alert in recent_alerts
            ],
            "total_alerts": len(user_alerts)
        }
        
    except Exception as e:
        logging.error(f"집중도 알림 조회 실패: {e}")
        raise HTTPException(status_code=500, detail=f"집중도 알림 조회 실패: {str(e)}")

@router.get("/analytics/{user_id}")
async def get_focus_analytics(user_id: int):
    """사용자의 집중도 분석 데이터"""
    try:
        # 현재 점수
        current_data = focus_data_store.get(user_id, {})
        current_score = current_data.get("score", 0)
        
        # 최근 알림 통계
        user_alerts = alert_history.get(user_id, [])
        recent_alerts = [alert for alert in user_alerts if time.time() - alert.timestamp < 86400]  # 24시간
        
        warning_count = len([alert for alert in recent_alerts if alert.alert_type == "warning"])
        critical_count = len([alert for alert in recent_alerts if alert.alert_type == "critical"])
        
        # 집중도 트렌드 (간단한 시뮬레이션)
        trend = "improving" if current_score > 50 else "declining" if current_score < 30 else "stable"
        
        return {
            "user_id": user_id,
            "current_focus_score": current_score,
            "trend": trend,
            "daily_stats": {
                "warning_alerts": warning_count,
                "critical_alerts": critical_count,
                "total_alerts": len(recent_alerts)
            },
            "recommendations": [
                "정기적인 휴식을 취하세요" if current_score < 30 else "현재 집중도가 좋습니다",
                "알림 설정을 조정해보세요" if len(recent_alerts) > 10 else "알림 빈도가 적절합니다"
            ]
        }
        
    except Exception as e:
        logging.error(f"집중도 분석 데이터 조회 실패: {e}")
        raise HTTPException(status_code=500, detail=f"집중도 분석 데이터 조회 실패: {str(e)}")

@router.delete("/alerts/{user_id}")
async def clear_focus_alerts(user_id: int):
    """사용자의 집중도 알림 히스토리 삭제"""
    try:
        if user_id in alert_history:
            del alert_history[user_id]
        
        return {
            "status": "success",
            "message": f"사용자 {user_id}의 알림 히스토리가 삭제되었습니다"
        }
        
    except Exception as e:
        logging.error(f"집중도 알림 삭제 실패: {e}")
        raise HTTPException(status_code=500, detail=f"집중도 알림 삭제 실패: {str(e)}")

@router.get("/status")
async def get_monitor_status():
    """집중도 모니터링 시스템 상태 확인"""
    return {
        "status": "active",
        "monitored_users": len(focus_data_store),
        "total_alerts": sum(len(alerts) for alerts in alert_history.values()),
        "uptime": time.time(),
        "version": "1.0.0"
    }