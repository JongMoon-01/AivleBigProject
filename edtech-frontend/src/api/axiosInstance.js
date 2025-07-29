/**
 * Axios 인스턴스 설정 파일
 * 
 * 프론트엔드에서 백엔드 API 호출을 위한 공통 Axios 인스턴스를 설정합니다.
 * JWT 토큰 자동 추가, 기본 URL 설정 등의 공통 기능을 제공합니다.
 */

import axios from 'axios';

/**
 * 공통 Axios 인스턴스 생성
 * - baseURL: 백엔드 서버 주소 (localhost:8080)
 * - Content-Type: JSON 형식으로 고정
 */
const axiosInstance = axios.create({
  baseURL: 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request Interceptor
 * 
 * 모든 HTTP 요청에 JWT 토큰을 자동으로 추가합니다.
 * 로컬 스토리지에서 토큰을 가져와서 Authorization 헤더에 설정합니다.
 * 토큰은 "Bearer {token}" 형식으로 저장되어 있어야 합니다.
 */
axiosInstance.interceptors.request.use(
  (config) => {
    // 로컬 스토리지에서 JWT 토큰 가져오기
    const token = localStorage.getItem('token');
    if (token) {
      // Authorization 헤더에 토큰 추가
      config.headers.Authorization = token;
      console.log('🔐 Authorization Header:', token); // 디버깅용 로그
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;
