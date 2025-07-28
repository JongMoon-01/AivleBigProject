import React, { createContext, useState, useContext, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const userData = localStorage.getItem('userData');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axiosInstance.post('/api/auth/login', {
        email,
        password
      });
      
      const { token, type, userId, email: userEmail, name, role } = response.data;
      
      // 토큰 저장 (Bearer 포함)
      localStorage.setItem('token', `${type} ${token}`);
      
      // 사용자 정보 저장
      const userData = { userId, email: userEmail, name, role };
      localStorage.setItem('userData', JSON.stringify(userData));
      setUser(userData);
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || '로그인에 실패했습니다.' 
      };
    }
  };

  const register = async (email, password, name) => {
    try {
      const response = await axiosInstance.post('/api/auth/register', {
        email,
        password,
        name
      });
      
      const { token, type, userId, email: userEmail, role } = response.data;
      
      // 토큰 저장 (Bearer 포함)
      localStorage.setItem('token', `${type} ${token}`);
      
      // 사용자 정보 저장
      const userData = { userId, email: userEmail, name, role };
      localStorage.setItem('userData', JSON.stringify(userData));
      setUser(userData);
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || '회원가입에 실패했습니다.' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    localStorage.removeItem('originalAdmin');
    localStorage.removeItem('originalToken');
    setUser(null);
  };

  const impersonate = async (studentId) => {
    try {
      const response = await axiosInstance.post('/api/auth/impersonate', {
        studentId
      });
      
      const { token, type, userId, email, name, role } = response.data;
      
      // 원래 관리자 정보 백업
      const originalAdmin = localStorage.getItem('userData');
      const originalToken = localStorage.getItem('token');
      
      localStorage.setItem('originalAdmin', originalAdmin);
      localStorage.setItem('originalToken', originalToken);
      
      // 새로운 학생 토큰과 정보로 교체
      localStorage.setItem('token', `${type} ${token}`);
      const userData = { userId, email, name, role };
      localStorage.setItem('userData', JSON.stringify(userData));
      setUser(userData);
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || '위임에 실패했습니다.' 
      };
    }
  };

  const exitImpersonation = () => {
    const originalAdmin = localStorage.getItem('originalAdmin');
    const originalToken = localStorage.getItem('originalToken');
    
    if (originalAdmin && originalToken) {
      localStorage.setItem('userData', originalAdmin);
      localStorage.setItem('token', originalToken);
      localStorage.removeItem('originalAdmin');
      localStorage.removeItem('originalToken');
      setUser(JSON.parse(originalAdmin));
    }
  };

  const isImpersonating = () => {
    return localStorage.getItem('originalAdmin') !== null;
  };

  const value = {
    user,
    login,
    register,
    logout,
    impersonate,
    exitImpersonation,
    isImpersonating,
    loading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};