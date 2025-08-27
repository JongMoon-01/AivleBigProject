from fastapi import APIRouter, HTTPException, WebSocket, WebSocketDisconnect
from pydantic import BaseModel
from typing import Dict, List, Optional
import json
import asyncio
from datetime import datetime
import numpy as np
from app.ai.integrated_attention_analyzer import IntegratedAttentionAnalyzer

router = APIRouter()

# 전역 분석기 인스턴스
analyzer = IntegratedAttentionAnalyzer()

def convert_numpy_types(obj):
    """numpy 타입을 JSON 직렬화 가능한 타입으로 변환"""
    if isinstance(obj, np.integer):
        return int(obj)
    elif isinstance(obj, np.floating):
        return float(obj)
    elif isinstance(obj, np.ndarray):
        return obj.tolist()
    elif isinstance(obj, dict):
        return {key: convert_numpy_types(value) for key, value in obj.items()}
    elif isinstance(obj, list):
        return [convert_numpy_types(item) for item in obj]
    return obj

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
        print(f"Client {client_id} connected for integrated attention analysis")
    
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
class IntegratedAnalysisRequest(BaseModel):
    base64_image: str
    user_id: Optional[str] = "anonymous"
    session_id: Optional[str] = None
    emotion_weight: Optional[float] = None
    gaze_weight: Optional[float] = None

class WeightConfig(BaseModel):
    emotion_weight: float = 0.6
    gaze_weight: float = 0.4

class AnalysisResponse(BaseModel):
    timestamp: str
    integrated_attention_score: float
    attention_level: str
    attention_message: str
    emotion_analysis: Dict
    gaze_analysis: Dict
    weights_used: Dict
    bonus_score: float
    analysis_success: bool

# REST API 엔드포인트
@router.post("/analyze/integrated", response_model=AnalysisResponse)
async def analyze_integrated_attention(request: IntegratedAnalysisRequest):
    """통합 집중도 분석 (감정 + 시선)"""
    try:
        # 요청에 가중치가 포함되어 있으면 설정
        if request.emotion_weight is not None and request.gaze_weight is not None:
            analyzer.set_weights(request.emotion_weight, request.gaze_weight)
        
        result = analyzer.analyze_integrated_attention(request.base64_image)
        
        # numpy 타입 변환
        result = convert_numpy_types(result)
        
        # 히스토리 저장
        analysis_history.append({
            **result,
            'user_id': request.user_id,
            'session_id': request.session_id
        })
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/analyze/integrated/custom-weights")
async def analyze_with_custom_weights(request: IntegratedAnalysisRequest, weights: WeightConfig):
    """커스텀 가중치를 사용한 통합 집중도 분석"""
    try:
        # 임시로 새로운 분석기 생성 (커스텀 가중치 적용)
        custom_analyzer = IntegratedAttentionAnalyzer(
            emotion_weight=weights.emotion_weight,
            gaze_weight=weights.gaze_weight
        )
        
        result = custom_analyzer.analyze_integrated_attention(request.base64_image)
        
        # 히스토리 저장
        analysis_history.append({
            **result,
            'user_id': request.user_id,
            'session_id': request.session_id,
            'custom_weights': {'emotion': weights.emotion_weight, 'gaze': weights.gaze_weight}
        })
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/analyze/integrated/history")
async def get_analysis_history(user_id: Optional[str] = None, limit: int = 100):
    """분석 히스토리 조회"""
    if user_id:
        filtered = [h for h in analysis_history if h.get('user_id') == user_id]
    else:
        filtered = analysis_history
    
    return filtered[-limit:]

