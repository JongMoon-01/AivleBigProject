// src/pages/CourseContentPage.js
import React, { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import { useParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import CourseSidebar from "../components/CourseSidebar";
import api from "../api/axios";
import { getAuth } from "../utils/auth";

const LECTURE_VIDEO_PATH = "/videos/sample_lecture.mp4";
const AI_SERVER_URL = "http://localhost:18000/api/score/realtime/image";   // AI 분석 서버
const FOCUS_API_URL = "http://localhost:8080/api/focus/intervals";        // 집중 구간 저장(스프링)

export default function CourseContentPage() {
  const { classId, courseId } = useParams();      // 라우트에 있으면 자동 반영됨
  const auth = getAuth();
  const userId = auth?.userId || auth?.email || auth?.sub;

  // ----- UI/상태 -----
  const [running, setRunning] = useState(false);   // 스트리밍 on/off
  const [hasWebcamAccess, setHasWebcamAccess] = useState(false);
  const [lastScore, setLastScore] = useState(null);

  // ----- 타이머 -----
  const [elapsedMs, setElapsedMs] = useState(0);
  const tickTimerRef = useRef(null);

  // ----- 스트림/주기전송 -----
  const webcamRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const sendTimerRef = useRef(null);
  const runningRef = useRef(false);

  // ----- 임계치/구간수집 -----
  const THRESHOLD = 0.7;    // 서버가 0~1 스코어면 0.5, 0~100이면 50으로
  const MIN_SAVE_SEC = 10;  // 10초 미만 구간 버림
  const lowStartRef = useRef(null);
  const lowIntervalsRef = useRef([]); // {start, end, scoreSamples:[]}

  // 언마운트 정리
  useEffect(() => {
    return () => stopAll();
  }, []);

  const formatTime = (ms) => {
    const s = Math.floor(ms / 1000);
    const hh = String(Math.floor(s / 3600)).padStart(2, "0");
    const mm = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
    const ss = String(s % 60).padStart(2, "0");
    return `${hh}:${mm}:${ss}`;
  };

  const askWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      mediaStreamRef.current = stream;
      setHasWebcamAccess(true);
      return true;
    } catch (e) {
      console.error("웹캠 권한 실패:", e);
      setHasWebcamAccess(false);
      return false;
    }
  };

  const startAll = async () => {
    if (runningRef.current) return;

    // 1) 타이머 00:00:00 시작
    setElapsedMs(0);
    tickTimerRef.current = setInterval(() => setElapsedMs((v) => v + 1000), 1000);

    // 2) 카메라 권한
    const ok = hasWebcamAccess || (await askWebcam());
    if (!ok) {
      clearInterval(tickTimerRef.current);
      tickTimerRef.current = null;
      return;
    }

    // 3) 상태 초기화
    lowStartRef.current = null;
    lowIntervalsRef.current = [];
    runningRef.current = true;
    setRunning(true);

    // 4) 5초 주기 전송
    await captureAndSend(); // 즉시 1회
    sendTimerRef.current = setInterval(captureAndSend, 5000);
  };

  const stopAll = async () => {
    if (!runningRef.current && !tickTimerRef.current) return;

    // 1) 타이머 정지
    if (tickTimerRef.current) {
      clearInterval(tickTimerRef.current);
      tickTimerRef.current = null;
    }

    // 2) 전송 루프 정지
    runningRef.current = false;
    setRunning(false);
    if (sendTimerRef.current) {
      clearInterval(sendTimerRef.current);
      sendTimerRef.current = null;
    }

    // 3) 미완 구간 마감
    finalizeOpenLowInterval();

    // 4) DB 저장
    try {
      if (lowIntervalsRef.current.length > 0) {
        const payload = {
          classId: Number(classId) || null,
          courseId: Number(courseId) || null,
          startedAt: Date.now() - elapsedMs, // 세션 시작 epoch(ms)
          endedAt: Date.now(),
          totalDurationSec: Math.round(elapsedMs / 1000),
          intervals: lowIntervalsRef.current.map((it) => ({
            start: it.start,
            end: it.end,
            durationSec: Math.round((it.end - it.start) / 1000),
            avgScore: avg(it.scoreSamples),
          })),
        };
        await api.post("/focus/intervals", payload);
        console.log("📝 집중안함 구간 저장:", payload);
      } else {
        console.log("저장할 구간 없음");
      }
    } catch (e) {
  console.error("DB 저장 실패:", e);
  console.error("DB 저장 실패:", {
    status: e?.response?.status,
    data: e?.response?.data,
    message: e?.message
  });
  }

    // 5) 카메라 끄기
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
    setHasWebcamAccess(false);
  };

  const captureAndSend = async () => {
    if (!runningRef.current || !webcamRef.current) return;

    const screenshot = webcamRef.current.getScreenshot();
    if (!screenshot) return;

    try {
      const res = await fetch(AI_SERVER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          base64_image: screenshot,   // data:image/jpeg;base64,... 형태
          timestamp: Date.now(),
        }),
      });
      const data = await res.json();

      const score = normalizeScore(data?.final_score);
      setLastScore(score);

      // 임계치 로직
      if (score < THRESHOLD) {
        if (!lowStartRef.current) {
          lowStartRef.current = Date.now();
          lowIntervalsRef.current.push({ start: lowStartRef.current, end: null, scoreSamples: [score] });
        } else {
          const cur = lowIntervalsRef.current[lowIntervalsRef.current.length - 1];
          cur.scoreSamples.push(score);
        }
      } else {
        if (lowStartRef.current) {
          const now = Date.now();
          const cur = lowIntervalsRef.current[lowIntervalsRef.current.length - 1];
          cur.end = now;
          if ((cur.end - cur.start) / 1000 < MIN_SAVE_SEC) {
            lowIntervalsRef.current.pop(); // 너무 짧으면 버림
          }
          lowStartRef.current = null;
        }
      }
    } catch (e) {
      console.error("AI 서버 전송 실패:", e);
    }
  };

  const finalizeOpenLowInterval = () => {
    if (!lowStartRef.current) return;
    const cur = lowIntervalsRef.current[lowIntervalsRef.current.length - 1];
    if (cur && !cur.end) {
      cur.end = Date.now();
      if ((cur.end - cur.start) / 1000 < MIN_SAVE_SEC) {
        lowIntervalsRef.current.pop();
      }
    }
    lowStartRef.current = null;
  };

  const normalizeScore = (s) => {
    if (s == null) return 0;
    if (s > 1) return Math.max(0, Math.min(1, s / 100)); // 0~100 → 0~1
    return Math.max(0, Math.min(1, s));
  };

  const avg = (arr) => (arr?.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0);

  return (
    <div className="flex h-screen">
      <Sidebar />
      <CourseSidebar />
      <div className="flex-1 p-6 overflow-auto">
        <header className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold">강의 제목</h1>
          <div className="flex items-center gap-3">
            <span className="font-mono">{formatTime(elapsedMs)}</span>
            <span className="text-sm text-gray-500">
              {running ? "실시간 분석 중" : "대기 중"}
              {lastScore != null && ` · score: ${lastScore.toFixed(2)}`}
            </span>
            {!running ? (
              <button className="px-3 py-1 rounded bg-indigo-600 text-white hover:bg-indigo-700" onClick={startAll}>
                시작하기
              </button>
            ) : (
              <button className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700" onClick={stopAll}>
                종료하기
              </button>
            )}
          </div>
        </header>

        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2">
            <video src={LECTURE_VIDEO_PATH} controls className="w-full h-[400px] border rounded" />
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

        {/* 숨김 웹캠 */}
        {hasWebcamAccess && (
          <div style={{ position: "absolute", left: "-9999px", top: "-9999px" }}>
            <Webcam
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              width={640}
              height={480}
              videoConstraints={{ facingMode: "user" }}
              audio={false}
              onUserMedia={(stream) => {
                if (!mediaStreamRef.current) mediaStreamRef.current = stream;
              }}
              onUserMediaError={(e) => {
                console.error("웹캠 에러:", e);
                setHasWebcamAccess(false);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
