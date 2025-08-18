import React from "react";
import axios from "axios";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ExcelViewerPage from "./pages/ExcelViewerPage";
import HomePage from "./pages/HomePage";
import ClassRegisterPage from './pages/ClassRegisterPage';
import ClassDetailPage from "./pages/ClassDetailPage";
import CourseListPage from "./pages/CourseListPage";
import CourseDetailPage from "./pages/CourseDetailPage";
import LectureSummaryPage from "./pages/LectureSummaryPage";
import NoticePage from "./pages/notice/NoticePage";
import NoticeWritePage from "./pages/notice/NoticeWritePage";
import NoticeDetailPage from "./pages/notice/NoticeDetailPage";
import NoticeEditPage from "./pages/notice/NoticeEditPage";
import QnaListPage from "./pages/qna/QnaListPage";
import QnaComment from "./pages/qna/QnaComment";
import QnaWritePage from "./pages/qna/QnaWritePage";
import QnaDetailPage from "./pages/qna/QnaDetailPage";
import QnaEditPage from "./pages/qna/QnaEditPage";

export default function App() {
  axios.defaults.baseURL = "https://8080-jongmoon01-aivlebigproj-bm0u19yd4cv.ws-us120.gitpod.io";
  axios.defaults.withCredentials = true;

  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/excel" element={<ExcelViewerPage />} />
            <Route path="/" element={<HomePage />} />
            <Route path="/classregister" element={<ClassRegisterPage />} />
            <Route path="/class/:classId" element={<ClassDetailPage />} />
            <Route path="/class/:classId/courses" element={<CourseListPage />} />
            <Route path="/class/:classId/courses/:courseId/schedule" element={<CourseDetailPage />} />
            <Route path="/class/courses/:courseId/summary" element={<LectureSummaryPage />} />
            <Route path="/class/:classId/notice" element={<NoticePage />} />
            <Route path="/class/:classId/notice/write" element={<NoticeWritePage />} />
            <Route path="/class/:classId/notice/:postId/edit" element={<NoticeEditPage />} />
            <Route path="/class/:classId/notice/:postId" element={<NoticeDetailPage />} />
            <Route path="/class/:classId/qna" element={<QnaListPage />} />
            <Route path="/class/:classId/qna/new" element={<QnaWritePage />} />
            <Route path="/class/:classId/qna/:postId" element={<QnaDetailPage />} />
            <Route path="/class/:classId/qna/:postId/edit" element={<QnaEditPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}
