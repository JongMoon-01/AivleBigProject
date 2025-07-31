import React from "react";
import { useNavigate } from "react-router-dom";

export default function ClassCard({ classId, title }) {
  const navigate = useNavigate();

  const handleEnter = () => {
    navigate(`/class/${classId}`);
  };

  return (
    <div className="border rounded-xl p-4 w-64 shadow bg-white">
      <h3 className="text-sm font-semibold text-gray-600 mb-2">{title}</h3>
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
