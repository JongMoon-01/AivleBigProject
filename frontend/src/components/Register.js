import React, { useState } from 'react';
import { fetchPublicKey, encryptPassword } from '../utils/rsaEncrypt';

function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
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
        email: formData.email,
        encryptedPassword: encryptedPassword,
        password: null
      };

      const response = await fetch('http://localhost:8080/api/auth/register', {
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
        setFormData({ username: '', email: '', password: '' });
        localStorage.setItem('token', data.token);
        localStorage.setItem('username', data.username);
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
        <label>이메일:</label>
        <input
          type="email"
          name="email"
          value={formData.email}
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
      
      <button type="submit">회원가입</button>
      
      {message && (
        <div className={`message ${messageType}`}>
          {message}
        </div>
      )}
    </form>
  );
}

export default Register;