// src/pages/LectureSummaryPage.js
import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import CourseSidebar from "../components/CourseSidebar";
import shaka from "shaka-player";
import api from "../api/axios";

export default function LectureSummaryPage() {
  const { classId, courseId } = useParams(); // ✅ classId도 받음
  const videoRef = useRef(null);
  const playerRef = useRef(null);

  const [lecture, setLecture] = useState(null);
  const [subtitles, setSubtitles] = useState([]);
  const [activeSubtitle, setActiveSubtitle] = useState(null);

  // ✅ 최신 CEA에서 가져온 "집중 안함" 구간(영상 상대 초 단위)
  const [unfocusedRanges, setUnfocusedRanges] = useState([]); // [{startSec, endSec}]
  const token = localStorage.getItem("token");

  // 채팅/요약 UI (기존 그대로)
  const [chatMessages, setChatMessages] = useState([]);
  const [userInput, setUserInput] = useState("");

  const lectureId = 1;

  const handleAskSummary = async () => {
    if (!userInput.trim()) return;
    setChatMessages((p) => [...p, { role: "user", content: userInput }]);
    try {
      const res = await fetch("http://localhost:8081/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: userInput }),
      });
      const data = await res.json();
      setChatMessages((p) => [...p, { role: "assistant", content: data.response }]);
      setUserInput("");
    } catch (e) {
      console.error("질문 처리 실패:", e);
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        // 1) 강의/자막
        const res = await fetch(`/api/lectures/${lectureId}`);
        if (!res.ok) throw new Error(`백엔드 응답 오류: ${res.status}`);
        const data = await res.json();
        setLecture(data);

        const vttText = await fetch(`/api/lectures/${lectureId}/subtitles`).then((r) => r.text());
        setSubtitles(parseVTT(vttText));

        // 2) 최신 집중안함 구간(없으면 그냥 넘어감)
        await loadUnfocusedRanges();

        // 3) 플레이어
        if (videoRef.current) await loadShakaPlayer();
        else setTimeout(() => loadShakaPlayer(), 500);
      } catch (err) {
        console.error("Lecture fetch error:", err);
      }
    };
    init();

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
        console.log("🧹 ShakaPlayer destroy 완료");
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classId, courseId]);

  const loadUnfocusedRanges = async () => {
    if (!classId || !courseId) {
      setUnfocusedRanges([]);
      return;
    }
    try {
      // ✅ axios 인스턴스: JWT 자동 포함, baseURL/에러 인터셉터 공통 적용
      const { status, data } = await api.get(`/focus/intervals/latest`, {
        params: { classId, courseId },
        validateStatus: () => true, // 204도 resolve 받기 위해
      });

      if (status === 204) {
        // 최신 CEA 없음 → 하이라이트 생략
        setUnfocusedRanges([]);
        return;
      }
      if (status === 401 || status === 403) {
        console.warn("인증 필요/권한 부족 – 하이라이트 생략");
        setUnfocusedRanges([]);
        return;
      }
      if (status !== 200 || !data) {
        console.warn("예상치 못한 응답:", status, data);
        setUnfocusedRanges([]);
        return;
      }

      const startedAtMs = toMs(data.startedAt);
      const ivs = Array.isArray(data.intervals) ? data.intervals : [];
      const ranges = ivs
        .map((it) => ({
          startSec: (it.start - startedAtMs) / 1000,
          endSec: (it.end - startedAtMs) / 1000,
        }))
        .filter((x) => Number.isFinite(x.startSec) && Number.isFinite(x.endSec))
        .map((x) => ({
          startSec: Math.max(0, x.startSec),
          endSec: Math.max(0, x.endSec),
        }));

      setUnfocusedRanges(mergeRanges(ranges));
    } catch (e) {
      console.error("[LectureSummary] CEA 로드 실패:", e);
      setUnfocusedRanges([]);
    }
  };

  const loadShakaPlayer = async () => {
    const video = videoRef.current;
    if (!video) return;
    if (playerRef.current) return;

    const player = new shaka.Player();
    playerRef.current = player;
    await player.attach(video);
    player.configure("manifest.defaultPresentationDelay", 0);
    player.addEventListener("error", (ev) => console.error("Shaka Error:", ev.detail));

    await player
      .load(`http://localhost:3000/mpd/master.m3u8?ts=${Date.now()}`)
      .then(() => {
        console.log("✅ Shaka load 성공");
        video.play().catch((e) => console.warn("autoplay 실패:", e));
      })
      .catch((e) => console.error("Shaka load 실패:", e));
  };

  // 실시간 현재 자막
  useEffect(() => {
    const interval = setInterval(() => {
      if (!videoRef.current || subtitles.length === 0) return;
      const now = videoRef.current.currentTime;
      const current = subtitles.find((cue) => now >= cue.start && now <= cue.end);
      if (current?.text !== activeSubtitle) setActiveSubtitle(current?.text || "");
    }, 300);
    return () => clearInterval(interval);
  }, [subtitles, activeSubtitle]);

  // ✅ cue가 집중안함 구간과 겹치나
  const isUnfocusedCue = (start, end) =>
    unfocusedRanges.some((r) => r.endSec >= start && r.startSec <= end);

  return (
    <div className="flex min-h-screen bg-blue-50">
      <Sidebar />
      <CourseSidebar courseId={courseId} />

      <main className="flex-1 p-6 grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800">{lecture?.title}</h2>
          </div>

          <div className="bg-black rounded overflow-hidden relative">
            <video ref={videoRef} className="w-full" controls />
          </div>

          {/* 실시간 자막 */}
          <div className="bg-white rounded-xl p-4 shadow h-40 overflow-y-auto text-sm text-gray-700">
            <p className="font-medium text-indigo-600 whitespace-pre-line">{activeSubtitle}</p>
          </div>

          {/* 전체 자막 + 하이라이트 */}
          <div className="bg-white rounded-xl p-4 shadow max-h-80 overflow-y-auto text-sm text-gray-700 space-y-4">
            <h3 className="font-bold text-gray-900 mb-2">📜 전체 자막</h3>
            {subtitles.map((cue, idx) => {
              const unfocused = isUnfocusedCue(cue.start, cue.end);
              return (
                <div key={idx}>
                  <div
                    className={`text-xs ${
                      unfocused ? "text-red-600 font-bold" : "text-gray-400"
                    }`}
                  >
                    {formatTime(cue.start)} → {formatTime(cue.end)}
                  </div>
                  <div
                    className={`whitespace-pre-line ${
                      unfocused ? "font-bold" : "text-indigo-700"
                    }`}
                  >
                    {cue.text}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 우측 패널: 요약 Q&A */}
        <aside className="col-span-1 flex flex-col h-[calc(100vh-4rem)] space-y-4">
          <div className="bg-white p-4 rounded-xl shadow space-y-4 flex-1 overflow-y-auto">
            <h3 className="font-bold mb-2">🧠 요약 Q&A</h3>
            {chatMessages.map((msg, idx) => (
              <div key={idx} className={`text-sm ${msg.role === "user" ? "text-right" : "text-left"}`}>
                <p className={msg.role === "user" ? "text-blue-700" : "text-gray-800"}>
                  <span className="font-semibold">{msg.role === "user" ? "🙋‍♂️ 질문" : "🤖 GPT"}:</span>{" "}
                  {msg.content}
                </p>
              </div>
            ))}
          </div>

          <div className="flex space-x-2">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="요약 내용에 대해 질문해 보세요"
              className="flex-1 p-2 border rounded"
            />
            <button
              onClick={handleAskSummary}
              className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
            >
              질문하기
            </button>
          </div>
        </aside>
      </main>
    </div>
  );
}

/* ----------------- 유틸 ----------------- */
function parseVTT(vtt) {
  const lines = vtt.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");
  const cues = [];
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes("-->")) {
      const [start, end] = lines[i].split(" --> ").map(parseTime);
      i++;
      const textLines = [];
      while (i < lines.length && lines[i].trim() !== "") {
        textLines.push(lines[i]);
        i++;
      }
      cues.push({ start, end, text: textLines.join("\n").trim() });
    }
  }
  return cues;
}

function parseTime(t) {
  const [h, m, s] = t.replace(",", ".").split(":");
  return parseFloat(h) * 3600 + parseFloat(m) * 60 + parseFloat(s);
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

// Instant/ISO/number → ms
function toMs(v) {
  if (v == null) return NaN;
  if (typeof v === "number") return v; // 이미 epoch ms
  return new Date(v).getTime();
}

// 겹치는 구간 병합(선택 사항)
function mergeRanges(ranges) {
  if (!ranges.length) return [];
  const sorted = [...ranges].sort((a, b) => a.startSec - b.startSec);
  const out = [sorted[0]];
  for (let i = 1; i < sorted.length; i++) {
    const last = out[out.length - 1];
    const cur = sorted[i];
    if (cur.startSec <= last.endSec + 0.001) {
      last.endSec = Math.max(last.endSec, cur.endSec);
    } else out.push(cur);
  }
  return out;
}
