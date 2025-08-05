import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend, Filler);

function FocusTimeChart({ data }) {
  const chartData = {
    labels: data.map((d) => d.time),
    datasets: [
      {
        label: "Focus Score",
        data: data.map((d) => d.score),
        borderColor: "orange",
        borderWidth: 2,
        pointBackgroundColor: "white",   // ✅ 내부 흰색
        pointBorderColor: "orange",      // ✅ 테두리 오렌지
        pointBorderWidth: 2,             // ✅ 테두리 두께
        pointRadius: 5,                  // ✅ 기본 점 크기
        pointHoverRadius: 7,             // ✅ Hover 시 더 크게
        tension: 0.4,
        fill: { target: "origin" },
        backgroundColor: (context) => {
          const { ctx, chartArea } = context.chart;
          if (!chartArea) return null;
          const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          gradient.addColorStop(0, "rgba(255,165,0,0.4)");
          gradient.addColorStop(1, "rgba(255,165,0,0)");
          return gradient;
        },
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true, // ✅ WeeklyTestScoreChart처럼
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, max: 100 },
    },
  };

  return (
    <div style={chartCard}>
    <h4
      style={{
        textAlign: "center",
        marginBottom: "16px",
        fontSize: "20px",
        fontWeight: "bold",
        color: "#000", 
      }}
    >시간대별 집중 점수</h4>
      <Line data={chartData} options={chartOptions} />
    </div>
  );
}

const chartCard = {
  background: "white",
  padding: "20px",
  borderRadius: "12px",
  boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
};

export default FocusTimeChart;
