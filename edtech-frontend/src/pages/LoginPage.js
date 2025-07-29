import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * 로그인 페이지 컴포넌트
 * 
 * 사용자 인증을 위한 로그인 폼을 제공합니다.
 * 로그인 성공 시 역할에 따라 다른 페이지로 리다이렉트합니다.
 * - 관리자: /admin 페이지로 이동
 * - 학생: / (home) 페이지로 이동
 */
export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  /**
   * 로그인 폼 제출 핸들러
   * 
   * 1. 폼 제출 기본 동작 방지
   * 2. 로그인 API 호출
   * 3. 성공 시 역할에 따라 리다이렉트
   * 4. 실패 시 에러 메시지 표시
   * 
   * @param {Event} e - 폼 제출 이벤트
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await login(email, password);
    
    if (result.success) {
      const userData = JSON.parse(localStorage.getItem('userData'));
      if (userData.role === 'admin') {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } else {
      setError(result.message);
    }
    
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-[89vh] bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
          로그인
        </h2>

        <form onSubmit={handleSubmit}>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            E-Mail
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email@example.com"
            className="w-full mb-4 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none"
            required
          />

          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="password"
            className="w-full mb-2 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none"
            required
          />

          {error && (
            <div className="text-red-500 text-sm mb-4 text-center">
              {error}
            </div>
          )}

          <div className="flex justify-end text-sm mb-6">
            <Link
              to="/register"
              className="text-indigo-600 hover:underline transition"
            >
              회원가입
            </Link>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-lg transition disabled:opacity-50"
          >
            {loading ? "로그인 중..." : "로그인"}
          </button>
        </form>

        {/* 테스트 계정 정보 안내 */}
        <div className="mt-6 border-t pt-4 text-sm text-center text-gray-500">
          <p className="mb-1">관리자 테스트 계정</p>
          <p>이메일: jihyeon@admin.com / 비밀번호: 4308</p>
          <p className="mt-2">학생 계정은 회원가입으로 생성하세요</p>
        </div>
      </div>
    </div>
  );
}
