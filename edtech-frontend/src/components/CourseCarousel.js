// components/CourseCarousel.js
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import axios from "axios";
import classNames from "classnames";
import { useParams } from "react-router-dom";

export default function CourseCarousel() {
  const [courses, setCourses] = useState([]);
  const [active, setActive] = useState(0);
  const { classId } = useParams();

  useEffect(() => {
    axios
      .get("https://8080-jongmoon01-aivlebigproj-bm0u19yd4cv.ws-us120.gitpod.io/api/course", {
        params: { classId: classId }
      })
      .then((res) => setCourses(res.data))
      .catch((err) => console.error("코스 불러오기 실패:", err));
  }, [classId]);

  const handleClick = (dir) => {
    setActive((prev) =>
      dir === "next" ? (prev + 1) % courses.length : (prev - 1 + courses.length) % courses.length
    );
  };

  return (
    <div className="relative w-full max-w-5xl mx-auto px-4 py-6 overflow-visible">
      {/* 캐러셀 카드 영역 */}
      <div className="relative h-72 flex justify-center items-center">
        {courses.map((course, idx) => {
          const offset = idx - active;

          if (Math.abs(offset) > 2) return null;

          const isActive = offset === 0;
          const zIndex = 10 - Math.abs(offset);
          const translateX = offset * 180;
          const rotateY = offset * -10;
          const scale = 1 - Math.abs(offset) * 0.04;

          return (
            <motion.div
              key={course.courseId}
              className={classNames(
                "absolute w-56 h-60 p-4 bg-white rounded-xl shadow-lg text-center transition-all duration-500",
                {
                  "z-50 scale-105": isActive,
                  "scale-95 text-gray-400": !isActive,
                }
              )}
              style={{
                transform: `translateX(${translateX}px) rotateY(${rotateY}deg) scale(${scale})`,
                zIndex,
              }}
            >
              <h3 className="text-base font-bold">{course.title}</h3>
              <p className="text-sm mt-2 text-gray-500">Video: {course.videoUrl}</p>
            </motion.div>
          );
        })}
      </div>

      {/* 좌우 버튼 */}
      <div className="flex justify-center gap-4 mt-8">
        <button
          onClick={() => handleClick("prev")}
          className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
        >
          ←
        </button>
        <button
          onClick={() => handleClick("next")}
          className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
        >
          →
        </button>
      </div>

      {/* 인디케이터 */}
      <div className="flex justify-center mt-4 space-x-2">
        {courses.map((_, idx) => (
          <div
            key={idx}
            className={`w-3 h-3 rounded-full transition ${
              idx === active ? "bg-yellow-400" : "bg-gray-300"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
