import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function AdminDashboard() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');

  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    const isAdmin = localStorage.getItem('isAdmin');
    const token = localStorage.getItem('token');

    if (!token || isAdmin !== 'true') {
      navigate('/');
      return;
    }

    setUsername(storedUsername);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('isAdmin');
    navigate('/');
  };

  return (
    <div className="dashboard admin-dashboard">
      <h1>관리자 대시보드</h1>
      <p>안녕하세요, {username}님! 관리자 페이지에 오신 것을 환영합니다.</p>
      
      <div className="admin-features">
        <h2>관리자 기능</h2>
        <ul>
          <li>사용자 관리</li>
          <li>시스템 설정</li>
          <li>로그 확인</li>
          <li>통계 보기</li>
        </ul>
      </div>

      <button onClick={handleLogout} className="logout-button">
        로그아웃
      </button>
    </div>
  );
}

export default AdminDashboard;