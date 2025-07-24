import React, { useState } from 'react';
import { fetchPublicKey, encryptPassword } from '../utils/rsaEncrypt';

function Login() {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const publicKey = await fetchPublicKey();
      const encryptedPassword = encryptPassword(formData.password, publicKey);
      
      const requestData = {
        username: formData.username,
        encryptedPassword: encryptedPassword,
        password: null
      };

      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
        setMessageType('success');
        setFormData({ username: '', password: '' });
        localStorage.setItem('token', data.token);
        localStorage.setItem('username', data.username);
        localStorage.setItem('isAdmin', data.admin);
        
        // 권한에 따른 리다이렉트
        if (data.admin) {
          window.location.href = '/admin';
        } else {
          window.location.href = '/dashboard';
        }
      } else {
        setMessage(data.message);
        setMessageType('error');
      }
    } catch (error) {
      setMessage('서버 연결 오류가 발생했습니다.');
      setMessageType('error');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label>사용자명:</label>
        <input
          type="text"
          name="username"
          value={formData.username}
          onChange={handleChange}
          required
        />
      </div>
      
      <div className="form-group">
        <label>비밀번호:</label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
        />
      </div>
      
      <button type="submit">로그인</button>
      
      {message && (
        <div className={`message ${messageType}`}>
          {message}
        </div>
      )}
    </form>
  );
}

export default Login;