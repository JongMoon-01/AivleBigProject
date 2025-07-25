import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axiosInstance from "../api/axiosInstance";

export default function AdminDashboard() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const { impersonate } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await axiosInstance.get("/api/auth/students");
      setStudents(response.data);
    } catch (error) {
      setError("학생 목록을 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleImpersonate = async (studentId) => {
    const result = await impersonate(studentId);
    if (result.success) {
      navigate("/");
    } else {
      alert(result.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[89vh]">
        <div className="text-lg">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">관리자 대시보드</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">학생 계정 관리</h2>
        <p className="text-gray-600 mb-6">
          학생 이름을 클릭하면 해당 학생의 권한으로 시스템에 접근할 수 있습니다.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {students.map((student) => (
            <button
              key={student.userId}
              onClick={() => handleImpersonate(student.userId)}
              className="bg-blue-100 hover:bg-blue-200 text-blue-800 font-medium py-3 px-4 rounded-lg transition duration-200 text-left"
            >
              <div className="font-semibold">{student.name}</div>
              <div className="text-sm text-gray-600">{student.email}</div>
            </button>
          ))}
        </div>

        {students.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            등록된 학생이 없습니다.
          </div>
        )}
      </div>

      <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="font-semibold text-yellow-800 mb-2">안내사항</h3>
        <ul className="text-sm text-yellow-700 list-disc list-inside">
          <li>학생 권한으로 전환 시, 상단에 "관리자 모드로 돌아가기" 버튼이 표시됩니다.</li>
          <li>학생 권한으로는 다른 학생의 정보를 볼 수 없습니다.</li>
          <li>학생 권한 사용 중에도 원래 관리자 세션은 유지됩니다.</li>
        </ul>
      </div>
    </div>
  );
}