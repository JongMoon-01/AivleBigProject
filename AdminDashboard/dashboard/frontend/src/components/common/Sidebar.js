import { Link, useLocation } from "react-router-dom";
import homeIcon from "../../assets/icons/icons8-home-100.png";
import courseIcon from "../../assets/icons/icons8-course-100.png";
import attitudeIcon from "../../assets/icons/icons8-report-100.png";

export default function Sidebar() {
  const location = useLocation();
  const isCourseDetailPage = location.pathname.startsWith("/class/courses/course");

  if (isCourseDetailPage) {
    // 👉 간결한 아이콘 전용 사이드바
    return (
      <aside className="w-16 bg-white border-r shadow p-4 flex flex-col items-center gap-6">
        <Link to="/class/class1">
          <img src={homeIcon} alt="Home" className="w-6 h-6" />
        </Link>
        <Link to="/class/courses">
          <img src={courseIcon} alt="Courses" className="w-6 h-6" />
        </Link>
        <Link to="/class/class1/attitude">
          <img src={attitudeIcon} alt="Attitude" className="w-6 h-6" />
        </Link>
      </aside>
    );
  }

  // 👉 일반적인 전체 메뉴 표시
  return (
    <aside className="w-64 bg-white border-r shadow p-4">
      <Link
        to="/class/class1"
        className="text-lg font-bold mb-4 block text-gray-800 hover:underline"
      >
        HOME
      </Link>

      <div className="mb-6">
        <Link
          to="/class/courses"
          className="font-semibold text-sm mb-2 block text-gray-700 hover:underline"
        >
          Courses
        </Link>
        <ul className="space-y-1 text-sm text-blue-700 ml-2">
          <li>
            <Link to="/class/courses/course1" className="hover:underline block">Course1</Link>
          </li>
          <li>
            <Link to="/class/courses/course2" className="hover:underline block">Course2</Link>
          </li>
          <li>
            <Link to="/class/courses/course3" className="hover:underline block">Course3</Link>
          </li>
        </ul>
      </div>

      <Link
        to="/class/class1/attitude"
        className="text-sm text-indigo-600 hover:underline font-medium"
      >
        내 수업태도 살펴보기 →
      </Link>
    </aside>
  );
}