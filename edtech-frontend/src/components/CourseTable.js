export default function CourseTable({ courses }) {
  
  return (
    <div className="bg-white rounded-xl shadow p-4 overflow-x-auto">
      <table className="w-full text-sm text-left table-auto">
        <thead className="bg-gray-100 text-gray-700">
          <tr>
            <th className="px-4 py-2">강의명</th>
            <th className="px-4 py-2">강사</th>
            <th className="px-4 py-2">태그</th>
            <th className="px-4 py-2">진도율</th>
            <th className="px-4 py-2 text-right">바로가기</th>
          </tr>
        </thead>
        <tbody>
          {courses.map((course, idx) => (
            <tr key={idx} className="border-t">
              <td className="px-4 py-3 font-semibold">{course.title}</td>
              <td className="px-4 py-3 space-x-2">
                {(course.tags || []).map((tag, i) => (
                  <span
                    key={i}
                    className="inline-block bg-indigo-100 text-indigo-700 text-xs px-2 py-1 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </td>
              <td className="px-4 py-3">0%</td>
              <td className="px-4 py-3 text-right">
                <button className="bg-indigo-600 text-white text-xs px-3 py-1 rounded hover:bg-indigo-700">
                  강의 바로가기 →
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
