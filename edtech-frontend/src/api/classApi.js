// src/api/classApi.js

import axiosInstance from './axiosInstance';

// 클래스 등록
export const createClass = async (classData) => {
  const response = await axiosInstance.post('/api/classes', classData);
  return response.data;
};

// 클래스 전체 목록 조회
export const getAllClasses = async () => {
  const response = await axiosInstance.get('/api/classes');
  return response.data;
};