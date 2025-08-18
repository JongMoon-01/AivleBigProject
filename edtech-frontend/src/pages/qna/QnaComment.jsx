import React, { useEffect, useState } from "react";
import axios from "axios";

export default function QnaComment({ classId, postId }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");

  const fetchComments = () => {
    axios
      .get(`/api/class/${classId}/qna/${postId}/comment`)
      .then((res) => setComments(res.data));
  };

  useEffect(() => {
    axios.get(`/api/class/${classId}/qna/${postId}/comment`)
      .then(res => {
        console.log('✅ 댓글 응답:', res.data);
        setComments(res.data);
      })
      .catch(err => console.error(err));
  }, [postId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await axios.post(`/api/class/${classId}/qna/${postId}/comment`, {
      content: newComment,
      author: "답변자",
    });
    setNewComment("");
    fetchComments();
  };

  return (
    <div>
      <h3 className="text-lg font-semibold mb-2">댓글</h3>
      <form onSubmit={handleSubmit} className="mb-4 space-x-2">
        <input
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="p-2 border rounded w-3/4"
          placeholder="댓글 작성..."
        />
        <button className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
          작성
        </button>
      </form>
      <ul className="space-y-2">
        {comments.map((c) => (
          <li key={c.id} className="p-2 border rounded">
            <p className="text-sm">{c.content}</p>
            <p className="text-xs text-gray-500">
              {c.author} · {new Date(c.createdAt).toLocaleString()}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
