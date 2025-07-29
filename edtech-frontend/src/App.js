import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Header from "./components/Header";
import Footer from "./components/Footer";
import PrivateRoute from "./components/PrivateRoute";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ExcelViewerPage from "./pages/ExcelViewerPage";
import HomePage from "./pages/HomePage";
import ClassDetailPage from "./pages/ClassDetailPage";
import CourseListPage from "./pages/CourseListPage";
import CourseDetailPage from "./pages/CourseDetailPage";
import LectureSummaryPage from "./pages/LectureSummaryPage";
import AdminDashboard from "./pages/AdminDashboard";

/**
 * 애플리케이션의 최상위 컴포넌트
 * 
 * React Router를 사용하여 라우팅을 구성하고,
 * AuthProvider로 전체 앱에 인증 컨텍스트를 제공합니다.
 * 헤더와 푸터를 포함한 기본 레이아웃을 정의합니다.
 */
export default function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-grow">
            <Routes>
              {/* 공개 라우트 - 인증 없이 접근 가능 */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              
              {/* 보호된 라우트 - 로그인 필수 */}
              <Route path="/" element={
                <PrivateRoute>
                  <HomePage />
                </PrivateRoute>
              } />
              <Route path="/excel" element={
                <PrivateRoute>
                  <ExcelViewerPage />
                </PrivateRoute>
              } />
              <Route path="/class/:id" element={
                <PrivateRoute>
                  <ClassDetailPage />
                </PrivateRoute>
              } />
              <Route path="/class/courses" element={
                <PrivateRoute>
                  <CourseListPage />
                </PrivateRoute>
              } />
              <Route path="/class/courses/course1/schedule" element={
                <PrivateRoute>
                  <CourseDetailPage />
                </PrivateRoute>
              } />
              <Route path="/class/courses/:courseId/summary" element={
                <PrivateRoute>
                  <LectureSummaryPage />
                </PrivateRoute>
              } />
              
              {/* 관리자 전용 라우트 - admin 역할 필수 */}
              <Route path="/admin" element={
                <PrivateRoute adminOnly={true}>
                  <AdminDashboard />
                </PrivateRoute>
              } />
              
              {/* 기본 리다이렉트 - 잘못된 경로로 접근 시 로그인 페이지로 이동 */}
              <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </Router>
  );
}
