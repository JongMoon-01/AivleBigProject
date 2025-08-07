import React, { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import Sidebar from "../components/Sidebar";
import CourseSidebar from "../components/CourseSidebar";

const LECTURE_VIDEO_PATH = "/videos/sample_lecture.mp4"; // 로컬 영상 파일 경로
const AI_SERVER_URL = "http://localhost:18000/api/score/realtime/image";


export default function CourseContentPage() {
  const webcamRef = useRef(null);
  const [hasWebcamAccess, setHasWebcamAccess] = useState(false);
  const [intervalId, setIntervalId] = useState(null);

  // 사용자 웹캠 권한 요청
  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(() => setHasWebcamAccess(true))
      .catch((err) => {
        console.error("웹캠 권한 요청 실패:", err);
        setHasWebcamAccess(false);
      });
  }, []);

  // 5초마다 AI 서버로 이미지 전송
  useEffect(() => {
  if (hasWebcamAccess) {
    const id = setInterval(async () => {
      if (!webcamRef.current) return;

      const screenshot = webcamRef.current.getScreenshot();
      if (!screenshot) return;

      try {
        const res = await fetch(AI_SERVER_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            base64_image: screenshot,
            timestamp: Date.now()
          })
        });

        const data = await res.json();
        console.log("📊 분석 결과:", data);
        // 여기서 data.final_score 등 활용 가능

      } catch (error) {
        console.error("AI 서버 전송 실패:", error);
      }
    }, 5000);

    setIntervalId(id);
    return () => clearInterval(id);
  }
}, [hasWebcamAccess]);


  return (
    <div className="flex h-screen">
      <Sidebar />
      <CourseSidebar />
      <div className="flex-1 p-6 overflow-auto">
        <header className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold">강의 제목</h1>
          
        </header>

        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2">
            <video
              src={LECTURE_VIDEO_PATH}
              controls
              className="w-full h-[400px] border rounded"
            />
          </div>

          <div className="flex flex-col space-y-2">
            <div className="border p-2 h-48 overflow-auto">
              <p className="font-bold">강사 채팅</p>
            </div>
            <div className="border p-2 h-48 overflow-auto">
              <p className="font-bold">유저 채팅</p>
            </div>
            
          </div>
        </div>

        {hasWebcamAccess && (
  <div style={{ position: "absolute", left: "-9999px", top: "-9999px" }}>
    <Webcam
      ref={webcamRef}
      screenshotFormat="image/jpeg"
      width={640}
      height={480}
      videoConstraints={{ facingMode: "user" }}
      audio={false}
    />
  </div>
)}
      </div>
    </div>
  );
}
