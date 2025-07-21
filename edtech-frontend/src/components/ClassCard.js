import React from "react";
import { useNavigate } from "react-router-dom";

export default function ClassCard({ title, name }) {
  const navigate = useNavigate();

  const handleEnter = () => {
    // 예: Class1 → class1로 경로 처리
    const classId = name.toLowerCase();
    navigate(`/class/${classId}`);
  };

  return (
    <div className="border rounded-xl p-4 w-64 shadow bg-white">
      <h3 className="text-sm font-semibold text-gray-600 mb-2">{title}</h3>
      <p className="text-xl font-bold text-gray-800 mb-4">{name}</p>
      <div className="flex justify-between items-center">
        <button
          onClick={handleEnter}
          className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
        >
          입장
        </button>
        <span className="text-gray-500 text-sm">정원</span>
      </div>
    </div>
  );
}
