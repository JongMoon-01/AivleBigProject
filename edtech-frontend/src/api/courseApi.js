// src/api/courseApi.js

import axiosInstance from './axiosInstance';

// 코스 등록
export const createCourse = async (courseData) => {
  const response = await axiosInstance.post('/api/courses', courseData);
  return response.data;
};

// 코스 전체 목록 조회
export const getAllCourses = async () => {
  const response = await axiosInstance.get('/api/courses');
  return response.data;
};