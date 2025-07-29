import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function ClassRegisterPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [tag, setTag] = useState("");
  const [headcount, setHeadcount] = useState("");

  const handleSave = async () => {
    if (!title || !headcount) {
      alert("클래스 제목과 최대 인원을 모두 입력해주세요.");
      return;
    }

    const newClass = { title, tag, headcount };

    try {
      await axios.post("https://8080-jongmoon01-aivlebigproj-bm0u19yd4cv.ws-us120.gitpod.io/api/class", newClass); // 백엔드 URL
      alert("클래스가 등록되었습니다!");
      navigate("/");
    } catch (error) {
      console.error("클래스 등록 실패:", error);
      alert("클래스 등록에 실패했습니다.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-semibold mb-4">클래스 등록</h2>
        <input
          type="text"
          placeholder="클래스 제목"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full mb-4 px-4 py-2 border rounded"
        />
        <input
          type="text"
          placeholder="태그"
          value={tag}
          onChange={(e) => setTag(e.target.value)}
          className="w-full mb-6 px-4 py-2 border rounded"
        />
        <input
          type="number"
          placeholder="최대 수강 인원"
          value={headcount}
          onChange={(e) => setHeadcount(e.target.value)}
          className="w-full mb-6 px-4 py-2 border rounded"
        />
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            저장
          </button>
        </div>
      </div>
    </div>
  );
}