import React, { useState, useEffect } from 'react';
import axios from 'axios';

const RealtimeDashboardPage = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [springBootData, setSpringBootData] = useState(null);
  const [userId, setUserId] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
    fetchSpringBootData();
    
    // 5초마다 Spring Boot 데이터 갱신
    const interval = setInterval(() => {
      fetchSpringBootData();
    }, 5000);

    return () => clearInterval(interval);
  }, [userId]);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/api/dashboard/${userId}`);
      setDashboardData(response.data);
    } catch (err) {
      console.error('Dashboard data fetch error:', err);
    }
  };

  const fetchSpringBootData = async () => {
    try {
      setLoading(true);
      // FastAPI에서 실시간 상태 확인
      const statusResponse = await axios.get('http://localhost:8000/api/score/realtime/status');
      
      // 더미 실시간 데이터 생성 (실제로는 FastAPI에서 세션 데이터를 가져와야 함)
      const currentTime = new Date();
      const realtimeData = [];
      
      for (let i = 0; i < 10; i++) {
        const timestamp = new Date(currentTime.getTime() - (9 - i) * 30000); // 30초 간격
        realtimeData.push({
          score: Math.random() * 0.6 + 0.3, // 0.3 ~ 0.9
          createdAt: timestamp.toISOString(),
          emotion_score: Math.random() * 0.4 + 0.4,
          gaze_score: Math.random() * 0.5 + 0.3,
          final_score: Math.random() * 0.6 + 0.3,
          grade: Math.random() > 0.5 ? 'A' : Math.random() > 0.3 ? 'B' : 'C'
        });
      }
      
      setSpringBootData(realtimeData);
      setError(null);
    } catch (err) {
      setError('FastAPI 서버 연결 실패');
      console.error('FastAPI data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const RealtimeCard = ({ title, value, color = "blue", trend = null }) => (
    <div className={`bg-white p-6 rounded-lg shadow-md border-l-4 border-${color}-500 relative`}>
      <h3 className="text-lg font-semibold text-gray-700 mb-2">{title}</h3>
      <div className="text-3xl font-bold text-gray-900">{value}</div>
      {trend && (
        <div className={`absolute top-2 right-2 text-sm ${
          trend > 0 ? 'text-green-500' : trend < 0 ? 'text-red-500' : 'text-gray-500'
        }`}>
          {trend > 0 ? '↗' : trend < 0 ? '↘' : '→'}
        </div>
      )}
      <div className="mt-2">
        <div className={`w-2 h-2 rounded-full ${color === 'green' ? 'bg-green-500' : 'bg-gray-300'} inline-block mr-1`}></div>
        <span className="text-xs text-gray-500">실시간 업데이트</span>
      </div>
    </div>
  );

  const ConcentrationTimeline = ({ data }) => {
    if (!data || data.length === 0) {
      return (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">집중도 타임라인</h3>
          <p className="text-gray-500">데이터가 없습니다.</p>
        </div>
      );
    }

    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">집중도 타임라인</h3>
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {data.slice(-10).map((item, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <div>
                <div className="text-sm font-medium">점수: {item.score?.toFixed(3) || 'N/A'}</div>
                <div className="text-xs text-gray-500">
                  {item.createdAt ? new Date(item.createdAt).toLocaleTimeString('ko-KR') : '시간 미상'}
                </div>
              </div>
              <div className={`px-2 py-1 rounded text-xs font-medium ${
                (item.score || 0) >= 0.8 ? 'bg-green-100 text-green-800' :
                (item.score || 0) >= 0.6 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
              }`}>
                {(item.score || 0) >= 0.8 ? 'A' : (item.score || 0) >= 0.6 ? 'B' : 'C'}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const LiveStatus = ({ isConnected, lastUpdate }) => (
    <div className="bg-white p-4 rounded-lg shadow-md mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'} mr-2`}></div>
          <span className="font-medium">
            {isConnected ? '실시간 연결됨' : '연결 끊김'}
          </span>
        </div>
        <div className="text-sm text-gray-500">
          마지막 업데이트: {lastUpdate ? new Date(lastUpdate).toLocaleTimeString('ko-KR') : '없음'}
        </div>
      </div>
    </div>
  );

  if (loading && !dashboardData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">실시간 데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // 최신 집중도 데이터 계산
  const latestConcentration = springBootData && springBootData.length > 0 
    ? springBootData[springBootData.length - 1] 
    : null;

  const averageConcentration = springBootData && springBootData.length > 0
    ? springBootData.reduce((sum, item) => sum + (item.score || 0), 0) / springBootData.length
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            실시간 학습 분석 대시보드
          </h1>
          <p className="text-gray-600">FastAPI와 연동된 실시간 집중도 분석</p>
        </div>

        {/* 연결 상태 */}
        <LiveStatus 
          isConnected={!error && springBootData}
          lastUpdate={latestConcentration?.createdAt || Date.now()}
        />

        {error && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            ⚠️ {error}
          </div>
        )}

        {/* 실시간 지표 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <RealtimeCard 
            title="현재 집중도" 
            value={latestConcentration?.score?.toFixed(3) || '0.000'}
            color="green"
          />
          <RealtimeCard 
            title="평균 집중도" 
            value={averageConcentration.toFixed(3)}
            color="blue"
          />
          <RealtimeCard 
            title="분석 횟수" 
            value={springBootData?.length || 0}
            color="purple"
          />
          <RealtimeCard 
            title="사용자 ID" 
            value={userId}
            color="yellow"
          />
        </div>

        {/* 메인 콘텐츠 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <ConcentrationTimeline data={springBootData} />
          
          {/* 통계 요약 */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">세션 통계</h3>
            {springBootData && springBootData.length > 0 ? (
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>최고 점수:</span>
                  <span className="font-bold">{Math.max(...springBootData.map(d => d.score || 0)).toFixed(3)}</span>
                </div>
                <div className="flex justify-between">
                  <span>최저 점수:</span>
                  <span className="font-bold">{Math.min(...springBootData.map(d => d.score || 0)).toFixed(3)}</span>
                </div>
                <div className="flex justify-between">
                  <span>평균 점수:</span>
                  <span className="font-bold">{averageConcentration.toFixed(3)}</span>
                </div>
                <div className="flex justify-between">
                  <span>세션 시간:</span>
                  <span className="font-bold">
                    {springBootData.length > 0 ? `${Math.round(springBootData.length * 0.5)}분` : '0분'}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">아직 분석 데이터가 없습니다.</p>
            )}
          </div>
        </div>

        {/* FastAPI 대시보드 데이터 */}
        {dashboardData && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">전체 학습 통계 (FastAPI)</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{dashboardData.summary?.total_sessions || 0}</div>
                <div className="text-sm text-gray-600">총 세션</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{dashboardData.summary?.average_final_score || 0}</div>
                <div className="text-sm text-gray-600">평균 점수</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{dashboardData.summary?.best_score || 0}</div>
                <div className="text-sm text-gray-600">최고 점수</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{dashboardData.summary?.total_scores || 0}</div>
                <div className="text-sm text-gray-600">총 분석</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RealtimeDashboardPage;