import React from "react";
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import ClassCard from "../components/ClassCard";

export default function HomePage() {

  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);

  useEffect(() => {
    axios
      .get("https://8080-jongmoon01-aivlebigproj-bm0u19yd4cv.ws-us120.gitpod.io/api/class")
      .then((res) => {
        setClasses(res.data);
      })
      .catch((err) => {
        console.error("클래스 불러오기 실패:", err);
      });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      <main className="flex-grow p-8">
        <div className="max-w-5xl mx-auto">
          <input
            type="text"
            placeholder="클래스 검색..."
            className="w-full mb-6 px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          <button
            className="mb-6 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            onClick={() => navigate("/classregister")}
          >
            클래스 등록
          </button>

          <div className="flex flex-wrap justify-center gap-6">
            {classes.map(({ classId, title }) => (
              <ClassCard key={classId} classId={classId} title={title} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
