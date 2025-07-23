import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function UserDashboard() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');

  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    const token = localStorage.getItem('token');

    if (!token) {
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
    <div className="dashboard user-dashboard">
      <h1>사용자 대시보드</h1>
      <p>안녕하세요, {username}님!</p>
      
      <div className="user-features">
        <h2>사용자 메뉴</h2>
        <ul>
          <li>프로필 보기</li>
          <li>설정 변경</li>
          <li>활동 내역</li>
        </ul>
      </div>

      <button onClick={handleLogout} className="logout-button">
        로그아웃
      </button>
    </div>
  );
}

export default UserDashboard;