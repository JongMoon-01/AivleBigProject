import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function WeeklyTestScoreChart({ data = [] }) {
  const chartData = {
    labels: data.map((d) => d.week),
    datasets: [
      {
        label: "주간 시험 점수",
        data: data.map((d) => d.score),
        backgroundColor: "rgba(147, 197, 253, 0.6)", // 투명 하늘색
        borderColor: "rgba(147, 197, 253, 1)",        // 테두리 불투명
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
    },
    scales: {
      x: {
        grid: { color: "rgba(0, 0, 0, 0.06)" },
        ticks: { color: "#4b5563" },
      },
      y: {
        beginAtZero: true,
        max: 100,
        grid: { color: "rgba(0, 0, 0, 0.06)" },
        ticks: { color: "#4b5563" },
      },
    },
  };

  return (
    <div
      style={{
        background: "white",
        padding: "20px",
        borderRadius: "12px",
        boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
        width: "100%",
      }}
    >
      {/* 🔹 제목 가운데 정렬 */}
      <h2
        style={{
          textAlign: "center",
          marginBottom: "16px",
          fontSize: "20px",
          fontWeight: "bold",
          color: "#000",
        }}
      >
        주간 시험 점수
      </h2>

      <div style={{ height: "300px" }}>
        <Bar data={chartData} options={chartOptions} />
      </div>
    </div>
  );
}
