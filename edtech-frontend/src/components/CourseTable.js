import { useState } from 'react';
import QuizModal from './QuizModal.js';

export default function CourseTable() {
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [selectedCourseType, setSelectedCourseType] = useState('');

  const courses = [
    {
      title: "AI 퀴즈 생성 강의 (h265_1920)",
      instructor: "관리자",
      tags: ["테스트용", "AI기반", "퀴즈생성"],
      stats: [0, 0, 0, 0, 0, 0],
      quizType: "aice"  // summaryId 매핑에서 사용될 키
    }
  ];

  const handleQuizClick = (quizType) => {
    setSelectedCourseType(quizType);
    setShowQuizModal(true);
  };

  return (
    <div className="bg-white rounded-xl shadow p-4 overflow-x-auto">
      <table className="w-full text-sm text-left table-auto">
        <tbody>
          {courses.map((course, index) => (
            <tr key={index} className="border-b last:border-b-0">
              <td className="px-4 py-3">{course.title}</td>
              <td className="px-4 py-3">{course.instructor}</td>
              <td className="px-4 py-3">{course.stats[0]}%</td>
              <td className="px-4 py-3 text-right">
                <div className="flex flex-col gap-2">
                  <button className="bg-indigo-600 text-white text-xs px-3 py-1 rounded hover:bg-indigo-700">
                    강의 바로가기 →
                  </button>
                  <button 
                    onClick={() => handleQuizClick(course.quizType)}
                    className="bg-green-600 text-white text-xs px-3 py-1 rounded hover:bg-green-700"
                  >
                    퀴즈 풀어보자 →
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {showQuizModal && (
        <QuizModal
          courseType={selectedCourseType}
          onClose={() => setShowQuizModal(false)}
        />
      )}
    </div>
  );
}

