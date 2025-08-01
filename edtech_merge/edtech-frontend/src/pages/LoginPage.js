import React from "react";
import { Link } from "react-router-dom";

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-[89vh] bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
          로그인
        </h2>

        <label className="block text-sm font-medium text-gray-700 mb-1">
          E-Mail
        </label>
        <input
          type="email"
          placeholder="Email@example.com"
          className="w-full mb-4 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none"
        />

        <label className="block text-sm font-medium text-gray-700 mb-1">
          Password
        </label>
        <input
          type="password"
          placeholder="password"
          className="w-full mb-2 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none"
        />

        <div className="flex justify-end text-sm mb-6">
          <Link
            to="/register"
            className="text-indigo-600 hover:underline transition"
          >
            회원가입
          </Link>
        </div>

        <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-lg transition">
          로그인
        </button>

        <div className="mt-6 border-t pt-4 text-sm text-center text-gray-500">
          <p className="mb-1">테스트용 ID</p>
          <p>테스트용 password</p>
        </div>
      </div>
    </div>
  );
}
