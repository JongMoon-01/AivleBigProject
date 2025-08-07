// src/components/Sidebar.js (추가/수정 부분)
import { Link, useLocation, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api/axios";
import { getAuth } from "../utils/auth";
import homeIcon from "../assets/icons/icons8-home-100.png";
import courseIcon from "../assets/icons/icons8-course-100.png";
import attitudeIcon from "../assets/icons/icons8-report-100.png";

export default function Sidebar() {
  const location = useLocation();
  const { classId } = useParams();
  const [courses, setCourses] = useState([]);
  const isAdmin = getAuth()?.role === "ADMIN";

  useEffect(() => {
    if (!classId) return;
    api.get(`/classes/${classId}/courses`)
      .then(res => setCourses(res.data))
      .catch(() => setCourses([]));
  }, [classId]);

  const isCourseDetailPage =
    location.pathname.includes(`/class/${classId}/courses/`) &&
    /(schedule|content|summary|resources)/.test(location.pathname);

  if (isCourseDetailPage) {
    return (
      <aside className="w-16 bg-white border-r shadow p-4 flex flex-col items-center gap-6">
        <Link to={`/class/${classId}`}><img src={homeIcon} alt="Home" className="w-6 h-6" /></Link>
        <Link to={`/class/${classId}/courses`}><img src={courseIcon} alt="Courses" className="w-6 h-6" /></Link>
        <Link to={`/class/${classId}/attitude`}><img src={attitudeIcon} alt="Attitude" className="w-6 h-6" /></Link>
      </aside>
    );
  }

  return (
    <aside className="w-64 bg-white border-r shadow p-4">
      <Link to={`/class/${classId}`} className="text-lg font-bold mb-4 block text-gray-800 hover:underline">
        HOME
      </Link>

      <div className="mb-6">
        <div className="flex items-center justify-between">
          <Link
            to={`/class/${classId}/courses`}
            className="font-semibold text-sm mb-2 block text-gray-700 hover:underline"
          >
            Courses
          </Link>
        </div>

        <ul className="space-y-1 text-sm text-blue-700 ml-2">
          {/* 서버에서 가져온 과목 목록을 간단히 노출 */}
          {courses.map(c => (
            <li key={c.courseId}>
              <Link
                to={`/class/${classId}/courses/${c.courseId}/schedule`}
                className="hover:underline block"
              >
                {c.title}
              </Link>
            </li>
          ))}
          {courses.length === 0 && <li className="text-gray-400">없음</li>}
        </ul>
      </div>

      {/* ✅ 관리자만 수강생 조회 메뉴 노출 */}
      {isAdmin && (
      <Link to={`/class/${classId}/students`} className="text-sm text-indigo-600 hover:underline font-medium">
        수강생 조회
        </Link>
      )}

      <Link
        to={`/class/${classId}/attitude`}
        className="text-sm text-indigo-600 hover:underline font-medium"
      >
        내 수업태도 살펴보기 →
      </Link>
    </aside>
  );
}
