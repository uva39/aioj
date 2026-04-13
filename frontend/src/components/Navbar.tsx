"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/lib/auth-store";
import TierBadge from "./TierBadge";
import clsx from "clsx";

const NAV_LINKS = [
  { href: "/problems", label: "문제" },
  { href: "/leaderboard", label: "리더보드" },
  { href: "/roadmap", label: "학습 경로" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  return (
    <nav className="sticky top-0 z-50 bg-gray-900 border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center gap-6">
        {/* 로고 */}
        <Link href="/" className="text-xl font-black text-white tracking-tight">
          AIOJ
        </Link>

        {/* 네비 링크 */}
        <div className="flex items-center gap-1">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={clsx(
                "px-3 py-1.5 rounded text-sm font-medium transition-colors",
                pathname.startsWith(href)
                  ? "bg-gray-700 text-white"
                  : "text-gray-400 hover:text-white hover:bg-gray-800"
              )}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* 우측 */}
        <div className="ml-auto flex items-center gap-3">
          {user ? (
            <>
              <Link
                href={`/profile/${user.username}`}
                className="flex items-center gap-2 text-sm text-gray-300 hover:text-white"
              >
                <TierBadge tier={user.tier} size="sm" />
                <span>{user.username}</span>
              </Link>
              <button
                onClick={logout}
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                로그아웃
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                로그인
              </Link>
              <Link
                href="/register"
                className="text-sm bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded transition-colors"
              >
                회원가입
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
