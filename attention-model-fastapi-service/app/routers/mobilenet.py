from fastapi import APIRouter, HTTPException, WebSocket, WebSocketDisconnect
from pydantic import BaseModel
from typing import Dict, List, Optional
import json
import asyncio
from datetime import datetime
from app.ai.mobilenet_processor import MobilenetProcessor

router = APIRouter()

# 전역 프로세서 인스턴스
processor = MobilenetProcessor()

# 분석 결과 저장소 (실제 운영시에는 DB 사용)
analysis_history = []

# WebSocket 연결 관리
class WebSocketManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
        self.analysis_tasks: Dict[str, asyncio.Task] = {}
    
    async def connect(self, websocket: WebSocket, client_id: str):
        await websocket.accept()
        self.active_connections[client_id] = websocket
        print(f"Client {client_id} connected for MobileNet analysis")
    
    def disconnect(self, client_id: str):
        if client_id in self.active_connections:
            del self.active_connections[client_id]
        if client_id in self.analysis_tasks:
            self.analysis_tasks[client_id].cancel()
            del self.analysis_tasks[client_id]
        print(f"Client {client_id} disconnected")
    
    async def send_message(self, client_id: str, message: dict):
        if client_id in self.active_connections:
            await self.active_connections[client_id].send_text(json.dumps(message))

manager = WebSocketManager()

# 요청/응답 모델
class FrameAnalysisRequest(BaseModel):
    base64_image: str
    user_id: Optional[str] = "anonymous"
    session_id: Optional[str] = None

class AnalysisResponse(BaseModel):
    timestamp: str
    emotion: str
    confidence: float
    attention_score: int
    face_detected: bool
    emotion_scores: Dict[str, float]

# REST API 엔드포인트
@router.post("/mobilenet/analyze", response_model=AnalysisResponse)
async def analyze_frame(request: FrameAnalysisRequest):
    """단일 프레임 분석"""
    try:
        result = processor.analyze_emotion(request.base64_image)
        
        response = AnalysisResponse(
            timestamp=datetime.now().isoformat(),
            emotion=result['emotion'],
            confidence=result['confidence'],
            attention_score=result['attention_score'],
            face_detected=result['face_detected'],
            emotion_scores=result.get('emotion_scores', {})
        )
        
        # 히스토리 저장
        analysis_history.append({
            **response.dict(),
            'user_id': request.user_id,
            'session_id': request.session_id
        })
        
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/mobilenet/history")
async def get_analysis_history(user_id: Optional[str] = None, limit: int = 100):
    """분석 히스토리 조회"""
    if user_id:
        filtered = [h for h in analysis_history if h['user_id'] == user_id]
    else:
        filtered = analysis_history
    
    return filtered[-limit:]

@router.get("/mobilenet/statistics")
async def get_statistics(user_id: Optional[str] = None):
    """통계 정보 조회"""
    if user_id:
        data = [h for h in analysis_history if h['user_id'] == user_id]
    else:
        data = analysis_history
    
    if not data:
        return {
            "total_analyses": 0,
            "average_attention": 0,
            "emotion_distribution": {},
            "face_detection_rate": 0
        }
    
    total = len(data)
    avg_attention = sum(d['attention_score'] for d in data) / total
    face_detected_count = sum(1 for d in data if d['face_detected'])
    
    emotion_counts = {}
    for d in data:
        emotion = d['emotion']
        emotion_counts[emotion] = emotion_counts.get(emotion, 0) + 1
    
    emotion_distribution = {
        emotion: (count / total * 100) for emotion, count in emotion_counts.items()
    }
    
    return {
        "total_analyses": total,
        "average_attention": round(avg_attention, 2),
        "emotion_distribution": emotion_distribution,
        "face_detection_rate": round(face_detected_count / total * 100, 2)
    }

# WebSocket 엔드포인트 - 5초마다 자동 분석
@router.websocket("/ws/mobilenet/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    await manager.connect(websocket, client_id)
    
    try:
        # 초기 연결 메시지
        await manager.send_message(client_id, {
            "type": "connection",
            "status": "connected",
            "message": "MobileNet 실시간 분석 시작"
        })
        
        # 5초 간격 분석 태스크
        async def periodic_analysis():
            while True:
                try:
                    await asyncio.sleep(5)  # 5초 대기
                    
                    # 클라이언트에 프레임 요청
                    await manager.send_message(client_id, {
                        "type": "request_frame",
                        "message": "Please send current frame"
                    })
                except asyncio.CancelledError:
                    break
                except Exception as e:
                    print(f"Error in periodic analysis: {e}")
        
        # 주기적 분석 태스크 시작
        analysis_task = asyncio.create_task(periodic_analysis())
        manager.analysis_tasks[client_id] = analysis_task
        
        # 메시지 수신 처리
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            
            if message.get("type") == "frame":
                # 프레임 분석
                result = processor.analyze_emotion(message["base64_image"])
                
                response = {
                    "type": "analysis_result",
                    "timestamp": datetime.now().isoformat(),
                    "emotion": result['emotion'],
                    "confidence": result['confidence'],
                    "attention_score": result['attention_score'],
                    "face_detected": result['face_detected'],
                    "emotion_scores": result.get('emotion_scores', {}),
                    "focus_level": get_focus_level(result['attention_score'])
                }
                
                # 결과 전송
                await manager.send_message(client_id, response)
                
                # 히스토리 저장
                analysis_history.append({
                    **response,
                    'user_id': client_id,
                    'session_id': message.get('session_id')
                })
            
            elif message.get("type") == "stop":
                break
    
    except WebSocketDisconnect:
        manager.disconnect(client_id)
    except Exception as e:
        print(f"WebSocket error: {e}")
        manager.disconnect(client_id)

def get_focus_level(attention_score: int) -> str:
    """집중도 레벨 판정"""
    if attention_score >= 80:
        return "매우 집중"
    elif attention_score >= 60:
        return "집중"
    elif attention_score >= 40:
        return "보통"
    elif attention_score >= 20:
        return "산만"
    else:
        return "매우 산만"

@router.get("/mobilenet/status")
async def get_service_status():
    """서비스 상태 확인"""
    return {
        "status": "running",
        "model_loaded": processor.model is not None,
        "active_connections": len(manager.active_connections),
        "total_analyses": len(analysis_history)
    }