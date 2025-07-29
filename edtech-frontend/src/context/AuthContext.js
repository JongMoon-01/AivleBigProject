import React, { createContext, useState, useContext, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';

/**
 * 인증 컨텍스트 생성
 * 전역적으로 사용자 인증 상태를 관리합니다.
 */
const AuthContext = createContext({});

/**
 * 인증 컨텍스트를 사용하기 위한 커스텀 훅
 */
export const useAuth = () => useContext(AuthContext);

/**
 * 인증 컨텍스트 프로바이더 컴포넌트
 * 
 * 로그인, 로그아웃, 회원가입, 가장(임퍼서네이트) 기능을 제공합니다.
 * 로컬 스토리지에 토큰과 사용자 정보를 저장하여 세션 지속성을 구현합니다.
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /**
   * 컴포넌트 마운트 시 로컬 스토리지에서 사용자 정보 복원
   * 페이지 새로고침 시에도 로그인 상태가 유지됩니다.
   */
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

  /**
   * 로그인 함수
   * 
   * 서버에 로그인 요청을 보내고 JWT 토큰을 받아 저장합니다.
   * 
   * @param {string} email - 사용자 이메일
   * @param {string} password - 사용자 비밀번호
   * @returns {Promise<{success: boolean, message?: string}>} 로그인 결과
   */
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

  /**
   * 회원가입 함수
   * 
   * 새로운 사용자를 등록하고 자동으로 로그인합니다.
   * 
   * @param {string} email - 사용자 이메일
   * @param {string} password - 사용자 비밀번호
   * @param {string} name - 사용자 이름
   * @returns {Promise<{success: boolean, message?: string}>} 회원가입 결과
   */
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

  /**
   * 로그아웃 함수
   * 
   * 로컬 스토리지에서 모든 인증 정보를 삭제합니다.
   * 가장 중인 경우 원본 관리자 정보도 함께 삭제합니다.
   */
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    localStorage.removeItem('originalAdmin');
    localStorage.removeItem('originalToken');
    setUser(null);
  };

  /**
   * 학생 계정 가장(임퍼서네이트) 함수
   * 
   * 관리자가 학생 계정으로 로그인할 수 있도록 합니다.
   * 원본 관리자 정보는 백업하여 나중에 복귀할 수 있도록 합니다.
   * 
   * @param {number} studentId - 가장할 학생의 ID
   * @returns {Promise<{success: boolean, message?: string}>} 가장 결과
   */
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

  /**
   * 가장 종료 함수
   * 
   * 학생 계정 가장을 종료하고 원본 관리자 계정으로 복귀합니다.
   * 백업한 관리자 정보와 토큰을 복원합니다.
   */
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

  /**
   * 가장 중인지 확인하는 함수
   * 
   * 현재 관리자가 학생 계정을 가장 중인지 확인합니다.
   * 
   * @returns {boolean} 가장 중이면 true, 아니면 false
   */
  const isImpersonating = () => {
    return localStorage.getItem('originalAdmin') !== null;
  };

  /**
   * 컨텍스트에 제공할 값 객체
   * 모든 인증 관련 함수와 상태를 포함합니다.
   */
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