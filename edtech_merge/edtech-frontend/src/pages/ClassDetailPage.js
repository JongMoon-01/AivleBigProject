// pages/ClassDetailPage.js
import React from "react";
import Sidebar from "../components/Sidebar";
import CourseCarousel from "../components/CourseCarousel";
import BoardPreview from "../components/BoardPreview";

export default function ClassDetailPage() {
  return (
    <div className="flex flex-col min-h-screen bg-blue-50">
      <div className="flex flex-grow">
        <Sidebar />

        <main className="flex-1 p-6">
          <CourseCarousel />

          <div className="mt-10 grid grid-cols-2 gap-6">
            <BoardPreview title="클래스 공지 게시판" />
            <BoardPreview title="질문 게시판" />
          </div>
        </main>
      </div>
    </div>
  );
}
