import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Header() {
  const { user, logout, isImpersonating, exitImpersonation } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleExitImpersonation = () => {
    exitImpersonation();
    navigate("/admin");
  };

  return (
    <header className="bg-blue-600 text-white px-6 py-3 flex justify-between items-center">
      <h1 className="text-lg font-bold">
        {user && user.role === 'admin' && !isImpersonating() ? 'Admin Dashboard' : 'My Dashboard'}
      </h1>
      <nav className="space-x-4">
        {user ? (
          <>
            {user.role === 'admin' && !isImpersonating() ? (
              <>
                <Link to="/admin" className="hover:underline">관리자 홈</Link>
              </>
            ) : (
              <>
                <Link to="/" className="hover:underline">홈</Link>
                <Link to="/excel" className="hover:underline">게시판</Link>
              </>
            )}
            {isImpersonating() && (
              <button 
                onClick={handleExitImpersonation}
                className="bg-yellow-500 px-3 py-1 rounded hover:bg-yellow-600"
              >
                관리자 모드로 돌아가기
              </button>
            )}
            <span className="text-sm">
              {user.name} ({user.role === 'admin' ? '관리자' : '학생'})
            </span>
            <button 
              onClick={handleLogout}
              className="hover:underline"
            >
              로그아웃
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="hover:underline">로그인</Link>
            <Link to="/register" className="hover:underline">회원가입</Link>
          </>
        )}
      </nav>
    </header>
  );
}
