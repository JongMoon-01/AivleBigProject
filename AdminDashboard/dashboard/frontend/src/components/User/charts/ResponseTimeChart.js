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

function ResponseTimeChart({ data }) {
  const chartData = {
    labels: data.map((d) => d.time),
    datasets: [
    {
      label: "Response Time",
      data: data.map((d) => d.score),
      borderColor: "#3b82f6",
      borderWidth: 2,
      pointBackgroundColor: "white",  
      pointBorderColor: "#3b82f6",     
      pointBorderWidth: 2,          
      pointRadius: 5,          
      pointHoverRadius: 7,         
      tension: 0.3,
      fill: { target: "origin" },
      backgroundColor: (context) => {
        const { ctx, chartArea } = context.chart;
        if (!chartArea) return null;
        const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
        gradient.addColorStop(0, "rgba(59,130,246,0.4)");
        gradient.addColorStop(1, "rgba(59,130,246,0)");
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
      y: { beginAtZero: true, max: 10 },
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
    >응답 시간 분포</h4>
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

export default ResponseTimeChart;
