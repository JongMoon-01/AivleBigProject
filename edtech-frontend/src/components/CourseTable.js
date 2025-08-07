// src/components/CourseTable.js  (또는 pages/CourseListPage 내에 포함)
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

export default function CourseTable() {
  const { classId } = useParams();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [selectedCourseType, setSelectedCourseType] = useState('');
  
  useEffect(() => {
    axios.get(`http://localhost:8080/api/classes/${classId}/courses`)
      .then(res => setCourses(res.data))
      .catch(err => console.error("코스 불러오기 실패", err));
  }, [classId]);

  const goDetail = (courseId) => {
    // 예: 기본 탭을 schedule로
    navigate(`/class/${classId}/courses/${courseId}/schedule`);
  };
  const handleQuizClick = (quizType) => {
    setSelectedCourseType(quizType);
    setShowQuizModal(true);
  };

  return (
    <div className="bg-white rounded-xl shadow p-4 overflow-x-auto">
      <table className="w-full text-sm text-left table-auto">
        <thead className="bg-gray-100 text-gray-700">
          <tr>
            <th className="px-4 py-2">강의명</th>
            <th className="px-4 py-2">강사</th>
            <th className="px-4 py-2">태그</th>
            <th className="px-4 py-2 text-right">바로가기</th>
          </tr>
        </thead>
        <tbody>
          {courses.map((c) => {
            const tags = (c.tag || "").split(",").map(s => s.trim()).filter(Boolean);
            return (
              <tr key={c.courseId} className="border-t">
                <td className="px-4 py-3 font-semibold">{c.title}</td>
                <td className="px-4 py-3">{c.instructor}</td>
                <td className="px-4 py-3 space-x-2">
                  {tags.map((tag, i) => (
                    <span
                      key={i}
                      className="inline-block bg-indigo-100 text-indigo-700 text-xs px-2 py-1 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => goDetail(c.courseId)}
                    className="bg-indigo-600 text-white text-xs px-3 py-1 rounded hover:bg-indigo-700"
                  >
                    강의 바로가기 →
                  </button>
                  {course.quizType && (
                    <button 
                      onClick={() => handleQuizClick(course.quizType)}
                      className="bg-green-600 text-white text-xs px-3 py-1 rounded hover:bg-green-700"
                    >
                      퀴즈 풀어보자 →
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
          {courses.length === 0 && (
            <tr><td className="px-4 py-6 text-center text-gray-400" colSpan={4}>등록된 코스가 없습니다.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
