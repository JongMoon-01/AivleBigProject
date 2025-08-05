import React from "react";

function ReviewRateCard({ rate }) {
  return (
    <div style={cardStyle}>
      <div style={iconStyle}>✔️</div>
      <div style={titleStyle}>해당과목 복습률</div>
      <div style={valueStyle}>{rate}%</div>
    </div>
  );
}

const cardStyle = {
  background: "white",
  borderRadius: "12px",
  padding: "20px",
  boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
};

const iconStyle = { fontSize: "24px", marginBottom: "8px" };
const titleStyle = { fontSize: "14px", color: "#666" };
const valueStyle = { fontSize: "24px", fontWeight: "bold", marginTop: "4px" };

export default ReviewRateCard;
