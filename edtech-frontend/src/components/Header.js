import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * 헤더 컴포넌트
 * 
 * 애플리케이션의 상단 네비게이션 바를 표시합니다.
 * 사용자의 로그인 상태와 역할에 따라 다른 메뉴를 표시하고,
 * 가장 중인 경우 "관리자 모드로 돌아가기" 버튼을 표시합니다.
 */
export default function Header() {
  const { user, logout, isImpersonating, exitImpersonation } = useAuth();
  const navigate = useNavigate();

  /**
   * 로그아웃 핸들러
   * 
   * 사용자를 로그아웃하고 로그인 페이지로 리다이렉트합니다.
   */
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  /**
   * 가장 종료 핸들러
   * 
   * 학생 계정 가장을 종료하고 관리자 대시보드로 돌아갑니다.
   */
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
            {/* 역할별 네비게이션 메뉴 */}
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
            {/* 가장 종료 버튼 - 가장 중일 때만 표시 */}
            {isImpersonating() && (
              <button 
                onClick={handleExitImpersonation}
                className="bg-yellow-500 px-3 py-1 rounded hover:bg-yellow-600"
              >
                관리자 모드로 돌아가기
              </button>
            )}
            {/* 사용자 정보 표시 */}
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
            {/* 비로그인 상태 메뉴 */}
            <Link to="/login" className="hover:underline">로그인</Link>
            <Link to="/register" className="hover:underline">회원가입</Link>
          </>
        )}
      </nav>
    </header>
  );
}
