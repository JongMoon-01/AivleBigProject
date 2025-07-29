// src/api/scheduleApi.js

import axiosInstance from './axiosInstance';

// 일정 등록
export const createSchedule = async (scheduleData) => {
  const response = await axiosInstance.post('/api/schedules', scheduleData);
  return response.data;
};

// 일정 전체 목록 조회
export const getAllSchedules = async () => {
  const response = await axiosInstance.get('/api/schedules');
  return response.data;
};