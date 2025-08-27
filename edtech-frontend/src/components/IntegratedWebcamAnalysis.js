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

const IntegratedWebcamAnalysis = ({ userId = 'student1', sessionId = null }) => {
  const webcamRef = useRef(null);
  const wsRef = useRef(null);
  const canvasRef = useRef(null);
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [analysisHistory, setAnalysisHistory] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [customWeights, setCustomWeights] = useState({ emotion: 0.6, gaze: 0.4 });
  const [notificationPermission, setNotificationPermission] = useState('default');
  const [isMosaicEnabled, setIsMosaicEnabled] = useState(false); // 모자이크 상태 추가

  // 알림 권한 요청
  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
      if (Notification.permission === 'default') {
        Notification.requestPermission().then((permission) => {
          setNotificationPermission(permission);
        });
      }
    }
  }, []);

  // 집중도 개선 알림 전송
  const sendLowAttentionNotification = useCallback((attentionScore) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification('집중도 알림', {
        body: `집중도가 ${attentionScore}%로 낮습니다. 잠시 휴식을 취하거나 자세를 바로 해보세요.`,
        icon: '/favicon.ico',
        tag: 'low-attention',
        requireInteraction: true
      });

      notification.onclick = function() {
        window.focus();
        notification.close();
      };

      // 5초 후 자동 닫기
      setTimeout(() => notification.close(), 5000);
    }
  }, []);

  // 차트 데이터 (통합 집중도)
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        label: '통합 집중도',
        data: [],
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.2)',
        tension: 0.3,
      },
      {
        label: '감정 기반',
        data: [],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.3,
      },
      {
        label: '시선 기반',
        data: [],
        borderColor: 'rgb(244, 63, 94)',
        backgroundColor: 'rgba(244, 63, 94, 0.1)',
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
        text: '통합 집중도 분석 (감정 + 시선)',
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
    const host = window.location.hostname;
    const wsUrl = `${protocol}//${host.replace('3000-', '8000-')}/api/ws/integrated/${userId}`;
    console.log('WebSocket URL:', wsUrl);
    const ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
      console.log('통합 분석 WebSocket 연결 성공');
      setConnectionStatus('connected');
    };
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('WebSocket 메시지:', data);
      
      if (data.type === 'connection') {
        console.log('연결 확인:', data.message);
      } else if (data.type === 'request_frame') {
        captureAndSendFrame();
      } else if (data.type === 'integrated_analysis_result') {
        handleAnalysisResult(data);
      }
    };
    
    ws.onerror = (error) => {
      console.error('WebSocket 에러:', error);
      setConnectionStatus('error');
    };
    
    ws.onclose = (event) => {
      console.log('WebSocket 연결 종료:', event.code);
      setConnectionStatus('disconnected');
    };
    
    wsRef.current = ws;
  }, [userId]);

  // 프레임 캡처 및 전송
  const captureAndSendFrame = useCallback(() => {
    if (webcamRef.current && wsRef.current?.readyState === WebSocket.OPEN) {
      const imageSrc = webcamRef.current.getScreenshot();
      
      if (imageSrc) {
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
    setAnalysisResult(data);
    
    // 집중도 30% 이하일 때 알림 전송
    if (data.integrated_attention_score <= 30) {
      sendLowAttentionNotification(data.integrated_attention_score);
    }
    
    
    // 히스토리 업데이트
    setAnalysisHistory(prev => {
      const newHistory = [...prev, {
        timestamp: new Date(data.timestamp),
        integratedScore: data.integrated_attention_score,
        emotionScore: data.emotion_analysis?.attention_score || 0,
        gazeScore: data.gaze_analysis?.attention_score || 0,
        emotion: data.emotion_analysis?.emotion || '알 수 없음',
        attention_level: data.attention_level,
      }];
      return newHistory.slice(-30); // 최대 30개 유지
    });
    
    // 차트 데이터 업데이트
    setChartData(prev => {
      const timestamp = new Date(data.timestamp).toLocaleTimeString();
      const newLabels = [...prev.labels, timestamp];
      
      const integratedData = [...prev.datasets[0].data, data.integrated_attention_score];
      const emotionData = [...prev.datasets[1].data, data.emotion_analysis?.attention_score || 0];
      const gazeData = [...prev.datasets[2].data, data.gaze_analysis?.attention_score || 0];
      
      // 최대 20개 포인트만 표시
      const maxPoints = 20;
      const startIdx = Math.max(0, newLabels.length - maxPoints);
      
      return {
        labels: newLabels.slice(startIdx),
        datasets: [
          {
            ...prev.datasets[0],
            data: integratedData.slice(startIdx),
          },
          {
            ...prev.datasets[1],
            data: emotionData.slice(startIdx),
          },
          {
            ...prev.datasets[2],
            data: gazeData.slice(startIdx),
          },
        ],
      };
    });
  }, [sendLowAttentionNotification]);

  // 얼굴 감지 격자 그리기
  const drawFaceGrid = useCallback((analysisData) => {
    const canvas = canvasRef.current;
    const webcam = webcamRef.current;
    
    if (!canvas || !webcam || !webcam.video) return;
    
    const video = webcam.video;
    const rect = video.getBoundingClientRect();
    
    // 캔버스를 비디오와 동일한 크기로 설정
    canvas.width = rect.width;
    canvas.height = rect.height;
    
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 얼굴이 감지된 경우에만 격자 그리기
    if (analysisData?.emotion_analysis?.face_detected || analysisData?.gaze_analysis?.face_detected) {
      // 얼굴 바운딩 박스 정보 가져오기 (감정 분석 또는 시선 분석에서)
      const faceBbox = analysisData?.emotion_analysis?.face_bbox || analysisData?.gaze_analysis?.face_bbox;
      
      console.log('Analysis Data:', {
        emotion_face_detected: analysisData?.emotion_analysis?.face_detected,
        gaze_face_detected: analysisData?.gaze_analysis?.face_detected,
        emotion_face_bbox: analysisData?.emotion_analysis?.face_bbox,
        gaze_face_bbox: analysisData?.gaze_analysis?.face_bbox,
        selected_bbox: faceBbox
      });
      
      let faceX, faceY, faceWidth, faceHeight;
      
      if (faceBbox && faceBbox.length === 4) {
        // 실제 감지된 얼굴 위치 사용
        let [bboxX, bboxY, bboxW, bboxH] = faceBbox;
        
        // 원본 이미지 크기를 640x480으로 가정 (일반적인 웹캠 해상도)
        const originalWidth = 640;
        const originalHeight = 480;
        
        // 캔버스 크기에 맞게 스케일링
        const scaleX = canvas.width / originalWidth;
        const scaleY = canvas.height / originalHeight;
        
        // 미러링된 좌표 보정 - X 좌표를 반전시켜서 얼굴 위치와 일치시킴
        const mirroredX = originalWidth - (bboxX + bboxW);
        
        // 바운딩 박스 크기 증가 (1.3배)
        const sizeMultiplier = 1.3;
        const expandedWidth = bboxW * sizeMultiplier;
        const expandedHeight = bboxH * sizeMultiplier;
        
        // 크기 증가에 따른 중심 조정
        const widthDiff = (expandedWidth - bboxW) / 2;
        const heightDiff = (expandedHeight - bboxH) / 2;
        
        // 얼굴 위치를 기반으로 한 좌표 계산
        let calculatedX = (mirroredX - widthDiff) * scaleX;
        let calculatedY = (bboxY - heightDiff) * scaleY;
        
        // 화면 중앙을 기준으로 한 부드러운 추적
        // 얼굴이 중앙에서 멀어질수록 더 따라가도록 가중치 적용
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const targetCenterX = calculatedX + (expandedWidth * scaleX) / 2;
        const targetCenterY = calculatedY + (expandedHeight * scaleY) / 2;
        
        // 중앙과의 차이에 따라 0.3~0.7 사이의 가중치 적용 (중앙 근처에서는 덜 움직임)
        const distanceFromCenterX = Math.abs(targetCenterX - centerX) / centerX;
        const distanceFromCenterY = Math.abs(targetCenterY - centerY) / centerY;
        const weightX = Math.min(0.7, 0.3 + distanceFromCenterX * 0.4);
        const weightY = Math.min(0.7, 0.3 + distanceFromCenterY * 0.4);
        
        // 화면 중앙 기준 좌표와 실제 얼굴 좌표의 가중 평균
        const defaultX = centerX - (expandedWidth * scaleX) / 2;
        const defaultY = centerY - (expandedHeight * scaleY) / 2;
        
        faceX = Math.max(0, defaultX * (1 - weightX) + calculatedX * weightX - 10);
        faceY = Math.max(0, defaultY * (1 - weightY) + calculatedY * weightY);
        faceWidth = Math.min(expandedWidth * scaleX, canvas.width - faceX);
        faceHeight = Math.min(expandedHeight * scaleY, canvas.height - faceY);
        
        // 최소 크기 보장 (너무 작으면 기본 크기 사용)
        if (faceWidth < 50 || faceHeight < 50) {
          console.log('Face bbox too small, using default size');
          const centerX = canvas.width / 2;
          const centerY = canvas.height / 2;
          faceWidth = 150;
          faceHeight = 200;
          faceX = centerX - faceWidth / 2;
          faceY = centerY - faceHeight / 2;
        }
        
        console.log('Face bbox:', { faceX, faceY, faceWidth, faceHeight, original: faceBbox });
      } else {
        console.log('No face bbox, using default');
        // 기본값 사용 (화면 중앙)
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        faceWidth = 150;
        faceHeight = 200;
        faceX = centerX - faceWidth / 2;
        faceY = centerY - faceHeight / 2;
      }
      
      // 모자이크 처리 (활성화된 경우)
      if (isMosaicEnabled && webcamRef.current && webcamRef.current.video) {
        const video = webcamRef.current.video;
        const mosaicSize = 15; // 모자이크 픽셀 크기
        
        // 임시 캔버스 생성하여 얼굴 영역만 모자이크 처리
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = faceWidth;
        tempCanvas.height = faceHeight;
        const tempCtx = tempCanvas.getContext('2d');
        
        // 비디오에서 얼굴 영역 추출
        tempCtx.drawImage(video, faceX, faceY, faceWidth, faceHeight, 0, 0, faceWidth, faceHeight);
        
        // 모자이크 처리
        for (let y = 0; y < faceHeight; y += mosaicSize) {
          for (let x = 0; x < faceWidth; x += mosaicSize) {
            // 각 블록의 평균 색상 계산
            const imageData = tempCtx.getImageData(x, y, mosaicSize, mosaicSize);
            const pixels = imageData.data;
            let r = 0, g = 0, b = 0, count = 0;
            
            for (let i = 0; i < pixels.length; i += 4) {
              r += pixels[i];
              g += pixels[i + 1];
              b += pixels[i + 2];
              count++;
            }
            
            // 평균 색상으로 블록 채우기
            if (count > 0) {
              tempCtx.fillStyle = `rgb(${Math.floor(r/count)}, ${Math.floor(g/count)}, ${Math.floor(b/count)})`;
              tempCtx.fillRect(x, y, mosaicSize, mosaicSize);
            }
          }
        }
        
        // 모자이크 처리된 얼굴을 원본 캔버스에 그리기
        ctx.drawImage(tempCanvas, faceX, faceY);
      }
      
      // 얼굴 바운딩 박스 (더 밝은 녹색, 두꺼운 선)
      ctx.strokeStyle = '#00ff88';
      ctx.lineWidth = 3;
      ctx.strokeRect(faceX, faceY, faceWidth, faceHeight);
      
      // 얼굴 인식 상태 표시 (격자 위쪽 왼편에 배치, 더 가깝게)
      ctx.fillStyle = '#00ff88';
      ctx.font = 'bold 14px Arial';
      const statusText = '✓ 얼굴 인식 중';
      ctx.fillText(statusText, faceX, faceY - 10);
      
      // 격자 그리기 (더 밝은 녹색, 더 두꺼운 선)
      ctx.strokeStyle = '#00ff88';
      ctx.lineWidth = 2;
      
      // 수직선
      const gridX1 = faceX + faceWidth / 3;
      const gridX2 = faceX + (faceWidth * 2) / 3;
      
      ctx.beginPath();
      ctx.moveTo(gridX1, faceY);
      ctx.lineTo(gridX1, faceY + faceHeight);
      ctx.moveTo(gridX2, faceY);
      ctx.lineTo(gridX2, faceY + faceHeight);
      ctx.stroke();
      
      // 수평선  
      const gridY1 = faceY + faceHeight / 3;
      const gridY2 = faceY + (faceHeight * 2) / 3;
      
      ctx.beginPath();
      ctx.moveTo(faceX, gridY1);
      ctx.lineTo(faceX + faceWidth, gridY1);
      ctx.moveTo(faceX, gridY2);
      ctx.lineTo(faceX + faceWidth, gridY2);
      ctx.stroke();
      
      // 얼굴 중심점
      const centerX = faceX + faceWidth / 2;
      const centerY = faceY + faceHeight / 2;
      
      // 중심점 표시 (작은 녹색 점)
      ctx.fillStyle = '#00ff88';
      ctx.beginPath();
      ctx.arc(centerX, centerY, 3, 0, 2 * Math.PI);
      ctx.fill();
      
      // 통합 집중도 점수 (격자 위쪽 중앙, 더 가깝게)
      const attentionScore = analysisData?.integrated_attention_score || 0;
      let attentionColor = '#00ff88';
      if (attentionScore < 30) {
        attentionColor = '#ff4444';
      } else if (attentionScore < 60) {
        attentionColor = '#ffaa00';
      }
      
      const scoreText = `🎯 ${attentionScore}%`;
      ctx.font = 'bold 20px Arial';
      const scoreMetrics = ctx.measureText(scoreText);
      const scoreX = faceX + faceWidth / 2 - scoreMetrics.width / 2;
      const scoreY = faceY - 15; // 바운딩 박스에 더 가깝게
      
      // 텍스트 배경
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.fillRect(scoreX - 5, scoreY - 25, scoreMetrics.width + 10, 30);
      
      ctx.fillStyle = attentionColor;
      ctx.fillText(scoreText, scoreX, scoreY);
      
      // 감정 분석 결과 (격자 왼쪽, 격자와 겹치지 않게 위치 조정)
      const emotionScore = analysisData?.emotion_analysis?.attention_score || 0;
      const emotion = analysisData?.emotion_analysis?.emotion || '알 수 없음';
      ctx.font = '14px Arial';
      
      const emotionText = `😊 감정: ${emotionScore}점`;
      const emotionMetrics = ctx.measureText(emotionText);
      const emotionX = faceX - emotionMetrics.width - 15; // 격자에서 더 멀리
      const emotionY = faceY + faceHeight / 2 - 10; // 격자 세로 중앙에 위치
      
      // 배경 - 두 줄 텍스트를 위해 높이 조정
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(emotionX - 5, emotionY - 18, emotionMetrics.width + 10, 45);
      
      ctx.fillStyle = '#4A90E2';
      ctx.fillText(emotionText, emotionX, emotionY);
      
      ctx.fillStyle = '#ffffff';
      ctx.fillText(`상태: ${emotion}`, emotionX, emotionY + 20);
      
      // 시선 분석 결과 (격자 오른쪽, 격자와 겹치지 않게 위치 조정)
      const gazeScore = analysisData?.gaze_analysis?.attention_score || 0;
      const gazeText = `👁 시선: ${gazeScore}점`;
      
      const gazeX = faceX + faceWidth + 15; // 격자에서 더 멀리
      const gazeY = faceY + faceHeight / 2 - 10; // 격자 세로 중앙에 위치
      
      // 배경
      const gazeMetrics = ctx.measureText(gazeText);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(gazeX, gazeY - 18, gazeMetrics.width + 10, 25);
      
      ctx.fillStyle = '#E24A90';
      ctx.fillText(gazeText, gazeX + 5, gazeY);
      
      // 집중도 레벨 (격자 아래쪽 중앙, 더 가깝게)
      const attentionLevel = analysisData?.attention_level || 'unknown';
      const levelText = {
        'very_high': '매우 높음',
        'high': '높음', 
        'medium': '보통',
        'low': '낮음',
        'very_low': '매우 낮음'
      }[attentionLevel] || '알 수 없음';
      
      const levelDisplayText = `레벨: ${levelText}`;
      const levelMetrics = ctx.measureText(levelDisplayText);
      const levelX = faceX + faceWidth / 2 - levelMetrics.width / 2;
      const levelY = faceY + faceHeight + 20; // 박스에 더 가깝게
      
      // 배경
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(levelX - 5, levelY - 18, levelMetrics.width + 10, 22);
      
      ctx.fillStyle = '#ffffff';
      ctx.fillText(levelDisplayText, levelX, levelY);
    } else {
      // 얼굴이 감지되지 않을 때 안내 메시지
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.fillRect(canvas.width / 2 - 150, canvas.height / 2 - 40, 300, 80);
      
      ctx.fillStyle = '#ffaa00';
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('👤 얼굴을 카메라 앞에 위치시켜 주세요', canvas.width / 2, canvas.height / 2 - 10);
      ctx.fillText('🎯 집중도 분석을 위해 정면을 바라봐 주세요', canvas.width / 2, canvas.height / 2 + 15);
      ctx.textAlign = 'left'; // 텍스트 정렬 복원
    }
  }, [isMosaicEnabled]);

  // 분석 결과가 업데이트될 때마다 격자 그리기
  useEffect(() => {
    if (analysisResult) {
      drawFaceGrid(analysisResult);
    }
  }, [analysisResult, drawFaceGrid]);

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

  // REST API를 통한 단일 분석

  // 가중치 업데이트
  const updateWeights = () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'change_weights',
        emotion_weight: customWeights.emotion,
        gaze_weight: customWeights.gaze,
      }));
    }
  };

  // 컴포넌트 정리
  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  // 집중도 레벨에 따른 색상
  const getAttentionLevelColor = (level) => {
    switch (level) {
      case 'very_high': return 'text-green-700 bg-green-100';
      case 'high': return 'text-blue-700 bg-blue-100';
      case 'medium': return 'text-yellow-700 bg-yellow-100';
      case 'low': return 'text-orange-700 bg-orange-100';
      case 'very_low': return 'text-red-700 bg-red-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  const getAttentionLevelText = (level) => {
    switch (level) {
      case 'very_high': return '매우 높음';
      case 'high': return '높음';
      case 'medium': return '보통';
      case 'low': return '낮음';
      case 'very_low': return '매우 낮음';
      default: return '분석 중';
    }
  };

  // 감정 점수 표시 컴포넌트
  const EmotionScores = ({ scores }) => {
    if (!scores || Object.keys(scores).length === 0) return null;
    
    return (
      <div className="mt-3">
        <h5 className="text-xs font-medium text-gray-600 mb-2">세부 감정 점수</h5>
        {Object.entries(scores).map(([emotion, score]) => (
          <div key={emotion} className="mb-1">
            <div className="flex justify-between text-xs">
              <span>{emotion}</span>
              <span>{(score * 100).toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1">
              <div
                className="bg-blue-500 h-1 rounded-full"
                style={{ width: `${score * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    );
  };

  // 시선 정보 표시 컴포넌트
  const GazeInfo = ({ gazeData }) => {
    if (!gazeData || !gazeData.face_detected) {
      return <div className="text-sm text-gray-500">시선 분석 불가</div>;
    }
    
    const angles = gazeData.gaze_angles_deg || {};
    
    return (
      <div className="text-sm">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-gray-600">Yaw: </span>
            <span className="font-mono">{angles.yaw || 0}°</span>
          </div>
          <div>
            <span className="text-gray-600">Pitch: </span>
            <span className="font-mono">{angles.pitch || 0}°</span>
          </div>
        </div>
        <div className="mt-2">
          <span className="text-gray-600 text-xs">신뢰도: </span>
          <span className="text-xs">{((gazeData.confidence || 0) * 100).toFixed(1)}%</span>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">통합 집중도 분석 (감정 + 시선)</h2>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">연결상태:</span>
            <span className={`px-2 py-1 rounded text-xs ${
              connectionStatus === 'connected' ? 'bg-green-100 text-green-800' :
              connectionStatus === 'error' ? 'bg-red-100 text-red-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {connectionStatus === 'connected' ? '연결됨' : 
               connectionStatus === 'error' ? '에러' : '미연결'}
            </span>
          </div>
        </div>
        
        {/* 가중치 설정 */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-medium mb-3">분석 가중치 설정</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                감정 가중치: {(customWeights.emotion * 100).toFixed(0)}%
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={customWeights.emotion}
                onChange={(e) => setCustomWeights(prev => ({
                  emotion: parseFloat(e.target.value),
                  gaze: 1 - parseFloat(e.target.value)
                }))}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                시선 가중치: {(customWeights.gaze * 100).toFixed(0)}%
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={customWeights.gaze}
                onChange={(e) => setCustomWeights(prev => ({
                  gaze: parseFloat(e.target.value),
                  emotion: 1 - parseFloat(e.target.value)
                }))}
                className="w-full"
              />
            </div>
          </div>
          <button
            onClick={updateWeights}
            className="mt-3 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
            disabled={!isAnalyzing}
          >
            가중치 적용
          </button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 웹캠 영역 */}
          <div className="lg:col-span-1">
            <div className="relative bg-gray-100 rounded-lg overflow-hidden" style={{ minHeight: '300px' }}>
              <Webcam
                ref={webcamRef}
                audio={false}
                screenshotFormat="image/jpeg"
                className="w-full h-full object-cover"
              />
              
              {/* 얼굴 격자 캔버스 오버레이 */}
              <canvas
                ref={canvasRef}
                className="absolute top-0 left-0 w-full h-full pointer-events-none"
                style={{ zIndex: 10 }}
              />
              
              <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                {connectionStatus === 'connected' && isAnalyzing ? (
                  <span className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                    분석 중
                  </span>
                ) : (
                  <span>대기 중</span>
                )}
              </div>
            </div>
            
            <div className="mt-4 space-y-2">
              <button
                onClick={toggleAnalysis}
                className={`w-full py-2 px-4 rounded-lg font-medium ${
                  isAnalyzing
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-green-500 hover:bg-green-600 text-white'
                }`}
              >
                {isAnalyzing ? '분석 중지' : '통합 분석 시작'}
              </button>
              
              <button
                onClick={() => setIsMosaicEnabled(!isMosaicEnabled)}
                className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                  isMosaicEnabled
                    ? 'bg-purple-600 hover:bg-purple-700 text-white'
                    : 'bg-gray-300 hover:bg-gray-400 text-gray-800'
                }`}
              >
                {isMosaicEnabled ? '🔒 모자이크 켜짐' : '👤 모자이크 꺼짐'}
              </button>
            </div>
          </div>
          
          {/* 분석 결과 영역 */}
          <div className="lg:col-span-2">
            {analysisResult ? (
              <div className="space-y-4">
                {/* 통합 집중도 점수 */}
                <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-lg">
                  <h3 className="text-lg opacity-90 mb-2">통합 집중도 점수</h3>
                  <div className="flex items-baseline gap-4">
                    <p className="text-4xl font-bold">{analysisResult.integrated_attention_score}</p>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${getAttentionLevelColor(analysisResult.attention_level)}`}>
                      {getAttentionLevelText(analysisResult.attention_level)}
                    </div>
                    {analysisResult.bonus_score > 0 && (
                      <span className="text-sm bg-white bg-opacity-20 px-2 py-1 rounded">
                        +{analysisResult.bonus_score} 보너스
                      </span>
                    )}
                  </div>
                </div>
                
                {/* 개별 분석 결과 */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-800 mb-2">감정 분석</h4>
                    <p className="text-2xl font-bold text-blue-900 mb-1">
                      {analysisResult.emotion_analysis?.attention_score || 0}점
                    </p>
                    <p className="text-sm text-blue-700 mb-2">
                      감정: {analysisResult.emotion_analysis?.emotion || '알 수 없음'}
                    </p>
                    <p className="text-xs text-blue-600">
                      얼굴감지: {analysisResult.emotion_analysis?.face_detected ? '성공' : '실패'}
                    </p>
                    <EmotionScores scores={analysisResult.emotion_analysis?.emotion_scores} />
                  </div>
                  
                  <div className="bg-pink-50 p-4 rounded-lg">
                    <h4 className="font-medium text-pink-800 mb-2">시선 분석</h4>
                    <p className="text-2xl font-bold text-pink-900 mb-1">
                      {analysisResult.gaze_analysis?.attention_score || 0}점
                    </p>
                    <p className="text-xs text-pink-600 mb-2">
                      얼굴감지: {analysisResult.gaze_analysis?.face_detected ? '성공' : '실패'}
                    </p>
                    <GazeInfo gazeData={analysisResult.gaze_analysis} />
                  </div>
                </div>
                
                {/* 사용된 가중치 */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-800 mb-2">적용된 가중치</h4>
                  <div className="flex gap-4 text-sm">
                    <span>감정: {(analysisResult.weights_used?.emotion * 100).toFixed(0)}%</span>
                    <span>시선: {(analysisResult.weights_used?.gaze * 100).toFixed(0)}%</span>
                  </div>
                </div>
                
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">
                분석을 시작하면 결과가 여기에 표시됩니다
              </div>
            )}
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
          <div className="mt-6 grid grid-cols-4 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <h4 className="text-sm text-gray-600">평균 통합 집중도</h4>
              <p className="text-xl font-bold">
                {(analysisHistory.reduce((sum, h) => sum + h.integratedScore, 0) / analysisHistory.length).toFixed(1)}점
              </p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <h4 className="text-sm text-gray-600">최고 집중도</h4>
              <p className="text-xl font-bold">
                {Math.max(...analysisHistory.map(h => h.integratedScore)).toFixed(1)}점
              </p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <h4 className="text-sm text-gray-600">주요 감정</h4>
              <p className="text-lg font-bold">
                {analysisHistory.length > 0 ? 
                  analysisHistory[analysisHistory.length - 1].emotion : 
                  '-'
                }
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

export default IntegratedWebcamAnalysis;