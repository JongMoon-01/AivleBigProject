// src/api/axiosInstance.js
// FE BE 통합으로 생성파일

import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
});

// ✅ 모든 요청에 JWT 토큰을 자동으로 포함
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // "Bearer ..." 형식으로 저장되어야 함
    if (token) {
      config.headers.Authorization = token;
      console.log('🔐 Authorization Header:', token); // 👈 디버깅 위해 추가코드
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;
