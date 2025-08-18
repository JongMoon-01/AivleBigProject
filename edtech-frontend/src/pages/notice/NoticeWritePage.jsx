// notice/NoticeWritePage.jsx
import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

export default function NoticeWritePage() {
  const { classId } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [file, setFile] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    if (file) formData.append("file", file);

    await axios.post(`/api/class/${classId}/notice`, formData);
    navigate(`/class/${classId}/notice`);
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">글 작성</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="제목을 입력하세요"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
        <textarea
          placeholder="내용을 입력하세요"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full p-2 border rounded h-40"
          required
        />
        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
          className="block"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          등록하기
        </button>
      </form>
    </div>
  );
}