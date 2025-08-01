import React from "react";
import Sidebar from "../components/Sidebar";
import CourseTable from "../components/CourseTable";

export default function CourseListPage() {
  return (
    <div className="flex flex-col min-h-screen bg-blue-50">
      <div className="flex flex-grow">
        <Sidebar />

        <main className="flex-1 p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">내 강의 목록</h2>
          <CourseTable />
        </main>
      </div>
    </div>
  );
}
