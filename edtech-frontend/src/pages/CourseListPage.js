// pages/CourseListPage.js
import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import CourseTable from "../components/CourseTable";
import axios from "axios";
import { useParams } from "react-router-dom";

export default function CourseListPage() {
  const { classId } = useParams();
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    if (classId) {
      axios
        .get(`/api/course?classId=${classId}`)
        .then((res) => {
          setCourses(res.data);
        })
        .catch((err) => {
          console.error("코스 불러오기 실패:", err);
        });
    }
  }, [classId]);

  return (
    <div className="flex flex-col min-h-screen bg-blue-50">
      <div className="flex flex-grow">
        <Sidebar />

        <main className="flex-1 p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">내 강의 목록</h2>
          <CourseTable courses={courses} />
        </main>
      </div>
    </div>
  );
}