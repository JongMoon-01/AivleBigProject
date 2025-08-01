import React from "react";

export default function RegisterPage() {
  return (
    <div className="flex-grow flex items-center justify-center w-full min-h-[calc(93vh-3rem)] py-12 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <h2 className="text-2xl font-bold mb-4">회원가입</h2>

        <label className="block mb-2">EMail</label>
        <input
          type="email"
          placeholder="Email@example.com"
          className="w-full p-2 mb-4 border rounded"
        />

        <label className="block mb-2">Password</label>
        <input
          type="password"
          placeholder="password"
          className="w-full p-2 mb-4 border rounded"
        />

        <label className="block mb-2">Password 확인</label>
        <input
          type="password"
          placeholder="password"
          className="w-full p-2 mb-4 border rounded"
        />

        <label className="block mb-2">ID</label>
        <input
          type="text"
          placeholder="User_ID"
          className="w-full p-2 mb-4 border rounded"
        />

        <label className="block mb-2">연락처</label>
        <input
          type="tel"
          placeholder="010-1234-5678"
          className="w-full p-2 mb-4 border rounded"
        />

        <label className="block mb-2">소속</label>
        <select className="w-full p-2 mb-6 border rounded">
          <option>Option 1</option>
          <option>Option 2</option>
        </select>

        <button className="w-full bg-blue-100 hover:bg-blue-200 text-blue-800 font-semibold py-2 rounded">
          회원가입
        </button>
      </div>
    </div>
  );
}
