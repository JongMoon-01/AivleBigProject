import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ExcelViewerPage from "./pages/ExcelViewerPage";
import HomePage from "./pages/HomePage";
import ClassDetailPage from "./pages/ClassDetailPage";
import CourseListPage from "./pages/CourseListPage";
import CourseDetailPage from "./pages/CourseDetailPage";
import LectureSummaryPage from "./pages/LectureSummaryPage";
import DashboardPage from "./pages/DashboardPage";
import CameraAnalysisPage from "./pages/CameraAnalysisPage";
import RealtimeDashboardPage from "./pages/RealtimeDashboardPage";
import MainDashboard from "./pages/MainDashboard";
import NewMainDashboard from "./pages/NewMainDashboard";
import DataFlowDemoPage from "./pages/DataFlowDemoPage";

export default function App() {
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
            <Route path="/main-dashboard" element={<MainDashboard />} />
            <Route path="/new-dashboard" element={<NewMainDashboard />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/realtime" element={<RealtimeDashboardPage />} />
            <Route path="/camera" element={<CameraAnalysisPage />} />
            <Route path="/demo" element={<DataFlowDemoPage />} />
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
