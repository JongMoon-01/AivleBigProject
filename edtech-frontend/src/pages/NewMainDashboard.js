import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
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
  Filler,
  ChartOptions
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

const NewMainDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const location = useLocation();
  
  // URL 파라미터에서 userId 추출 (기본값: 1)
  const searchParams = new URLSearchParams(location.search);
  const userId = searchParams.get('userId') || '1';

  useEffect(() => {
    fetchDashboardData();
  }, [userId]);

  const fetchDashboardData = async () => {
    try {
      // Spring Boot 백엔드에서 데이터 가져오기
      const response = await fetch(`http://localhost:8080/api/dashboard/user/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setDashboardData(data);
      } else {
        // 백엔드 연결 실패 시 더미 데이터 사용
        console.warn('백엔드 연결 실패, 더미 데이터 사용');
        useMockData();
      }
    } catch (error) {
      console.error('API 호출 실패:', error);
      useMockData();
    }
  };

  const useMockData = () => {
    // 사용자별 차별화된 더미 데이터
    const userDataMap = {
      '1': {
        kpi: { attendance: 93, reviewRate: 88, focusAverage: 76 },
        focusData: [
          {"time": "8AM", "score": 0},
          {"time": "10AM", "score": 10}, 
          {"time": "12PM", "score": 25},
          {"time": "2PM", "score": 60},
          {"time": "4PM", "score": 70},
          {"time": "6PM", "score": 35}
        ]
      },
      '2': {
        kpi: { attendance: 88, reviewRate: 92, focusAverage: 82 },
        focusData: [
          {"time": "8AM", "score": 15},
          {"time": "10AM", "score": 20}, 
          {"time": "12PM", "score": 45},
          {"time": "2PM", "score": 75},
          {"time": "4PM", "score": 65},
          {"time": "6PM", "score": 30}
        ]
      },
      '3': {
        kpi: { attendance: 95, reviewRate: 78, focusAverage: 71 },
        focusData: [
          {"time": "8AM", "score": 5},
          {"time": "10AM", "score": 15}, 
          {"time": "12PM", "score": 30},
          {"time": "2PM", "score": 50},
          {"time": "4PM", "score": 55},
          {"time": "6PM", "score": 60}
        ]
      },
      '4': {
        kpi: { attendance: 85, reviewRate: 85, focusAverage: 79 },
        focusData: [
          {"time": "8AM", "score": 8},
          {"time": "10AM", "score": 18}, 
          {"time": "12PM", "score": 35},
          {"time": "2PM", "score": 65},
          {"time": "4PM", "score": 60},
          {"time": "6PM", "score": 45}
        ]
      }
    };

    const currentUserData = userDataMap[userId] || userDataMap['1'];
    
    const mockData = {
      "kpiMetrics": {
        "attendance": {
          "value": currentUserData.kpi.attendance,
          "unit": "%",
          "label": "출석률",
          "icon": "✓",
          "color": "blue"
        },
        "reviewRate": {
          "value": currentUserData.kpi.reviewRate,
          "unit": "%", 
          "label": "해당과목 복습률",
          "icon": "✓",
          "color": "orange"
        },
        "focusAverage": {
          "value": currentUserData.kpi.focusAverage,
          "unit": "%",
          "label": "과목 집중도 평균", 
          "icon": "🧠",
          "color": "cyan"
        }
      },
      "charts": {
        "focusScoreByTime": {
          "title": "Focus Score by Time Of Day",
          "type": "area",
          "data": currentUserData.focusData,
          "color": "#F59E0B",
          "fillOpacity": 0.2
        },
        "reviewMaterials": {
          "title": "Generated Review Materials",
          "type": "horizontalBar",
          "data": [
            {"category": "PDF 노트", "duration": 2.8},
            {"category": "퀴즈", "duration": 2.5},
            {"category": "요약본", "duration": 3.0},
            {"category": "키워드", "duration": 2.2},
            {"category": "복습문제", "duration": 2.7}
          ],
          "color": "#3B82F6",
          "xAxisLabel": "Seconds"
        },
        "responseTimeDistribution": {
          "title": "Response Time Distribution", 
          "type": "density",
          "data": [
            {"time": 0, "density": 0},
            {"time": 0.5, "density": 0.3},
            {"time": 1, "density": 0.7},
            {"time": 1.5, "density": 0.9},
            {"time": 2, "density": 1.0},
            {"time": 2.5, "density": 0.8},
            {"time": 3, "density": 0.4},
            {"time": 3.5, "density": 0.1},
            {"time": 4, "density": 0}
          ],
          "color": "#3B82F6",
          "fillGradient": true
        },
        "weeklyFocusChange": {
          "title": "Weekly Change in Focus Score",
          "type": "bar",
          "data": [
            {"week": "1주차", "change": -1},
            {"week": "2주차", "change": 0.5},
            {"week": "3주차", "change": -0.5},
            {"week": "4주차", "change": 1},
            {"week": "5주차", "change": 0},
            {"week": "6주차", "change": 2},
            {"week": "7주차", "change": 4.5},
            {"week": "8주차", "change": 5}
          ],
          "color": "#3B82F6",
          "showLabels": true,
          "zeroLineColor": "#6B7280"
        }
      },
      "navigation": {
        "activeItem": "수업 일정",
        "items": [
          {"name": "수업 일정", "icon": "🏠", "active": true},
          {"name": "강의 콘텐츠", "icon": "🏢", "active": false},
          {"name": "Lecture Summary", "icon": "📚", "active": false, "highlighted": true},
          {"name": "강의 자료실", "icon": "📁", "active": false},
          {"name": "기타", "icon": "☕", "active": false}
        ]
      }
    };

    setDashboardData(mockData);
  };

  // KPI 메트릭 카드 컴포넌트
  const KPICard = ({ metric }) => {
    const colorClasses = {
      blue: 'border-blue-500 text-blue-600',
      orange: 'border-orange-500 text-orange-600',
      cyan: 'border-cyan-500 text-cyan-600'
    };

    return (
      <div className={`bg-white p-6 rounded-lg shadow-md border-l-4 ${colorClasses[metric.color]}`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">{metric.label}</h3>
            <div className="text-3xl font-bold text-gray-900">
              {metric.value}{metric.unit}
            </div>
          </div>
          <div className="text-4xl">
            {metric.icon}
          </div>
        </div>
      </div>
    );
  };

  // Focus Score by Time Chart
  const FocusScoreChart = ({ chartData }) => {
    const data = {
      labels: chartData.data.map(item => item.time),
      datasets: [{
        label: 'Focus Score',
        data: chartData.data.map(item => item.score),
        borderColor: chartData.color,
        backgroundColor: `${chartData.color}33`, // 20% opacity
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: chartData.color,
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 6
      }]
    };

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          mode: 'index',
          intersect: false,
        }
      },
      scales: {
        x: { 
          grid: { display: false },
          ticks: { color: '#6B7280' }
        },
        y: { 
          min: 0,
          max: 80,
          grid: { color: 'rgba(0, 0, 0, 0.1)' },
          ticks: { color: '#6B7280' }
        }
      },
      interaction: {
        mode: 'nearest',
        axis: 'x',
        intersect: false
      }
    };

    return <Line data={data} options={options} />;
  };

  // Review Materials Chart (Horizontal Bar)
  const ReviewMaterialsChart = ({ chartData }) => {
    const data = {
      labels: chartData.data.map(item => item.category),
      datasets: [{
        label: chartData.xAxisLabel,
        data: chartData.data.map(item => item.duration),
        backgroundColor: chartData.color,
        borderColor: chartData.color,
        borderWidth: 1,
        borderRadius: 4,
        borderSkipped: false,
      }]
    };

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: 'y',
      plugins: {
        legend: { display: false },
        tooltip: {
          mode: 'index',
          intersect: false,
          callbacks: {
            label: function(context) {
              return context.dataset.label + ': ' + context.parsed.x.toFixed(1) + 's';
            }
          }
        }
      },
      scales: {
        x: { 
          min: 0,
          max: 3.5,
          grid: { color: 'rgba(0, 0, 0, 0.1)' },
          ticks: { 
            color: '#6B7280',
            callback: function(value) {
              return value + 's';
            }
          }
        },
        y: { 
          grid: { display: false },
          ticks: { color: '#6B7280' }
        }
      }
    };

    return <Bar data={data} options={options} />;
  };

  // Response Time Distribution Chart (Density Curve)
  const ResponseTimeChart = ({ chartData }) => {
    const data = {
      labels: chartData.data.map(item => item.time),
      datasets: [{
        label: 'Response Density',
        data: chartData.data.map(item => item.density),
        borderColor: chartData.color,
        backgroundColor: chartData.fillGradient 
          ? `${chartData.color}33`
          : 'transparent',
        borderWidth: 2,
        fill: chartData.fillGradient,
        tension: 0.4,
        pointRadius: 0
      }]
    };

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          mode: 'index',
          intersect: false,
          callbacks: {
            label: function(context) {
              return 'Density: ' + context.parsed.y.toFixed(3);
            }
          }
        }
      },
      scales: {
        x: { 
          min: 0,
          max: 4,
          grid: { color: 'rgba(0, 0, 0, 0.1)' },
          ticks: { 
            color: '#6B7280',
            callback: function(value) {
              return value + 's';
            }
          }
        },
        y: { 
          min: 0,
          max: 1.0,
          grid: { color: 'rgba(0, 0, 0, 0.1)' },
          ticks: { 
            color: '#6B7280',
            stepSize: 0.2
          }
        }
      }
    };

    return <Line data={data} options={options} />;
  };

  // Weekly Focus Change Chart
  const WeeklyChangeChart = ({ chartData }) => {
    const data = {
      labels: chartData.data.map(item => item.week),
      datasets: [{
        label: 'Focus Score Change',
        data: chartData.data.map(item => item.change),
        backgroundColor: chartData.data.map(item => 
          item.change >= 0 ? chartData.color : '#EF4444'
        ),
        borderColor: chartData.data.map(item => 
          item.change >= 0 ? '#2563EB' : '#DC2626'
        ),
        borderWidth: 1,
        borderRadius: 4,
        borderSkipped: false,
      }]
    };

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          mode: 'index',
          intersect: false,
          callbacks: {
            label: function(context) {
              const value = context.parsed.y;
              return 'Change: ' + (value > 0 ? '+' + value : value);
            }
          }
        }
      },
      scales: {
        x: { 
          grid: { display: false },
          ticks: { color: '#6B7280' }
        },
        y: { 
          min: -6,
          max: 6,
          grid: { 
            color: function(context) {
              if (context.tick.value === 0) {
                return chartData.zeroLineColor;
              }
              return 'rgba(0, 0, 0, 0.1)';
            },
            lineWidth: function(context) {
              if (context.tick.value === 0) {
                return 2;
              }
              return 1;
            }
          },
          ticks: { 
            color: '#6B7280',
            stepSize: 1,
            callback: function(value) {
              return value > 0 ? '+' + value : value;
            }
          }
        }
      }
    };

    return <Bar data={data} options={options} />;
  };

  // Navigation Menu
  const NavigationMenu = ({ navigation }) => {
    return (
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="flex flex-wrap gap-2">
          {navigation.items.map((item, index) => (
            <button
              key={index}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                item.active 
                  ? 'bg-blue-500 text-white' 
                  : item.highlighted
                  ? 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span>{item.icon}</span>
              <span className="text-sm font-medium">{item.name}</span>
            </button>
          ))}
        </div>
      </div>
    );
  };

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-6 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                학습 관리 대시보드
              </h1>
              <p className="text-gray-600">실시간 학습 데이터 및 성과 분석</p>
            </div>
            {/* 사용자 선택 드롭다운 */}
            <div className="bg-white p-4 rounded-lg shadow-md">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                사용자 선택:
              </label>
              <select 
                value={userId} 
                onChange={(e) => {
                  const newUserId = e.target.value;
                  window.history.pushState({}, '', `?userId=${newUserId}`);
                  window.location.reload();
                }}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="1">사용자 1 (기본)</option>
                <option value="2">사용자 2 (우수)</option>
                <option value="3">사용자 3 (저조)</option>
                <option value="4">사용자 4 (보통)</option>
              </select>
            </div>
          </div>
        </div>

        {/* 네비게이션 메뉴 */}
        <NavigationMenu navigation={dashboardData.navigation} />

        {/* KPI 메트릭스 카드 (상단 3개) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <KPICard metric={dashboardData.kpiMetrics.attendance} />
          <KPICard metric={dashboardData.kpiMetrics.reviewRate} />
          <KPICard metric={dashboardData.kpiMetrics.focusAverage} />
        </div>

        {/* 차트 영역 (2x2 그리드) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Focus Score by Time Of Day */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              {dashboardData.charts.focusScoreByTime.title}
            </h3>
            <div className="h-64">
              <FocusScoreChart chartData={dashboardData.charts.focusScoreByTime} />
            </div>
          </div>

          {/* Generated Review Materials */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              {dashboardData.charts.reviewMaterials.title}
            </h3>
            <div className="h-64">
              <ReviewMaterialsChart chartData={dashboardData.charts.reviewMaterials} />
            </div>
          </div>

          {/* Response Time Distribution */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              {dashboardData.charts.responseTimeDistribution.title}
            </h3>
            <div className="h-64">
              <ResponseTimeChart chartData={dashboardData.charts.responseTimeDistribution} />
            </div>
          </div>

          {/* Weekly Change in Focus Score */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              {dashboardData.charts.weeklyFocusChange.title}
            </h3>
            <div className="h-64">
              <WeeklyChangeChart chartData={dashboardData.charts.weeklyFocusChange} />
            </div>
          </div>
        </div>

        {/* 데이터 소스 정보 */}
        <div className="mt-8 bg-white p-4 rounded-lg shadow-md">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div>
              <span className="font-medium">현재 사용자:</span> 사용자 {userId}
            </div>
            <div>
              <span className="font-medium">활성 네비게이션:</span> {dashboardData.navigation?.activeItem || 'N/A'}
            </div>
            <div>
              마지막 갱신: {new Date().toLocaleTimeString('ko-KR')}
            </div>
          </div>
          <div className="mt-2 text-xs text-gray-500">
            • 데이터 소스: Spring Boot Backend (http://localhost:8080)
            • API 엔드포인트: /api/dashboard/user/{userId}
            • 백엔드 연결 실패 시 더미 데이터 표시
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewMainDashboard;