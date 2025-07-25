import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    passwordConfirm: "",
    name: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // 비밀번호 확인
    if (formData.password !== formData.passwordConfirm) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }

    if (formData.password.length < 4) {
      setError("비밀번호는 최소 4자리 이상이어야 합니다.");
      return;
    }

    setLoading(true);

    const result = await register(formData.email, formData.password, formData.name);
    
    if (result.success) {
      navigate("/");
    } else {
      setError(result.message);
    }
    
    setLoading(false);
  };

  return (
    <div className="flex-grow flex items-center justify-center w-full min-h-[calc(93vh-3rem)] py-12 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <h2 className="text-2xl font-bold mb-4">회원가입</h2>

        <form onSubmit={handleSubmit}>
          <label className="block mb-2">이메일</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email@example.com"
            className="w-full p-2 mb-4 border rounded"
            required
          />

          <label className="block mb-2">이름</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="이름"
            className="w-full p-2 mb-4 border rounded"
            required
          />

          <label className="block mb-2">비밀번호</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="비밀번호 (최소 4자리)"
            className="w-full p-2 mb-4 border rounded"
            required
          />

          <label className="block mb-2">비밀번호 확인</label>
          <input
            type="password"
            name="passwordConfirm"
            value={formData.passwordConfirm}
            onChange={handleChange}
            placeholder="비밀번호 확인"
            className="w-full p-2 mb-4 border rounded"
            required
          />

          {error && (
            <div className="text-red-500 text-sm mb-4 text-center">
              {error}
            </div>
          )}

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded disabled:opacity-50"
          >
            {loading ? "회원가입 중..." : "회원가입"}
          </button>
        </form>

        <div className="mt-4 text-center text-sm">
          <span className="text-gray-600">이미 계정이 있으신가요? </span>
          <Link to="/login" className="text-blue-600 hover:underline">
            로그인
          </Link>
        </div>
      </div>
    </div>
  );
}
