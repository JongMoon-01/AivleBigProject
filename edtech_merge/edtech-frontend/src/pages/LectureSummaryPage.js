// src/pages/LectureSummaryPage.js
import React from "react";
import Sidebar from "../components/Sidebar";
import CourseSidebar from "../components/CourseSidebar";

export default function LectureSummaryPage() {
  return (
    <div className="flex min-h-screen bg-blue-50">
      {/* 전역 사이드바 */}
      <Sidebar />

      {/* 강의용 사이드바 */}
      <CourseSidebar />

      {/* 메인 콘텐츠 */}
      <main className="flex-1 p-6 grid grid-cols-3 gap-6">
        {/* 강의 영상 + 자막 (왼쪽 2칸) */}
        <div className="col-span-2 space-y-6">
          {/* 강의 선택 드롭다운 */}
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800">강의 제목</h2>
            <select className="border rounded px-2 py-1 text-sm">
              <option>강의 선택</option>
            </select>
          </div>

          {/* 영상 */}
          <div className="bg-black rounded overflow-hidden relative">
            <video controls className="w-full">
              <source src="/sample.mp4" type="video/mp4" />
              지원되지 않는 브라우저입니다.
            </video>
            <div className="absolute bottom-10 left-0 w-full h-1 bg-red-300 opacity-50">
              {/* 추후 집중도 표시 bar 자리 */}
            </div>
          </div>

          {/* 자막 */}
          <div className="bg-white rounded-xl p-4 shadow h-40 overflow-y-auto text-sm text-gray-700">
            <p>00:01 Lorem ipsum dolor sit amet...</p>
            <p>00:05 Consectetur adipiscing elit...</p>
            <p>00:10 Sed do eiusmod tempor incididunt...</p>
          </div>
        </div>

        {/* 요약 + 챗 패널 (오른쪽 1칸) */}
        <aside className="col-span-1 space-y-6">
          <div className="bg-white p-4 rounded-xl shadow">
            <h3 className="font-bold mb-2">🧠 요약 내용</h3>
            <p className="text-sm text-gray-700">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit...
            </p>
          </div>

          <div className="bg-white p-4 rounded-xl shadow">
            <h3 className="font-bold mb-2">🙋‍♀️ 사용자 질문</h3>
            <p className="text-sm text-gray-700">
              요약 내용을 보고 궁금한 점을 질문해 보세요.
            </p>
          </div>

          <button className="w-full bg-indigo-600 text-white rounded py-2 font-medium shadow hover:bg-indigo-700">
            요약에 대해 질문하기
          </button>
        </aside>
      </main>
    </div>
  );
}
