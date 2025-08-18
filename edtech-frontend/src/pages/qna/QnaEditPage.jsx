// qna/QnaEditPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

export default function QnaEditPage() {
  const { classId, postId } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [file, setFile] = useState(null);

  useEffect(() => {
    axios.get(`/api/class/${classId}/qna/${postId}`).then((res) => {
      setTitle(res.data.title);
      setContent(res.data.content);
    });
  }, [postId]);

    const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    if (file) formData.append("file", file);

    await axios.put(`/api/class/${classId}/qna/${postId}`, formData, {
        headers: {
        'Content-Type': 'multipart/form-data',
        },
    });

    navigate(`/class/${classId}/qna/${postId}`);
    };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">글 수정</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-2 border rounded"
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full p-2 border rounded h-40"
        />
        <input type="file" onChange={(e) => setFile(e.target.files[0])} />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          수정 완료
        </button>
      </form>
    </div>
  );
}
