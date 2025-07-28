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

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-grow">
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              
              {/* Protected Routes */}
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
              
              {/* Admin Only Route */}
              <Route path="/admin" element={
                <PrivateRoute adminOnly={true}>
                  <AdminDashboard />
                </PrivateRoute>
              } />
              
              {/* Default redirect */}
              {/* <Route path="*" element={<Navigate to="/login" />} /> */}
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </Router>
  );
}
