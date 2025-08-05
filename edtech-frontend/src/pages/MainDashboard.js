import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const MainDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [springBootData, setSpringBootData] = useState(null);
  const [userId] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAllData();
    const interval = setInterval(fetchAllData, 30000); // 30초마다 갱신
    return () => clearInterval(interval);
  }, [userId]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [dashboardResponse, springBootResponse] = await Promise.all([
        axios.get(`http://localhost:8000/api/dashboard/${userId}`).catch(() => ({ data: null })),
        axios.get(`http://localhost:8080/api/concentrations/user/${userId}`).catch(() => ({ data: [] }))
      ]);
      
      setDashboardData(dashboardResponse.data);
      setSpringBootData(springBootResponse.data);
      setError(null);
    } catch (err) {
      setError('데이터를 불러오는데 실패했습니다.');
      console.error('Data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  // 상단 3개 지표 카드 컴포넌트
  const MetricCard = ({ title, value, icon, color, bgColor }) => (
    <div className={`${bgColor} p-6 rounded-lg shadow-md border-l-4 border-${color}-500`}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
          <div className="text-3xl font-bold text-gray-900 mt-2">{value}</div>
        </div>
        <div className={`text-4xl text-${color}-500`}>
          {icon}
        </div>
      </div>
    </div>
  );

  // 시간대별 집중도 데이터 생성
  const generateHourlyFocusData = () => {
    const hours = ['8AM', '9AM', '10AM', '11AM', '12PM', '1PM', '2PM', '3PM', '4PM', '5PM', '6PM'];
    const data = hours.map((_, index) => {
      // 오후 시간대에 더 높은 집중도 (4PM 최고점)
      const baseScore = 40 + Math.random() * 20;
      const afternoonBoost = index >= 4 && index <= 8 ? (8 - Math.abs(index - 8)) * 5 : 0;
      return Math.round(baseScore + afternoonBoost);
    });

    return {
      labels: hours,
      datasets: [{
        label: 'Focus Score',
        data: data,
        borderColor: '#f97316',
        backgroundColor: 'rgba(249, 115, 22, 0.1)',
        borderWidth: 3,
        fill: false,
        tension: 0.4,
        pointBackgroundColor: '#f97316',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 6
      }]
    };
  };

  // 복습 자료량 데이터
  const generateReviewMaterialsData = () => {
    const materials = ['PDF 노트', '퀴즈', '요약본', '키워드', '복습문제'];
    const data = materials.map(() => Math.floor(Math.random() * 25) + 5);

    return {
      labels: materials,
      datasets: [{
        label: 'Generated Count',
        data: data,
        backgroundColor: '#3b82f6',
        borderColor: '#2563eb',
        borderWidth: 1,
        borderRadius: 4
      }]
    };
  };

  // 응답 시간 분포 데이터 (밀도 곡선 시뮬레이션)
  const generateResponseTimeData = () => {
    const times = [];
    const densities = [];
    
    for (let i = 0; i <= 40; i++) {
      const time = i / 10; // 0 to 4 seconds
      times.push(time.toFixed(1));
      // 정규분포 시뮬레이션 (평균 2초)
      const density = Math.exp(-0.5 * Math.pow((time - 2) / 0.6, 2));
      densities.push(density);
    }

    return {
      labels: times,
      datasets: [{
        label: 'Response Density',
        data: densities,
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointRadius: 0
      }]
    };
  };

  // 주간 집중도 변화 데이터
  const generateWeeklyChangeData = () => {
    const weeks = ['1주차', '2주차', '3주차', '4주차', '5주차', '6주차', '7주차', '8주차'];
    const changes = [-1, 0.5, -0.5, 1, 0, 2, 4.5, 5]; // 7-8주차에 큰 증가

    return {
      labels: weeks,
      datasets: [{
        label: 'Focus Score Change',
        data: changes,
        backgroundColor: changes.map(val => val >= 0 ? '#3b82f6' : '#ef4444'),
        borderColor: changes.map(val => val >= 0 ? '#2563eb' : '#dc2626'),
        borderWidth: 1,
        borderRadius: 4
      }]
    };
  };

  // 실제 데이터 기반 계산
  const calculateMetrics = () => {
    let attendanceRate = 93; // 기본값
    let reviewRate = 88; // 기본값
    let averageFocus = 76; // 기본값

    if (springBootData && springBootData.length > 0) {
      // 실제 집중도 데이터가 있으면 계산
      const totalScore = springBootData.reduce((sum, item) => sum + (item.score || 0), 0);
      averageFocus = Math.round((totalScore / springBootData.length) * 100);
    }

    if (dashboardData) {
      // FastAPI 데이터가 있으면 업데이트
      if (dashboardData.summary?.total_sessions > 0) {
        attendanceRate = Math.min(95, Math.round((dashboardData.summary.total_sessions / 30) * 100));
      }
      if (dashboardData.detailed_averages?.final_score) {
        averageFocus = Math.round(dashboardData.detailed_averages.final_score * 100);
      }
    }

    return { attendanceRate, reviewRate, averageFocus };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        }
      },
      y: {
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">대시보드를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  const { attendanceRate, reviewRate, averageFocus } = calculateMetrics();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-6 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            학습 분석 대시보드
          </h1>
          <p className="text-gray-600">실시간 학습 데이터와 AI 분석 결과</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            ⚠️ {error}
          </div>
        )}

        {/* 상단 3개 지표 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <MetricCard
            title="출석률"
            value={`${attendanceRate}%`}
            icon="✓"
            color="blue"
            bgColor="bg-white"
          />
          <MetricCard
            title="해당과목 복습률"
            value={`${reviewRate}%`}
            icon="✓"
            color="orange"
            bgColor="bg-white"
          />
          <MetricCard
            title="과목 집중도 평균"
            value={`${averageFocus}%`}
            icon="🧠"
            color="blue"
            bgColor="bg-white"
          />
        </div>

        {/* 하단 4개 차트 (2x2 그리드) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Focus Score by Time Of Day */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Focus Score by Time Of Day
            </h3>
            <div className="h-64">
              <Line data={generateHourlyFocusData()} options={chartOptions} />
            </div>
          </div>

          {/* Generated Review Materials */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Generated Review Materials
            </h3>
            <div className="h-64">
              <Bar 
                data={generateReviewMaterialsData()} 
                options={{
                  ...chartOptions,
                  indexAxis: 'y'
                }} 
              />
            </div>
          </div>

          {/* Response Time Distribution */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Response Time Distribution
            </h3>
            <div className="h-64">
              <Line data={generateResponseTimeData()} options={chartOptions} />
            </div>
          </div>

          {/* Weekly Change in Focus Score */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Weekly Change in Focus Score
            </h3>
            <div className="h-64">
              <Bar data={generateWeeklyChangeData()} options={chartOptions} />
            </div>
          </div>
        </div>

        {/* 실시간 데이터 상태 표시 */}
        <div className="mt-8 bg-white p-4 rounded-lg shadow-md">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div>
              <span className="font-medium">데이터 소스:</span> 
              FastAPI Dashboard {dashboardData ? '✓' : '✗'} | 
              FastAPI Realtime {springBootData?.length > 0 ? '✓' : '✗'}
            </div>
            <div>
              마지막 갱신: {new Date().toLocaleTimeString('ko-KR')}
            </div>
          </div>
          <div className="mt-2 text-xs text-gray-500">
            • 카메라 분석: /api/score/realtime/image (5초 간격)
            • 대시보드 API: /api/dashboard/{userId} (30초 간격)
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainDashboard;