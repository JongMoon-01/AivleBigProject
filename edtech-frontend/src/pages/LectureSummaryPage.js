import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import CourseSidebar from "../components/CourseSidebar";
import shaka from "shaka-player";

export default function LectureSummaryPage() {
  const { courseId } = useParams();
  const videoRef = useRef(null);
  const [lecture, setLecture] = useState(null);
  const [subtitles, setSubtitles] = useState([]);
  const [activeSubtitle, setActiveSubtitle] = useState(null);
  // 요약 내용 상태
  const [summary, setSummary] = useState("");
  // 채팅 내역
  const [chatMessages, setChatMessages] = useState([]);
  // 입력값
  const [userInput, setUserInput] = useState("");
  const lectureId = 1;

  // 질문 전송 
  const handleAskSummary = async () => {
  if (!userInput.trim()) return;

  // 사용자 질문 추가
  setChatMessages(prev => [...prev, { role: "user", content: userInput }]);

  try {
    const res = await fetch("http://localhost:8081/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: userInput }),
    });
    const data = await res.json();

    setChatMessages(prev => [...prev, { role: "assistant", content: data.response }]);
    setUserInput("");
  } catch (err) {
    console.error("질문 처리 실패:", err);
  }
  };

  useEffect(() => {
  const init = async () => {
    try {
      const res = await fetch(`/api/lectures/${lectureId}`);
      if (!res.ok) throw new Error(`백엔드 응답 오류: ${res.status}`);
      const data = await res.json();
      setLecture(data);

      const vttText = await fetch(`/api/lectures/${lectureId}/subtitles`).then((r) => r.text());
      setSubtitles(parseVTT(vttText));

      // DOM이 렌더링 완료되었는지 안전하게 기다려줌
      if (videoRef.current) {
        await loadShakaPlayer();
      } else {
        console.warn("⏳ videoRef가 아직 null입니다. 500ms 후 재시도");
        setTimeout(() => loadShakaPlayer(), 500);
      }
    } catch (err) {
      console.error("Lecture fetch error:", err);
    }
  };

  init();
}, []);
  const playerRef = useRef(null);

  const loadShakaPlayer = async () => {
  const video = videoRef.current;
  if (!video) {
    console.error("video element가 존재하지 않음");
    return;
  }

  if (playerRef.current) {
    console.warn("이미 ShakaPlayer 인스턴스가 존재합니다. 중복 attach 방지");
    return;
  }

  video.src = "";
  const player = new shaka.Player();
  playerRef.current = player;

  await player.attach(video);
  player.configure('manifest.defaultPresentationDelay', 0);

  const netEngine = player.getNetworkingEngine();
  netEngine.registerRequestFilter((type, request) => {
    console.log("📡 요청:", type, request.uris);
  });

  player.addEventListener("error", (event) => {
    const error = event.detail;
    console.error("💥 ShakaPlayer Error:", error);
  });

  await player.load(`http://localhost:3000/mpd/master.m3u8?ts=${Date.now()}`)
    .then(() => {
      console.log("✅ Shaka load 성공");
      video.muted = false; // true로 하면 mute된 상태로 오토플레이 가능, false로하면 오토플레이 안됨
      //video.autoPlay = true;
      video.play().catch((err) => console.warn("⚠️ autoplay 실패:", err));
    })
    .catch((err) => {
      console.error("💥 Shaka load 실패:", err);
    });
};

// 페이지 unload 시 플레이어 파괴
useEffect(() => {
  return () => {
    if (playerRef.current) {
      playerRef.current.destroy();
      playerRef.current = null;
      console.log("🧹 ShakaPlayer 인스턴스 destroy 완료");
    }
  };
}, []);


  useEffect(() => {
    const interval = setInterval(() => {
      if (!videoRef.current || subtitles.length === 0) return;
      const now = videoRef.current.currentTime;
      const current = subtitles.find((cue) => now >= cue.start && now <= cue.end);
      if (current?.text !== activeSubtitle) {
        setActiveSubtitle(current?.text || "");
      }
    }, 300);
    return () => clearInterval(interval);
  }, [subtitles]);

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
            <video ref={videoRef} className="w-full" controls autoPlay></video>
          </div>

          {/* ✅ 실시간 자막 */}
          <div className="bg-white rounded-xl p-4 shadow h-40 overflow-y-auto text-sm text-gray-700">
            <p className="font-medium text-indigo-600 whitespace-pre-line">{activeSubtitle}</p>
          </div>

          {/* ✅ 전체 자막 표시 */}
          <div className="bg-white rounded-xl p-4 shadow max-h-80 overflow-y-auto text-sm text-gray-700 space-y-4">
            <h3 className="font-bold text-gray-900 mb-2">📜 전체 자막</h3>
            {subtitles.map((cue, idx) => (
              <div key={idx}>
                <div className="text-xs text-gray-400">
                  {formatTime(cue.start)} → {formatTime(cue.end)}
                </div>
                <div className="whitespace-pre-line text-indigo-700">{cue.text}</div>
              </div>
            ))}
          </div>
        </div>

        <aside className="col-span-1 flex flex-col h-[calc(100vh-4rem)] space-y-4">
          <div className="bg-white p-4 rounded-xl shadow space-y-4 flex-1 overflow-y-auto">
  <h3 className="font-bold mb-2">🧠 요약 Q&A</h3>
  {chatMessages.map((msg, idx) => (
    <div key={idx} className={`text-sm ${msg.role === "user" ? "text-right" : "text-left"}`}>
      <p className={msg.role === "user" ? "text-blue-700" : "text-gray-800"}>
        <span className="font-semibold">{msg.role === "user" ? "🙋‍♂️ 질문" : "🤖 GPT"}:</span> {msg.content}
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

// ✅ VTT 파서
function parseVTT(vtt) {
  const lines = vtt.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");
  const cues = [];

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes("-->")) {
      const [start, end] = lines[i].split(" --> ").map(parseTime);
      i++;
      let textLines = [];
      while (i < lines.length && lines[i].trim() !== "") {
        textLines.push(lines[i]);
        i++;
      }
      const text = textLines.join("\n");
      cues.push({ start, end, text: text.trim() });
    }
  }

  console.log("📋 Parsed cues:", cues);
  return cues;
}

// ✅ 시간 파서
function parseTime(t) {
  const [h, m, s] = t.replace(",", ".").split(":");
  return parseFloat(h) * 3600 + parseFloat(m) * 60 + parseFloat(s);
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const s = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
}
