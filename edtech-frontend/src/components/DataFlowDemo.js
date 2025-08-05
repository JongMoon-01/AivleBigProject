import React, { useState, useEffect } from 'react';

const DataFlowDemo = () => {
  const [step, setStep] = useState(0);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [analysisHistory, setAnalysisHistory] = useState([]);

  // 5초마다 자동으로 더미 분석 결과 생성
  useEffect(() => {
    const interval = setInterval(() => {
      generateMockAnalysis();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const generateMockAnalysis = () => {
    const mockResult = {
      emotion_score: Math.round((Math.random() * 0.4 + 0.5) * 1000) / 1000, // 0.5-0.9
      gaze_score: Math.round((Math.random() * 0.5 + 0.4) * 1000) / 1000,    // 0.4-0.9
      final_score: 0,
      grade: '',
      message: "Frame processed successfully",
      timestamp: new Date().toLocaleTimeString('ko-KR')
    };

    // 최종 점수 계산 (감정 40% + 시선 30% + 작업 30%)
    mockResult.final_score = Math.round((0.4 * mockResult.emotion_score + 0.3 * mockResult.gaze_score + 0.3 * 0.7) * 1000) / 1000;

    // 등급 계산
    if (mockResult.final_score >= 0.8) mockResult.grade = 'A';
    else if (mockResult.final_score >= 0.6) mockResult.grade = 'B';
    else mockResult.grade = 'C';

    setAnalysisResult(mockResult);
    setAnalysisHistory(prev => [...prev.slice(-9), mockResult]);
  };

  const steps = [
    {
      title: "1. 웹캠 프레임 캡처",
      description: "사용자의 웹캠에서 5초마다 프레임을 캡처합니다.",
      code: `
// 카메라에서 프레임 캡처
const canvas = canvasRef.current;
const context = canvas.getContext('2d');
const video = videoRef.current;

canvas.width = video.videoWidth;
canvas.height = video.videoHeight;
context.drawImage(video, 0, 0);

// Base64로 변환
const base64Image = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
      `
    },
    {
      title: "2. FastAPI로 전송",
      description: "Base64 이미지 데이터를 FastAPI realtime 엔드포인트로 전송합니다.",
      code: `
POST http://localhost:8000/api/score/realtime/image

요청 데이터:
{
  "base64_image": "/9j/4AAQSkZJRgABAQAAAQABAAD/2wBD...",
  "timestamp": 1704067200.123
}

파라미터:
?use_advanced=true
      `
    },
    {
      title: "3. AI 모델 분석",
      description: "FastAPI에서 RealtimeProcessor로 감정 인식, 시선 추적을 수행합니다.",
      code: `
processor = RealtimeProcessor(use_advanced_models=True)
processor.process_frame(base64_image)
scores = processor.get_realtime_scores()

AI 분석 과정:
- 얼굴 감정 인식 (emotion_score)
- 시선 방향 추적 (gaze_score)  
- 최종 집중도 계산 (final_score)
      `
    },
    {
      title: "4. JSON 응답 생성",
      description: "분석 결과를 JSON 형태로 응답합니다.",
      code: `
응답 데이터:
{
  "emotion_score": 0.756,
  "gaze_score": 0.834,
  "final_score": 0.792,
  "grade": "A", 
  "message": "Frame processed successfully"
}
      `
    },
    {
      title: "5. 대시보드 업데이트",
      description: "프론트엔드에서 결과를 받아 실시간으로 UI를 업데이트합니다.",
      code: `
// 실시간 데이터 상태 업데이트
setRealtimeData({
  ...response.data,
  timestamp: new Date().toLocaleTimeString('ko-KR'),
  session_id: sessionId
});

// 분석 히스토리에 추가
setAnalysisHistory(prev => [...prev.slice(-9), response.data]);
      `
    }
  ];

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
        📊 데이터 플로우 & 결과 시연
      </h2>

      {/* 단계별 설명 */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-2 mb-6">
          {steps.map((_, index) => (
            <button
              key={index}
              onClick={() => setStep(index)}
              className={`px-4 py-2 rounded ${
                step === index 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              단계 {index + 1}
            </button>
          ))}
        </div>

        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-3">{steps[step].title}</h3>
          <p className="text-gray-700 mb-4">{steps[step].description}</p>
          <pre className="bg-gray-900 text-green-400 p-4 rounded overflow-x-auto text-sm">
            {steps[step].code}
          </pre>
        </div>
      </div>

      {/* 분석 결과 시뮬레이션 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 현재 분석 결과 */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-3 text-gray-800">
            🔴 실시간 분석 결과 (5초마다 갱신)
          </h3>
          {analysisResult ? (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span>감정 점수:</span>
                <div className="flex items-center">
                  <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${analysisResult.emotion_score * 100}%` }}
                    ></div>
                  </div>
                  <span className="font-medium">{analysisResult.emotion_score}</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span>시선 점수:</span>
                <div className="flex items-center">
                  <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${analysisResult.gaze_score * 100}%` }}
                    ></div>
                  </div>
                  <span className="font-medium">{analysisResult.gaze_score}</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span>최종 점수:</span>
                <div className="flex items-center">
                  <div className="w-20 bg-gray-200 rounded-full h-3 mr-2">
                    <div 
                      className="bg-purple-500 h-3 rounded-full"
                      style={{ width: `${analysisResult.final_score * 100}%` }}
                    ></div>
                  </div>
                  <span className="font-bold text-lg">{analysisResult.final_score}</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-white rounded border">
                <span>등급:</span>
                <span className={`text-2xl font-bold ${
                  analysisResult.grade === 'A' ? 'text-green-600' :
                  analysisResult.grade === 'B' ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {analysisResult.grade}
                </span>
              </div>
              
              <div className="text-sm text-gray-600 text-center">
                📅 {analysisResult.timestamp}
              </div>
            </div>
          ) : (
            <div className="text-gray-500 text-center py-8">
              분석 결과 대기 중... (5초 후 자동 생성)
            </div>
          )}
        </div>

        {/* 분석 히스토리 */}
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-3 text-gray-800">
            📈 분석 히스토리 (최근 10개)
          </h3>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {analysisHistory.length > 0 ? (
              analysisHistory.slice(-10).reverse().map((result, index) => (
                <div key={index} className="flex justify-between items-center bg-white p-3 rounded shadow-sm">
                  <div>
                    <div className="font-medium">점수: {result.final_score}</div>
                    <div className="text-xs text-gray-500">{result.timestamp}</div>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-bold ${
                      result.grade === 'A' ? 'text-green-600' :
                      result.grade === 'B' ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {result.grade}
                    </div>
                    <div className="text-xs text-gray-500">
                      감정:{result.emotion_score} | 시선:{result.gaze_score}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-gray-500 text-center py-8">
                아직 분석 결과가 없습니다
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 대시보드 표출 방식 */}
      <div className="mt-8 bg-yellow-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold mb-3 text-gray-800">
          🎯 대시보드 표출 방식
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded border">
            <h4 className="font-medium mb-2">📊 메인 대시보드</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• 시간대별 집중도 그래프</li>
              <li>• 주간 변화 추이</li>
              <li>• 등급 분포 차트</li>
              <li>• 30초마다 자동 갱신</li>
            </ul>
          </div>
          
          <div className="bg-white p-4 rounded border">
            <h4 className="font-medium mb-2">📹 카메라 분석</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• 실시간 점수 미터</li>
              <li>• A/B/C 등급 표시</li>
              <li>• 분석 히스토리</li>
              <li>• 5초마다 분석</li>
            </ul>
          </div>
          
          <div className="bg-white p-4 rounded border">
            <h4 className="font-medium mb-2">⚡ 실시간 대시보드</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• 집중도 타임라인</li>
              <li>• 세션 통계</li>
              <li>• 연결 상태 표시</li>
              <li>• FastAPI 상태 모니터링</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 자동 분석 시작 버튼 */}
      <div className="mt-6 text-center">
        <button
          onClick={generateMockAnalysis}
          className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
        >
          🎲 지금 분석 결과 생성하기
        </button>
        <p className="mt-2 text-sm text-gray-600">
          실제로는 5초마다 자동으로 카메라 분석이 실행됩니다
        </p>
      </div>
    </div>
  );
};

export default DataFlowDemo;