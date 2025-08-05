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

const DashboardPage = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [userId, setUserId] = useState(1); // 테스트용 기본 사용자 ID
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, [userId]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:8000/api/dashboard/${userId}`);
      setDashboardData(response.data);
      setError(null);
    } catch (err) {
      setError('데이터를 불러오는데 실패했습니다.');
      console.error('Dashboard data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const ScoreCard = ({ title, value, subtitle, color = "blue" }) => (
    <div className={`bg-white p-6 rounded-lg shadow-md border-l-4 border-${color}-500`}>
      <h3 className="text-lg font-semibold text-gray-700 mb-2">{title}</h3>
      <div className="text-3xl font-bold text-gray-900">{value}</div>
      {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
    </div>
  );

  const GradeDistributionChart = ({ distribution }) => {
    const total = Object.values(distribution).reduce((sum, count) => sum + count, 0);
    
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">등급 분포</h3>
        <div className="space-y-3">
          {Object.entries(distribution).map(([grade, count]) => {
            const percentage = total > 0 ? (count / total * 100).toFixed(1) : 0;
            return (
              <div key={grade} className="flex items-center">
                <div className="w-12 text-sm font-medium text-gray-600">{grade}등급</div>
                <div className="flex-1 mx-3">
                  <div className="bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        grade === 'A' ? 'bg-green-500' : 
                        grade === 'B' ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
                <div className="text-sm text-gray-600">{count}회 ({percentage}%)</div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const DailyTrendChart = ({ dailyTrend }) => (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold text-gray-700 mb-4">최근 7일 평균 점수 추이</h3>
      <div className="space-y-2">
        {dailyTrend.map((day, index) => (
          <div key={index} className="flex items-center">
            <div className="w-20 text-sm text-gray-600">{new Date(day.date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}</div>
            <div className="flex-1 mx-3">
              <div className="bg-gray-200 rounded-full h-3">
                <div 
                  className="h-3 rounded-full bg-blue-500"
                  style={{ width: `${day.average_score * 100}%` }}
                ></div>
              </div>
            </div>
            <div className="text-sm font-medium text-gray-700">{day.average_score}</div>
          </div>
        ))}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-lg shadow-md">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <p className="text-gray-700 mb-4">{error}</p>
          <button 
            onClick={fetchDashboardData}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <p className="text-gray-600">데이터가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {dashboardData.user_name}님의 학습 대시보드
          </h1>
          <p className="text-gray-600">최근 30일간의 학습 분석 결과입니다</p>
        </div>

        {/* 주요 지표 카드들 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <ScoreCard 
            title="총 세션 수" 
            value={dashboardData.summary.total_sessions}
            subtitle="최근 30일"
            color="blue"
          />
          <ScoreCard 
            title="평균 점수" 
            value={dashboardData.summary.average_final_score}
            subtitle="전체 평균"
            color="green"
          />
          <ScoreCard 
            title="최고 점수" 
            value={dashboardData.summary.best_score}
            subtitle="개인 최고 기록"
            color="yellow"
          />
          <ScoreCard 
            title="총 분석 횟수" 
            value={dashboardData.summary.total_scores}
            subtitle="누적 분석"
            color="purple"
          />
        </div>

        {/* 상세 점수 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <ScoreCard 
            title="감정 점수" 
            value={dashboardData.detailed_averages.emotion_score}
            subtitle="감정 인식 평균"
            color="red"
          />
          <ScoreCard 
            title="시선 점수" 
            value={dashboardData.detailed_averages.gaze_score}
            subtitle="시선 추적 평균"
            color="indigo"
          />
          <ScoreCard 
            title="최종 점수" 
            value={dashboardData.detailed_averages.final_score}
            subtitle="종합 점수 평균"
            color="green"
          />
        </div>

        {/* 차트 영역 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <GradeDistributionChart distribution={dashboardData.grade_distribution} />
          <DailyTrendChart dailyTrend={dashboardData.daily_trend} />
        </div>

        {/* 최근 활동 */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">최근 활동</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {dashboardData.recent_activity.last_session && (
              <div className="border rounded-lg p-4">
                <h4 className="font-medium text-gray-800 mb-2">최근 세션</h4>
                <p className="text-sm text-gray-600">
                  세션명: {dashboardData.recent_activity.last_session.name}
                </p>
                <p className="text-sm text-gray-600">
                  시작 시간: {new Date(dashboardData.recent_activity.last_session.start_time).toLocaleString('ko-KR')}
                </p>
                <p className="text-sm text-gray-600">
                  지속 시간: {dashboardData.recent_activity.last_session.duration_minutes}분
                </p>
              </div>
            )}
            
            {dashboardData.recent_activity.best_score_info && (
              <div className="border rounded-lg p-4">
                <h4 className="font-medium text-gray-800 mb-2">최고 점수 기록</h4>
                <p className="text-sm text-gray-600">
                  점수: {dashboardData.recent_activity.best_score_info.score}
                </p>
                <p className="text-sm text-gray-600">
                  등급: {dashboardData.recent_activity.best_score_info.grade}
                </p>
                <p className="text-sm text-gray-600">
                  달성 시간: {new Date(dashboardData.recent_activity.best_score_info.timestamp).toLocaleString('ko-KR')}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;