import { Link, useLocation, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

import homeIcon from "../assets/icons/icons8-home-100.png";
import courseIcon from "../assets/icons/icons8-course-100.png";
import attitudeIcon from "../assets/icons/icons8-report-100.png";

export default function Sidebar() {
  const location = useLocation();
  const { classId } = useParams();
  const [courses, setCourses] = useState([]);

  const isCourseDetailPage = location.pathname.startsWith(`/class/${classId}/courses/course`);

  useEffect(() => {
    if (!classId) return;

    axios
      .get(`/api/course?classId=${classId}`)
      .then((res) => setCourses(res.data))
      .catch((err) => console.error("코스 불러오기 실패", err));
  }, [classId]);

  if (isCourseDetailPage) {
    return (
      <aside className="w-16 bg-white border-r shadow p-4 flex flex-col items-center gap-6">
        <Link to={`/class/${classId}`}>
          <img src={homeIcon} alt="Home" className="w-6 h-6" />
        </Link>
        <Link to={`/class/${classId}/courses`}>
          <img src={courseIcon} alt="Courses" className="w-6 h-6" />
        </Link>
        <Link to={`/class/${classId}/attitude`}>
          <img src={attitudeIcon} alt="Attitude" className="w-6 h-6" />
        </Link>
      </aside>
    );
  }

  return (
    <aside className="w-64 bg-white border-r shadow p-4">
      <Link
        to={`/class/${classId}`}
        className="text-lg font-bold mb-4 block text-gray-800 hover:underline"
      >
        HOME
      </Link>

      <div className="mb-6">
        <Link
          to={`/class/${classId}/courses`}
          className="font-semibold text-sm mb-2 block text-gray-700 hover:underline"
        >
          Courses
        </Link>

        <ul className="space-y-1 text-sm text-blue-700 ml-2">
          {courses.length === 0 ? (
            <li className="text-gray-500">등록된 강의가 없습니다</li>
          ) : (
            courses.map((course) => (
              <li key={course.courseId}>
                <Link
                  to={`/class/${classId}/courses/course${course.courseId}/schedule`}
                  className="hover:underline block"
                >
                  {course.title}
                </Link>
              </li>
            ))
          )}
        </ul>
      </div>

      <Link
        to={`/class/${classId}/attitude`}
        className="text-sm text-indigo-600 hover:underline font-medium"
      >
        내 수업태도 살펴보기 →
      </Link>
    </aside>
  );
}