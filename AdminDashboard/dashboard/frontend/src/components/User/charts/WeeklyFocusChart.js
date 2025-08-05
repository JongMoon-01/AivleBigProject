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

function WeeklyFocusChart({ data }) {
  const chartData = {
    labels: data.map((d) => d.week),
    datasets: [
      {
        label: "Focus Score Change",
        data: data.map((d) => d.score),  // ✅ 수정
        backgroundColor: data.map((d) =>
          d.score >= 0 ? "rgba(75, 192, 192, 0.6)" : "rgba(255, 99, 132, 0.6)"
        ),
        borderColor: data.map((d) =>
          d.score >= 0 ? "rgb(75, 192, 192)" : "rgb(255, 99, 132)"
        ),
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
      y: { beginAtZero: true },
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
    >주간 집중 점수 변화</h4>
      <div style={{ height: "300px" }}>
      <Bar data={chartData} options={chartOptions} />
      </div>
    </div>
  );
}

const chartCard = {
  background: "white",
  padding: "20px",
  borderRadius: "12px",
  boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
};



export default WeeklyFocusChart;
