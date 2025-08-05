import React, { useEffect, useState } from "react";

// ✅ 공용 레이아웃
import Header from "../../common/Header";
import Sidebar from "../../common/Sidebar";
import Footer from "../../common/Footer";

// ✅ 차트/카드 컴포넌트
import AttendanceRateCard from "../charts/AttendanceRateCard";
import ReviewRateCard from "../charts/ReviewRateCard";
import FocusAverageCard from "../charts/FocusAverageCard";
import FocusTimeChart from "../charts/FocusTimeChart";
import WeeklyFocusChart from "../charts/WeeklyFocusChart";
import WeeklyTestScoreChart from "../charts/WeeklyTestScoreChart";
import ResponseTimeChart from "../charts/ResponseTimeChart";

export default function UserDashboardPage() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("http://localhost:8000/api/dashboard")
      .then((res) => {
        if (!res.ok) throw new Error("API 호출 실패");
        return res.json();
      })
      .then((data) => {
        setDashboardData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("❌ Dashboard fetch error:", err);
        setError("대시보드 데이터를 불러오는 데 실패했습니다.");
        setLoading(false);
      });
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Header />

        <main className="flex-1 p-6 space-y-6">
          {loading && <div className="text-gray-500">Loading dashboard...</div>}
          {error && (
            <div className="text-red-500 font-bold">
              🚨 {error} (콘솔을 확인하세요)
            </div>
          )}

          {dashboardData && (
            <>
              {/* ✅ 상단 KPI 카드 3개 */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <AttendanceRateCard rate={dashboardData.summary.attendanceRate} />
                <ReviewRateCard rate={dashboardData.summary.reviewRate} />
                <FocusAverageCard rate={dashboardData.summary.focusAvg} />
              </div>

              {/* ✅ 하단 차트 4개 - 높이 400px 고정 + flex-1 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                <div className="bg-white p-4 rounded-2xl shadow w-full h-[420px] flex flex-col overflow-hidden">
                  <FocusTimeChart data={dashboardData.focusTime} />
                </div>
                <div className="bg-white p-4 rounded-2xl shadow w-full h-[420px] flex flex-col overflow-hidden">
                  <WeeklyFocusChart data={dashboardData.focusWeekly} />
                </div>
                <div className="bg-white p-4 rounded-2xl shadow w-full h-[420px] flex flex-col overflow-hidden">
                  <ResponseTimeChart data={dashboardData.responseTime} />
                </div>
                <div className="bg-white p-4 rounded-2xl shadow w-full h-[420px] flex flex-col overflow-hidden">
                  <WeeklyTestScoreChart data={dashboardData.testScore} />
                </div>
              </div>
            </>
          )}
        </main>

        <Footer />
      </div>
    </div>
  );
}