@router.get("/analyze/integrated/summary")
async def get_analysis_summary(user_id: Optional[str] = None, limit: int = 100):
    """분석 결과 요약 통계"""
    try:
        if user_id:
            data = [h for h in analysis_history if h.get('user_id') == user_id]
        else:
            data = analysis_history
        
        # 최근 결과만 사용
        data = data[-limit:] if len(data) > limit else data
        
        if not data:
            return {
                "message": "No analysis data available",
                "total_analyses": 0
            }
        
        summary = analyzer.get_analysis_summary(data)
        summary['time_range'] = {
            'start': data[0].get('timestamp', 'Unknown'),
            'end': data[-1].get('timestamp', 'Unknown'),
            'total_records': len(data)
        }
        
        return summary
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/analyze/integrated/trends")
async def get_attention_trends(user_id: Optional[str] = None, hours: int = 24):
    """집중도 트렌드 분석"""
    try:
        from datetime import datetime, timedelta
        
        if user_id:
            data = [h for h in analysis_history if h.get('user_id') == user_id]
        else:
            data = analysis_history
        
        # 시간 필터링
        cutoff_time = datetime.now() - timedelta(hours=hours)
        filtered_data = []
        
        for record in data:
            try:
                record_time = datetime.fromisoformat(record.get('timestamp', ''))
                if record_time >= cutoff_time:
                    filtered_data.append(record)
            except:
                continue
        
        if not filtered_data:
            return {"message": f"No data available for the last {hours} hours"}
        
        # 시간대별 평균 계산
        hourly_data = {}
        for record in filtered_data:
            try:
                hour = datetime.fromisoformat(record['timestamp']).hour
                if hour not in hourly_data:
                    hourly_data[hour] = []
                hourly_data[hour].append(record['integrated_attention_score'])
            except:
                continue
        
        # 평균 계산
        trends = {}
        for hour, scores in hourly_data.items():
            trends[f"{hour:02d}:00"] = {
                'average_attention': round(sum(scores) / len(scores), 1),
                'sample_count': len(scores),
                'min_score': round(min(scores), 1),
                'max_score': round(max(scores), 1)
            }
        
        return {
            'time_period_hours': hours,
            'total_records': len(filtered_data),
            'hourly_trends': trends,
            'overall_average': round(sum([r['integrated_attention_score'] for r in filtered_data]) / len(filtered_data), 1)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# WebSocket 엔드포인트 - 실시간 통합 분석
@router.websocket("/ws/integrated/{client_id}")
async def websocket_integrated_analysis(websocket: WebSocket, client_id: str):
    await manager.connect(websocket, client_id)
    
    try:
        # 초기 연결 메시지
        await manager.send_message(client_id, {
            "type": "connection",
            "status": "connected",
            "message": "통합 집중도 실시간 분석 시작",
            "analyzer_info": analyzer.get_system_info()
        })
        
        # 5초 간격 분석 태스크
        async def periodic_analysis():
            while True:
                try:
                    await asyncio.sleep(5)  # 5초 대기
                    
                    # 클라이언트에 프레임 요청
                    await manager.send_message(client_id, {
                        "type": "request_frame",
                        "message": "Please send current frame for integrated analysis"
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
                # 통합 분석 수행
                result = analyzer.analyze_integrated_attention(message["base64_image"])
                
                response = {
                    "type": "integrated_analysis_result",
                    **result,
                    "performance_level": get_performance_level(result['integrated_attention_score']),
                    "recommendations": get_recommendations(result)
                }
                
                # numpy 타입 변환
                response = convert_numpy_types(response)
                
                # 결과 전송
                await manager.send_message(client_id, response)
                
                # 히스토리 저장
                analysis_history.append({
                    **result,
                    'user_id': client_id,
                    'session_id': message.get('session_id')
                })
            
            elif message.get("type") == "change_weights":
                # 실시간 가중치 변경
                emotion_w = message.get("emotion_weight", 0.6)
                gaze_w = message.get("gaze_weight", 0.4)
                
                # 분석기 가중치 업데이트
                analyzer.set_weights(emotion_w, gaze_w)
                
                await manager.send_message(client_id, {
                    "type": "weights_updated",
                    "new_weights": {
                        "emotion_weight": round(analyzer.emotion_weight, 3),
                        "gaze_weight": round(analyzer.gaze_weight, 3)
                    },
                    "message": "가중치가 업데이트되었습니다."
                })
            
            elif message.get("type") == "stop":
                break
    
    except WebSocketDisconnect:
        manager.disconnect(client_id)
    except Exception as e:
        print(f"WebSocket error: {e}")
        manager.disconnect(client_id)

def get_performance_level(attention_score: float) -> str:
    """성능 레벨 판정"""
    if attention_score >= 90:
        return "최우수"
    elif attention_score >= 75:
        return "우수"
    elif attention_score >= 60:
        return "양호"
    elif attention_score >= 40:
        return "보통"
    else:
        return "개선 필요"

def get_recommendations(analysis_result: Dict) -> List[str]:
    """분석 결과 기반 개선 권장사항"""
    recommendations = []
    
    attention_score = analysis_result.get('integrated_attention_score', 0)
    emotion = analysis_result.get('emotion_analysis', {}).get('emotion', '')
    gaze_score = analysis_result.get('gaze_analysis', {}).get('attention_score', 0)
    
    # 전체적인 집중도가 낮을 때
    if attention_score < 40:
        recommendations.append("전반적인 집중도가 낮습니다. 충분한 휴식을 취하세요.")
        recommendations.append("학습 환경을 점검하고 방해 요소를 제거해보세요.")
    
    # 감정 기반 권장사항
    if emotion == '졸음':
        recommendations.append("졸음이 감지되었습니다. 짧은 휴식이나 가벼운 운동을 해보세요.")
    elif emotion == '지루함':
        recommendations.append("지루함을 느끼고 있습니다. 학습 방법을 바꿔보세요.")
    elif emotion == '혼란':
        recommendations.append("혼란스러워 보입니다. 어려운 내용은 천천히 반복학습해보세요.")
    
    # 시선 기반 권장사항
    if gaze_score < 50:
        recommendations.append("시선이 분산되고 있습니다. 화면 중앙에 집중해보세요.")
        recommendations.append("모니터 높이와 거리를 조정해보세요.")
    
    # 긍정적인 피드백
    if attention_score >= 80:
        recommendations.append("훌륭한 집중 상태입니다. 현재 상태를 유지하세요!")
    elif attention_score >= 60:
        recommendations.append("좋은 집중도를 보이고 있습니다. 조금만 더 집중하면 완벽할 것 같아요.")
    
    return recommendations

@router.get("/integrated/model-info")
def get_model_info():
    """통합 분석 모델 정보"""
    return analyzer.get_system_info()

@router.get("/integrated/status")
async def get_service_status():
    """강화된 서비스 상태 확인"""
    emotion_model_loaded = hasattr(analyzer.emotion_analyzer, 'model') and analyzer.emotion_analyzer.model is not None
    
    return {
        "status": "running",
        "emotion_model_loaded": emotion_model_loaded,
        "gaze_model_loaded": analyzer.gaze_tracker.model is not None,
        "active_connections": len(manager.active_connections),
        "total_analyses": len(analysis_history),
        "system_info": analyzer.get_system_info(),
        "performance_metrics": _get_recent_performance_metrics(),
        "model_version": "trained_mobilenet_v1.0"
    }

def _get_recent_performance_metrics():
    """최근 분석 성능 지표 계산"""
    if not analysis_history:
        return {"message": "No analysis data available"}
    
    recent_analyses = analysis_history[-50:]  # 최근 50개
    
    # 성공률 계산
    successful = sum(1 for a in recent_analyses if a.get('analysis_success', False))
    success_rate = (successful / len(recent_analyses)) * 100 if recent_analyses else 0
    
    # 감정 분석 품질 지표
    emotion_analyses = [a.get('emotion_analysis', {}) for a in recent_analyses if a.get('analysis_success')]
    
    high_confidence_count = sum(1 for e in emotion_analyses 
                               if e.get('confidence_level') == 'high')
    
    avg_face_quality = np.mean([e.get('face_quality', 0) for e in emotion_analyses]) if emotion_analyses else 0
    
    avg_processing_time = np.mean([e.get('processing_time_ms', 0) for e in emotion_analyses]) if emotion_analyses else 0
    
    return {
        "recent_analyses_count": len(recent_analyses),
        "success_rate": round(success_rate, 1),
        "high_confidence_rate": round((high_confidence_count / len(emotion_analyses)) * 100, 1) if emotion_analyses else 0,
        "average_face_quality": round(avg_face_quality, 3),
        "average_processing_time_ms": round(avg_processing_time, 2),
        "recommendations": _generate_performance_recommendations(recent_analyses)
    }

def _generate_performance_recommendations(analyses):
    """성능 개선 권장사항 생성"""
    recommendations = []
    
    if len(analyses) < 10:
        return ["분석 데이터가 부족합니다. 더 많은 분석이 필요합니다."]
    
    # 성공률 체크
    success_rate = sum(1 for a in analyses if a.get('analysis_success', False)) / len(analyses)
    if success_rate < 0.8:
        recommendations.append("얼굴 감지 성공률이 낮습니다. 조명과 카메라 각도를 확인하세요.")
    
    # 신뢰도 체크  
    emotion_analyses = [a.get('emotion_analysis', {}) for a in analyses if a.get('analysis_success')]
    high_conf_rate = sum(1 for e in emotion_analyses if e.get('confidence_level') == 'high') / len(emotion_analyses) if emotion_analyses else 0
    
    if high_conf_rate < 0.3:
        recommendations.append("높은 신뢰도 예측이 부족합니다. 더 선명한 이미지가 필요합니다.")
    
    # 얼굴 품질 체크
    avg_quality = np.mean([e.get('face_quality', 0) for e in emotion_analyses]) if emotion_analyses else 0
    if avg_quality < 0.6:
        recommendations.append("얼굴 이미지 품질이 낮습니다. 카메라와의 거리를 조정하세요.")
    
    if not recommendations:
        recommendations.append("현재 분석 성능이 양호합니다.")
    
    return recommendations

@router.delete("/integrated/history/clear")
async def clear_analysis_history(user_id: Optional[str] = None):
    """분석 히스토리 삭제"""
    global analysis_history
    
    if user_id:
        # 특정 사용자의 기록만 삭제
        before_count = len(analysis_history)
        analysis_history = [h for h in analysis_history if h.get('user_id') != user_id]
        after_count = len(analysis_history)
        deleted_count = before_count - after_count
        
        return {
            "message": f"User {user_id}'s analysis history cleared",
            "deleted_records": deleted_count,
            "remaining_records": after_count
        }
    else:
        # 모든 기록 삭제
        deleted_count = len(analysis_history)
        analysis_history.clear()
        
        return {
            "message": "All analysis history cleared",
            "deleted_records": deleted_count
        }