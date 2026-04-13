"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { authApi, usersApi } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";

export default function RegisterPage() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const [form, setForm] = useState({ username: "", email: "", password: "", confirm: "" });
  const [loading, setLoading] = useState(false);

  function set(k: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.password !== form.confirm) {
      toast.error("비밀번호가 일치하지 않습니다.");
      return;
    }
    if (form.password.length < 8) {
      toast.error("비밀번호는 8자 이상이어야 합니다.");
      return;
    }
    setLoading(true);
    try {
      const { data } = await authApi.register(form.username, form.email, form.password);
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("refresh_token", data.refresh_token);
      const me = await usersApi.me();
      setUser(me.data);
      toast.success("회원가입이 완료되었습니다!");
      router.push("/problems");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail ?? "회원가입에 실패했습니다.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-3.5rem)] px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-white mb-8 text-center">회원가입</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">아이디</label>
            <input
              type="text"
              value={form.username}
              onChange={set("username")}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              placeholder="username"
              autoComplete="username"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">이메일</label>
            <input
              type="email"
              value={form.email}
              onChange={set("email")}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">비밀번호</label>
            <input
              type="password"
              value={form.password}
              onChange={set("password")}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              placeholder="8자 이상"
              autoComplete="new-password"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">비밀번호 확인</label>
            <input
              type="password"
              value={form.confirm}
              onChange={set("confirm")}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              placeholder="••••••••"
              autoComplete="new-password"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg transition-colors"
          >
            {loading ? "처리 중..." : "회원가입"}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-500">
          이미 계정이 있으신가요?{" "}
          <Link href="/login" className="text-blue-400 hover:underline">
            로그인
          </Link>
        </p>
      </div>
    </div>
  );
}
