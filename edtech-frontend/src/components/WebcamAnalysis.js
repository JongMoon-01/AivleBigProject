import React, { useState, useEffect, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const WebcamAnalysis = ({ userId = 'student1', sessionId = null }) => {
  const webcamRef = useRef(null);
  const wsRef = useRef(null);
  const intervalRef = useRef(null);
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentEmotion, setCurrentEmotion] = useState('대기중');
  const [attentionScore, setAttentionScore] = useState(0);
  const [focusLevel, setFocusLevel] = useState('분석 대기');
  const [faceDetected, setFaceDetected] = useState(false);
  const [emotionScores, setEmotionScores] = useState({});
  const [analysisHistory, setAnalysisHistory] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');

  // 차트 데이터
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        label: '집중도 점수',
        data: [],
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.3,
      },
    ],
  });

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: '실시간 집중도 추이',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
      },
    },
  };

  // WebSocket 연결 (동적 프로토콜 감지)
  const connectWebSocket = useCallback(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${protocol}//8000-jongmoon01-aivlebigproj-nlz155kcbyd.ws-us121.gitpod.io/api/ws/mobilenet/${userId}`);
    
    ws.onopen = () => {
      console.log('WebSocket 연결 성공');
      setConnectionStatus('connected');
    };
    
    ws.onmessage = (event) => {
      console.log('WebSocket 메시지 수신:', event.data);
      const data = JSON.parse(event.data);
      
      if (data.type === 'connection') {
        console.log('연결 확인:', data.message);
      } else if (data.type === 'request_frame') {
        console.log('프레임 요청 받음 - 웹캠 캡처 시도');
        // 프레임 요청 시 현재 웹캠 이미지 전송
        captureAndSendFrame();
      } else if (data.type === 'analysis_result') {
        console.log('분석 결과 받음:', data);
        // 분석 결과 처리
        handleAnalysisResult(data);
      }
    };
    
    ws.onerror = (error) => {
      console.error('WebSocket 에러:', error);
      setConnectionStatus('error');
    };
    
    ws.onclose = (event) => {
      console.log('WebSocket 연결 종료:', event.code, event.reason);
      setConnectionStatus('disconnected');
    };
    
    wsRef.current = ws;
  }, [userId]);

  // 프레임 캡처 및 전송
  const captureAndSendFrame = useCallback(() => {
    console.log('캡처 시도:', {
      webcamRef: !!webcamRef.current,
      wsState: wsRef.current?.readyState,
      isOpen: wsRef.current?.readyState === WebSocket.OPEN
    });
    
    if (webcamRef.current && wsRef.current?.readyState === WebSocket.OPEN) {
      const imageSrc = webcamRef.current.getScreenshot();
      console.log('웹캠 스크린샷 캡처됨:', !!imageSrc);
      
      if (imageSrc) {
        console.log('WebSocket으로 프레임 전송');
        wsRef.current.send(JSON.stringify({
          type: 'frame',
          base64_image: imageSrc,
          session_id: sessionId,
        }));
      }
    }
  }, [sessionId]);

  // 분석 결과 처리
  const handleAnalysisResult = useCallback((data) => {
    setCurrentEmotion(data.emotion);
    setAttentionScore(data.attention_score);
    setFocusLevel(data.focus_level);
    setFaceDetected(data.face_detected);
    setEmotionScores(data.emotion_scores || {});
    
    // 히스토리 업데이트
    setAnalysisHistory(prev => {
      const newHistory = [...prev, {
        timestamp: new Date(data.timestamp),
        score: data.attention_score,
        emotion: data.emotion,
      }];
      // 최대 20개 데이터만 유지
      return newHistory.slice(-20);
    });
    
    // 차트 데이터 업데이트
    setChartData(prev => {
      const newLabels = [...prev.labels, new Date(data.timestamp).toLocaleTimeString()];
      const newData = [...prev.datasets[0].data, data.attention_score];
      
      // 최대 20개 데이터 포인트만 표시
      const maxPoints = 20;
      const startIdx = Math.max(0, newLabels.length - maxPoints);
      
      return {
        labels: newLabels.slice(startIdx),
        datasets: [{
          ...prev.datasets[0],
          data: newData.slice(startIdx),
        }],
      };
    });
  }, []);

  // 분석 시작/중지
  const toggleAnalysis = () => {
    if (isAnalyzing) {
      stopAnalysis();
    } else {
      startAnalysis();
    }
  };

  const startAnalysis = () => {
    setIsAnalyzing(true);
    connectWebSocket();
  };

  const stopAnalysis = () => {
    setIsAnalyzing(false);
    if (wsRef.current) {
      wsRef.current.send(JSON.stringify({ type: 'stop' }));
      wsRef.current.close();
    }
  };

  // REST API를 통한 단일 분석 (테스트용)
  const analyzeCurrentFrame = async () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        try {
          const response = await fetch('https://8000-jongmoon01-aivlebigproj-nlz155kcbyd.ws-us121.gitpod.io/api/mobilenet/analyze', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              base64_image: imageSrc,
              user_id: userId,
              session_id: sessionId,
            }),
          });
          
          if (response.ok) {
            const data = await response.json();
            handleAnalysisResult({
              ...data,
              type: 'analysis_result',
              focus_level: getFocusLevel(data.attention_score),
            });
          }
        } catch (error) {
          console.error('분석 에러:', error);
        }
      }
    }
  };

  const getFocusLevel = (score) => {
    if (score >= 80) return '매우 집중';
    if (score >= 60) return '집중';
    if (score >= 40) return '보통';
    if (score >= 20) return '산만';
    return '매우 산만';
  };

  // 컴포넌트 정리
  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // 감정 점수 막대 그래프 컴포넌트
  const EmotionBars = ({ scores }) => {
    const emotions = Object.entries(scores);
    if (emotions.length === 0) return null;
    
    return (
      <div className="mt-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">감정 분석 상세</h4>
        {emotions.map(([emotion, score]) => (
          <div key={emotion} className="mb-2">
            <div className="flex justify-between text-xs mb-1">
              <span>{emotion}</span>
              <span>{(score * 100).toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${score * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6">실시간 학습 태도 분석</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 웹캠 영역 */}
          <div>
            <div className="relative bg-gray-100 rounded-lg overflow-hidden" style={{ minHeight: '400px' }}>
              <Webcam
                ref={webcamRef}
                audio={false}
                screenshotFormat="image/jpeg"
                className="w-full h-full object-cover"
              />
              
              {/* 상태 표시 오버레이 */}
              <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white px-3 py-1 rounded">
                {connectionStatus === 'connected' && isAnalyzing ? (
                  <span className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                    분석 중
                  </span>
                ) : (
                  <span>대기 중</span>
                )}
              </div>
              
              {/* 얼굴 감지 상태 */}
              <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-3 py-1 rounded">
                {faceDetected ? '얼굴 감지됨' : '얼굴 미감지'}
              </div>
            </div>
            
            {/* 제어 버튼 */}
            <div className="mt-4 flex gap-2">
              <button
                onClick={toggleAnalysis}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                  isAnalyzing
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
              >
                {isAnalyzing ? '분석 중지' : '분석 시작'}
              </button>
              
              <button
                onClick={analyzeCurrentFrame}
                className="py-2 px-4 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
                disabled={isAnalyzing}
              >
                단일 분석
              </button>
            </div>
          </div>
          
          {/* 분석 결과 영역 */}
          <div>
            {/* 현재 상태 카드 */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-lg">
                <h3 className="text-sm opacity-90">현재 감정</h3>
                <p className="text-2xl font-bold">{currentEmotion}</p>
              </div>
              
              <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-lg">
                <h3 className="text-sm opacity-90">집중도 점수</h3>
                <p className="text-2xl font-bold">{attentionScore}점</p>
              </div>
            </div>
            
            {/* 집중도 레벨 */}
            <div className="bg-gray-100 p-4 rounded-lg mb-4">
              <h3 className="text-sm text-gray-600 mb-2">집중도 레벨</h3>
              <div className="flex items-center">
                <div className={`text-2xl font-bold ${
                  attentionScore >= 80 ? 'text-green-600' :
                  attentionScore >= 60 ? 'text-blue-600' :
                  attentionScore >= 40 ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {focusLevel}
                </div>
              </div>
            </div>
            
            {/* 감정 점수 상세 */}
            <EmotionBars scores={emotionScores} />
          </div>
        </div>
        
        {/* 차트 영역 */}
        <div className="mt-6">
          <div className="bg-gray-50 p-4 rounded-lg" style={{ height: '300px' }}>
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>
        
        {/* 통계 정보 */}
        {analysisHistory.length > 0 && (
          <div className="mt-6 grid grid-cols-3 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <h4 className="text-sm text-gray-600">평균 집중도</h4>
              <p className="text-xl font-bold">
                {(analysisHistory.reduce((sum, h) => sum + h.score, 0) / analysisHistory.length).toFixed(1)}점
              </p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <h4 className="text-sm text-gray-600">최고 집중도</h4>
              <p className="text-xl font-bold">
                {Math.max(...analysisHistory.map(h => h.score))}점
              </p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <h4 className="text-sm text-gray-600">분석 횟수</h4>
              <p className="text-xl font-bold">{analysisHistory.length}회</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WebcamAnalysis;