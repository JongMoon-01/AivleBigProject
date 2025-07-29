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
            <Route path="/class/:id" element={<ClassDetailPage />} />
            <Route path="/class/courses" element={<CourseListPage />} />
            <Route path="/class/courses/course1/schedule" element={<CourseDetailPage />}/>
            <Route path="/class/courses/:courseId/summary" element={<LectureSummaryPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}
