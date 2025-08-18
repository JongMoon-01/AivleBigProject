// components/BoardPreview.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

export default function BoardPreview({ title, to }) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(to)}
      className="bg-white p-6 rounded-lg shadow hover:bg-blue-100 cursor-pointer transition"
    >
      <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
      <p className="text-sm text-gray-500 mt-2">최근 게시글 미리보기 가능 (옵션)</p>
    </div>
  );
}