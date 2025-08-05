import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// ✅ User
import UserDashboardPage from "./components/User/pages/UserDashboardPage";

// ✅ Admin
import AdminHomePage from "./components/Admin/pages/AdminHomePage";
import AdminKpiPage from "./components/Admin/pages/AdminKpiPage";
import AdminKpiDetailPage from "./components/Admin/pages/AdminKpiDetailPage";

function App() {
  return (
    <Router>
      <Routes>
        {/* ✅ 유저 */}
        <Route path="/" element={<UserDashboardPage />} />
        <Route path="/user/dashboard" element={<UserDashboardPage />} />

        {/* ✅ 관리자 */}
        <Route path="/admin" element={<AdminHomePage />} />
        <Route path="/admin/kpi/:courseId" element={<AdminKpiPage />} />
        <Route path="/admin/kpi/:courseId/:metric" element={<AdminKpiDetailPage />} />
      </Routes>
    </Router>
  );
}

export default App;
