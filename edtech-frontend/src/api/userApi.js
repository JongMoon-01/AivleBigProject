// src/api/userApi.js
import axiosInstance from './axiosInstance';

// 회원가입 요청
export const registerUser = async (userData) => {
  const response = await axiosInstance.post('/api/users/register', userData);
  return response.data;
};

// 로그인 요청
export const loginUser = async (credentials) => {
  const response = await axiosInstance.post('/api/users/login', credentials);
  return response.data;
};