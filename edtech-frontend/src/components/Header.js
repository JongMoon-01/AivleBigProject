import React from "react";
import { Link } from "react-router-dom";

export default function Header() {
  return (
    <header className="bg-blue-600 text-white px-6 py-3 flex justify-between items-center">
      <h1 className="text-lg font-bold">My Dashboard</h1>
      <nav className="space-x-3 text-sm">
        <Link to="/" className="hover:underline">홈</Link>
        <Link to="/new-dashboard" className="hover:underline bg-yellow-200 px-2 py-1 rounded text-yellow-800">✨ 새 대시보드</Link>
        <Link to="/demo" className="hover:underline">📊 데모</Link>
        <Link to="/main-dashboard" className="hover:underline">메인</Link>
        <Link to="/camera" className="hover:underline">카메라</Link>
        <Link to="/realtime" className="hover:underline">실시간</Link>
        <Link to="/dashboard" className="hover:underline">AI분석</Link>
        <Link to="/login" className="hover:underline">로그인</Link>
        <Link to="/excel" className="hover:underline">게시판</Link>
      </nav>
    </header>
  );
}
