import React from "react";
import { Link } from "react-router-dom";

export default function Header() {
  return (
    <header className="bg-blue-600 text-white px-6 py-3 flex justify-between items-center">
      <h1 className="text-lg font-bold">My Dashboard</h1>
      <nav className="space-x-4">
        <Link to="/" className="hover:underline">홈</Link>
        <Link to="/login" className="hover:underline">로그인</Link>
        <Link to="/register" className="hover:underline">회원가입</Link>
        <Link to="/excel" className="hover:underline">게시판</Link>
      </nav>
    </header>
  );
}
