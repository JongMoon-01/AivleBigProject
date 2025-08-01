import React from "react";
import ClassCard from "../components/ClassCard";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      <main className="flex-grow p-8">
        <div className="max-w-5xl mx-auto">
          <input
            type="text"
            placeholder="클래스 검색..."
            className="w-full mb-6 px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          <div className="flex flex-wrap justify-center gap-6">
            <ClassCard title="클래스 제목" name="Class1" />
            <ClassCard title="클래스 제목" name="Class2" />
            <ClassCard title="클래스 제목" name="Class3" />
          </div>
        </div>
      </main>
    </div>
  );
}
