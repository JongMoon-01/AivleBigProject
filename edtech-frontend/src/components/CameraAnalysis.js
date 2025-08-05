import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import FocusMonitor from './FocusMonitor';

const CameraAnalysis = ({ userId = 1, courseId = 1 }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [realtimeData, setRealtimeData] = useState(null);
  const [sessionId] = useState(`session_${Date.now()}`);
  const [stream, setStream] = useState(null);
  const [error, setError] = useState(null);
  const [analysisHistory, setAnalysisHistory] = useState([]);

  // 카메라 시작
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480 }, 
        audio: false 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setError(null);
    } catch (err) {
      setError('카메라에 접근할 수 없습니다: ' + err.message);
      console.error('Camera error:', err);
    }
  };

  // 카메라 정지
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsAnalyzing(false);
  };

  // 프레임을 Base64로 변환하는 함수
  const captureFrameAsBase64 = () => {
    if (!videoRef.current || !canvasRef.current) return null;

    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    const video = videoRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);

    // Base64로 변환 (data:image/jpeg;base64, 부분 제거)
    const base64Image = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
    return base64Image;
  };

  // 단일 프레임 분석 (FastAPI realtime.py 사용)
  const captureAndAnalyze = async () => {
    try {
      const base64Image = captureFrameAsBase64();
      if (!base64Image) return;

      const response = await axios.post('http://localhost:8000/api/score/realtime/image', {
        base64_image: base64Image,
        timestamp: Date.now() / 1000
      }, {
        params: {
          use_advanced: true
        }
      });
      
      setAnalysisResult(response.data);
      setAnalysisHistory(prev => [...prev.slice(-9), {
        ...response.data,
        timestamp: new Date().toLocaleTimeString('ko-KR')
      }]);
      console.log('Analysis result:', response.data);
    } catch (error) {
      console.error('Analysis error:', error);
      setError('분석 중 오류가 발생했습니다: ' + error.message);
    }
  };

  // 5초마다 실시간 분석 (FastAPI realtime.py 사용)
  const startRealtimeAnalysis = () => {
    setIsAnalyzing(true);
    setError(null);
    
    const interval = setInterval(async () => {
      if (!isAnalyzing || !videoRef.current || !canvasRef.current) {
        clearInterval(interval);
        return;
      }

      try {
        const base64Image = captureFrameAsBase64();
        if (!base64Image) return;

        const response = await axios.post('http://localhost:8000/api/score/realtime/image', {
          base64_image: base64Image,
          timestamp: Date.now() / 1000
        }, {
          params: {
            use_advanced: true
          }
        });
        
        setRealtimeData({
          ...response.data,
          timestamp: new Date().toLocaleTimeString('ko-KR'),
          session_id: sessionId
        });

        // 분석 히스토리에 추가
        setAnalysisHistory(prev => [...prev.slice(-9), {
          ...response.data,
          timestamp: new Date().toLocaleTimeString('ko-KR')
        }]);
        
      } catch (error) {
        console.error('Realtime analysis error:', error);
        setError('실시간 분석 중 오류: ' + error.message);
      }
    }, 5000); // 5초마다 분석

    return () => clearInterval(interval);
  };

  // 실시간 분석 중지
  const stopRealtimeAnalysis = () => {
    setIsAnalyzing(false);
    setRealtimeData(null);
  };

  // 컴포넌트 언마운트 시 카메라 정리
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const ConcentrationMeter = ({ level, label }) => (
    <div className="mb-4">
      <div className="flex justify-between mb-1">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-sm text-gray-500">{(level * 100).toFixed(1)}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className={`h-2 rounded-full ${
            level >= 0.7 ? 'bg-green-500' : 
            level >= 0.4 ? 'bg-yellow-500' : 'bg-red-500'
          }`}
          style={{ width: `${level * 100}%` }}
        ></div>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
        AI 집중도 실시간 분석
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 카메라 영역 */}
        <div className="space-y-4">
          <div className="relative bg-gray-900 rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              muted
              className="w-full h-64 object-cover"
              style={{ transform: 'scaleX(-1)' }} // 거울 효과
            />
            <canvas
              ref={canvasRef}
              className="hidden"
            />
            
            {/* 상태 표시 */}
            {realtimeData && (
              <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-sm">
                {realtimeData.grade === 'A' && '🟢 A등급'}
                {realtimeData.grade === 'B' && '🟡 B등급'}
                {realtimeData.grade === 'C' && '🔴 C등급'}
                <div className="text-xs mt-1">점수: {realtimeData.final_score}</div>
              </div>
            )}
          </div>

          {/* 컨트롤 버튼 */}
          <div className="flex flex-wrap gap-2">
            {!stream ? (
              <button
                onClick={startCamera}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
              >
                카메라 시작
              </button>
            ) : (
              <>
                <button
                  onClick={stopCamera}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
                >
                  카메라 정지
                </button>
                <button
                  onClick={captureAndAnalyze}
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
                  disabled={isAnalyzing}
                >
                  단일 분석
                </button>
                {!isAnalyzing ? (
                  <button
                    onClick={startRealtimeAnalysis}
                    className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 transition-colors"
                  >
                    실시간 분석 시작
                  </button>
                ) : (
                  <button
                    onClick={stopRealtimeAnalysis}
                    className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 transition-colors"
                  >
                    실시간 분석 중지
                  </button>
                )}
              </>
            )}
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
        </div>

        {/* 분석 결과 영역 */}
        <div className="space-y-4">
          {/* 실시간 데이터 */}
          {realtimeData && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-3 text-gray-800">실시간 분석</h3>
              <ConcentrationMeter 
                level={realtimeData.emotion_score || 0}
                label="감정 점수"
              />
              <ConcentrationMeter 
                level={realtimeData.gaze_score || 0}
                label="시선 점수"
              />
              <ConcentrationMeter 
                level={realtimeData.final_score || 0}
                label="최종 점수"
              />
              
              <div className="text-sm text-gray-600 mt-2">
                <div>등급: <span className={`font-bold ${
                  realtimeData.grade === 'A' ? 'text-green-600' :
                  realtimeData.grade === 'B' ? 'text-yellow-600' : 'text-red-600'
                }`}>{realtimeData.grade}</span></div>
                <div className="mt-1">분석 시간: {realtimeData.timestamp}</div>
              </div>
            </div>
          )}

          {/* 단일 분석 결과 */}
          {analysisResult && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-3 text-gray-800">분석 결과</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>감정 점수:</span>
                  <span className="font-medium">{analysisResult.emotion_score}</span>
                </div>
                <div className="flex justify-between">
                  <span>시선 점수:</span>
                  <span className="font-medium">{analysisResult.gaze_score}</span>
                </div>
                <div className="flex justify-between">
                  <span>최종 점수:</span>
                  <span className="font-bold text-lg">{analysisResult.final_score}</span>
                </div>
                <div className="flex justify-between">
                  <span>등급:</span>
                  <span className={`font-bold ${
                    analysisResult.grade === 'A' ? 'text-green-600' :
                    analysisResult.grade === 'B' ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {analysisResult.grade}
                  </span>
                </div>
                <div className="mt-3 p-2 bg-white rounded border">
                  <p className="text-sm">{analysisResult.message}</p>
                </div>
              </div>
            </div>
          )}

          {/* 분석 히스토리 */}
          {analysisHistory.length > 0 && (
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-3 text-gray-800">분석 히스토리</h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {analysisHistory.slice(-5).map((result, index) => (
                  <div key={index} className="flex justify-between items-center text-sm bg-white p-2 rounded">
                    <span>{result.timestamp}</span>
                    <span className={`font-bold ${
                      result.grade === 'A' ? 'text-green-600' :
                      result.grade === 'B' ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {result.grade} ({result.final_score})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 세션 정보 */}
          <div className="bg-gray-100 p-3 rounded text-sm text-gray-600">
            <p>사용자 ID: {userId}</p>
            <p>강좌 ID: {courseId}</p>
            <p>세션 ID: {sessionId}</p>
            <p>분석 상태: {isAnalyzing ? '5초마다 실시간 분석 중 (FastAPI)' : '대기 중'}</p>
            <p>분석 횟수: {analysisHistory.length}회</p>
            <p>API 서버: FastAPI (http://localhost:8000)</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CameraAnalysis;