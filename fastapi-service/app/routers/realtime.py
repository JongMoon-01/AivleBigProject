from fastapi import APIRouter, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.responses import HTMLResponse
from pydantic import BaseModel
from typing import Dict, List
import json
import asyncio
from app.ai.realtime_processor import RealtimeProcessor

router = APIRouter()

# 활성 WebSocket 연결 관리
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self.processors: Dict[str, RealtimeProcessor] = {}
    
    async def connect(self, websocket: WebSocket, client_id: str, use_advanced: bool = True):
        await websocket.accept()
        self.active_connections.append(websocket)
        self.processors[client_id] = RealtimeProcessor(use_advanced_models=use_advanced)
        print(f"Client {client_id} connected with {'advanced' if use_advanced else 'basic'} models")
    
    def disconnect(self, websocket: WebSocket, client_id: str):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
        if client_id in self.processors:
            del self.processors[client_id]
        print(f"Client {client_id} disconnected")
    
    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)
    
    async def broadcast(self, message: str):
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except:
                pass

manager = ConnectionManager()

class RealtimeFrameInput(BaseModel):
    base64_image: str
    timestamp: float

class SessionControlInput(BaseModel):
    action: str  # "start", "stop", "reset"

@router.websocket("/ws/realtime/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    """실시간 비디오 분석을 위한 WebSocket 엔드포인트"""
    await manager.connect(websocket, client_id)
    processor = manager.processors[client_id]
    
    try:
        await websocket.send_text(json.dumps({
            "type": "connection_established",
            "client_id": client_id,
            "message": "실시간 분석 연결 성공"
        }))
        
        while True:
            # 클라이언트로부터 메시지 수신
            data = await websocket.receive_text()
            message = json.loads(data)
            
            if message["type"] == "frame":
                # 프레임 처리
                frame_result = processor.process_frame(message["base64_image"])
                
                # 실시간 점수 계산
                scores = processor.get_realtime_scores()
                
                # 결과 전송
                response = {
                    "type": "analysis_result",
                    "frame_result": frame_result,
                    "realtime_scores": scores,
                    "client_id": client_id
                }
                
                await manager.send_personal_message(json.dumps(response), websocket)
            
            elif message["type"] == "get_scores":
                # 현재 점수 요청
                scores = processor.get_realtime_scores()
                response = {
                    "type": "current_scores",
                    "scores": scores,
                    "client_id": client_id
                }
                await manager.send_personal_message(json.dumps(response), websocket)
            
            elif message["type"] == "reset_session":
                # 세션 리셋
                processor.reset_session()
                response = {
                    "type": "session_reset",
                    "message": "세션이 초기화되었습니다",
                    "client_id": client_id
                }
                await manager.send_personal_message(json.dumps(response), websocket)
            
            elif message["type"] == "get_summary":
                # 세션 요약
                summary = processor.get_session_summary()
                response = {
                    "type": "session_summary",
                    "summary": summary,
                    "client_id": client_id
                }
                await manager.send_personal_message(json.dumps(response), websocket)
    
    except WebSocketDisconnect:
        manager.disconnect(websocket, client_id)
    except Exception as e:
        print(f"WebSocket error: {e}")
        manager.disconnect(websocket, client_id)

@router.post("/realtime/process-frame")
async def process_single_frame(data: RealtimeFrameInput, use_advanced: bool = True):
    """단일 프레임 처리 (WebSocket 없이)"""
    try:
        processor = RealtimeProcessor(use_advanced_models=use_advanced)
        result = processor.process_frame(data.base64_image)
        
        return {
            "frame_analysis": result,
            "model_type": "advanced" if use_advanced else "basic",
            "message": "Frame processed successfully"
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Frame processing failed: {str(e)}")

@router.post("/realtime/batch-process")
async def process_batch_frames(frames: List[RealtimeFrameInput], use_advanced: bool = True):
    """여러 프레임 일괄 처리"""
    try:
        processor = RealtimeProcessor(use_advanced_models=use_advanced)
        results = []
        
        for frame_data in frames:
            result = processor.process_frame(frame_data.base64_image)
            results.append(result)
        
        # 최종 점수 계산
        final_scores = processor.get_realtime_scores()
        session_summary = processor.get_session_summary()
        
        return {
            "frame_results": results,
            "final_scores": final_scores,
            "session_summary": session_summary,
            "total_frames": len(frames),
            "model_type": "advanced" if use_advanced else "basic",
            "message": f"Processed {len(frames)} frames successfully"
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Batch processing failed: {str(e)}")

@router.post("/realtime/benchmark-models")
async def benchmark_realtime_models(frames: List[RealtimeFrameInput]):
    """실시간 처리 모델 성능 벤치마크"""
    try:
        import time
        
        # 기본 모델 벤치마크
        start_time = time.time()
        basic_processor = RealtimeProcessor(use_advanced_models=False)
        basic_results = []
        
        for frame_data in frames:
            result = basic_processor.process_frame(frame_data.base64_image)
            basic_results.append(result)
        
        basic_scores = basic_processor.get_realtime_scores()
        basic_time = time.time() - start_time
        
        # 고급 모델 벤치마크
        start_time = time.time()
        advanced_processor = RealtimeProcessor(use_advanced_models=True)
        advanced_results = []
        
        for frame_data in frames:
            result = advanced_processor.process_frame(frame_data.base64_image)
            advanced_results.append(result)
        
        advanced_scores = advanced_processor.get_realtime_scores()
        advanced_time = time.time() - start_time
        
        return {
            "benchmark_results": {
                "basic_model": {
                    "processing_time": round(basic_time, 4),
                    "avg_frame_time": round(basic_time / len(frames), 4),
                    "final_scores": basic_scores["realtime_scores"],
                    "frames_processed": len(frames)
                },
                "advanced_model": {
                    "processing_time": round(advanced_time, 4),
                    "avg_frame_time": round(advanced_time / len(frames), 4),
                    "final_scores": advanced_scores["realtime_scores"],
                    "frames_processed": len(frames)
                },
                "comparison": {
                    "speed_ratio": round(basic_time / advanced_time, 2) if advanced_time > 0 else "inf",
                    "accuracy_difference": {
                        "emotion": round(abs(advanced_scores["realtime_scores"]["emotion_score"] - basic_scores["realtime_scores"]["emotion_score"]), 3),
                        "gaze": round(abs(advanced_scores["realtime_scores"]["gaze_score"] - basic_scores["realtime_scores"]["gaze_score"]), 3),
                        "final": round(abs(advanced_scores["realtime_scores"]["final_score"] - basic_scores["realtime_scores"]["final_score"]), 3)
                    },
                    "recommended": "advanced" if advanced_scores["realtime_scores"]["final_score"] > basic_scores["realtime_scores"]["final_score"] else "basic"
                }
            },
            "total_frames": len(frames),
            "message": "Realtime model benchmark completed successfully"
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Benchmark failed: {str(e)}")

@router.get("/realtime/demo")
async def get_demo_page():
    """실시간 분석 데모 페이지"""
    html_content = """
    <!DOCTYPE html>
    <html>
    <head>
        <title>AI 집중도 분석 - 실시간 데모</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .container { max-width: 800px; margin: 0 auto; }
            .video-container { margin: 20px 0; }
            .scores { background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 10px 0; }
            .button { background: #007bff; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; margin: 5px; }
            .button:hover { background: #0056b3; }
            .status { padding: 10px; margin: 10px 0; border-radius: 5px; }
            .connected { background: #d4edda; color: #155724; }
            .disconnected { background: #f8d7da; color: #721c24; }
            #video { width: 640px; height: 480px; border: 1px solid #ccc; }
            #canvas { display: none; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🤖 AI 집중도 분석 - 실시간 데모</h1>
            
            <div class="video-container">
                <video id="video" autoplay muted></video>
                <canvas id="canvas" width="640" height="480"></canvas>
            </div>
            
            <div class="controls">
                <button class="button" onclick="startCamera()">카메라 시작</button>
                <button class="button" onclick="startAnalysis()">분석 시작</button>
                <button class="button" onclick="stopAnalysis()">분석 중지</button>
                <button class="button" onclick="resetSession()">세션 초기화</button>
            </div>
            
            <div id="status" class="status disconnected">연결 대기 중...</div>
            
            <div class="scores">
                <h3>실시간 점수</h3>
                <div id="emotion-score">감정 점수: -</div>
                <div id="gaze-score">시선 점수: -</div>
                <div id="final-score">최종 점수: -</div>
                <div id="grade">등급: -</div>
                <div id="feedback">피드백: -</div>
            </div>
            
            <div class="scores">
                <h3>세션 통계</h3>
                <div id="total-frames">처리된 프레임: -</div>
                <div id="frame-rate">프레임 레이트: -</div>
                <div id="session-duration">세션 시간: -</div>
            </div>
        </div>

        <script>
            let video = document.getElementById('video');
            let canvas = document.getElementById('canvas');
            let ctx = canvas.getContext('2d');
            let ws = null;
            let isAnalyzing = false;
            let analysisInterval = null;

            const clientId = 'demo-' + Math.random().toString(36).substr(2, 9);

            function connectWebSocket() {
                const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
                const wsUrl = `${protocol}//${window.location.host}/api/score/ws/realtime/${clientId}`;
                
                ws = new WebSocket(wsUrl);
                
                ws.onopen = function() {
                    document.getElementById('status').className = 'status connected';
                    document.getElementById('status').textContent = '연결됨';
                };
                
                ws.onmessage = function(event) {
                    const data = JSON.parse(event.data);
                    handleWebSocketMessage(data);
                };
                
                ws.onclose = function() {
                    document.getElementById('status').className = 'status disconnected';
                    document.getElementById('status').textContent = '연결 끊김';
                };
            }

            function handleWebSocketMessage(data) {
                if (data.type === 'analysis_result') {
                    updateScores(data.realtime_scores);
                } else if (data.type === 'current_scores') {
                    updateScores(data.scores);
                }
            }

            function updateScores(scores) {
                const realtime = scores.realtime_scores;
                const stats = scores.session_stats;
                const feedback = scores.feedback;

                document.getElementById('emotion-score').textContent = `감정 점수: ${realtime.emotion_score}`;
                document.getElementById('gaze-score').textContent = `시선 점수: ${realtime.gaze_score}`;
                document.getElementById('final-score').textContent = `최종 점수: ${realtime.final_score}`;
                document.getElementById('grade').textContent = `등급: ${feedback.grade}`;
                document.getElementById('feedback').textContent = `피드백: ${feedback.message}`;
                
                document.getElementById('total-frames').textContent = `처리된 프레임: ${stats.total_frames}`;
                document.getElementById('frame-rate').textContent = `프레임 레이트: ${stats.frame_rate} fps`;
                document.getElementById('session-duration').textContent = `세션 시간: ${stats.session_duration}초`;
            }

            async function startCamera() {
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                    video.srcObject = stream;
                    connectWebSocket();
                } catch (err) {
                    alert('카메라 접근 권한이 필요합니다: ' + err.message);
                }
            }

            function captureFrame() {
                ctx.drawImage(video, 0, 0, 640, 480);
                return canvas.toDataURL('image/jpeg', 0.8);
            }

            function startAnalysis() {
                if (!ws || ws.readyState !== WebSocket.OPEN) {
                    alert('먼저 WebSocket 연결이 필요합니다.');
                    return;
                }

                isAnalyzing = true;
                analysisInterval = setInterval(() => {
                    if (isAnalyzing && video.videoWidth > 0) {
                        const frameData = captureFrame();
                        ws.send(JSON.stringify({
                            type: 'frame',
                            base64_image: frameData,
                            timestamp: Date.now()
                        }));
                    }
                }, 500); // 2 fps
            }

            function stopAnalysis() {
                isAnalyzing = false;
                if (analysisInterval) {
                    clearInterval(analysisInterval);
                }
            }

            function resetSession() {
                if (ws && ws.readyState === WebSocket.OPEN) {
                    ws.send(JSON.stringify({type: 'reset_session'}));
                }
            }
        </script>
    </body>
    </html>
    """
    return HTMLResponse(content=html_content)

@router.get("/realtime/status")
async def get_realtime_status():
    """실시간 처리 상태 확인"""
    return {
        "active_connections": len(manager.active_connections),
        "active_processors": len(manager.processors),
        "message": "Realtime processing service is running"
    }