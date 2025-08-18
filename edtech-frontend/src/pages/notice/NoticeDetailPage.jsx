// notice/NoticeDetailPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

export default function NoticeDetailPage() {
  const { classId, postId } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);

  useEffect(() => {
    axios.get(`/api/class/${classId}/notice/${postId}`).then((res) => {
      setPost(res.data);
    });
  }, [postId]);

  const handleDelete = async () => {
    await axios.delete(`/api/class/${classId}/notice/${postId}`);
    navigate(`/class/${classId}/notice`);
  };

  if (!post) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-2">{post.title}</h2>
      <p className="text-sm text-gray-500 mb-4">
        {post.author} · {new Date(post.createdAt).toLocaleString()}
      </p>
      <div className="whitespace-pre-wrap mb-4">{post.content}</div>
      {post.fileUrl && (
        <a
          href={post.fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 underline"
        >
          첨부파일 다운로드
        </a>
      )}
      <div className="mt-6 space-x-2">
        <button
          onClick={() => navigate(`/class/${classId}/notice/${postId}/edit`)}
          className="px-4 py-2 bg-yellow-400 text-white rounded hover:bg-yellow-500"
        >
          수정
        </button>
        <button
          onClick={handleDelete}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          삭제
        </button>
      </div>
    </div>
  );
}