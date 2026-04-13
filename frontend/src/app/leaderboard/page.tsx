"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { leaderboardApi, LeaderboardEntry } from "@/lib/api";
import TierBadge from "@/components/TierBadge";
import { TIER_ORDER } from "@/lib/tier";

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [tier, setTier] = useState("전체");
  const [page, setPage] = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await leaderboardApi.get({
        tier: tier === "전체" ? undefined : tier,
        page,
      });
      setEntries(data);
    } finally {
      setLoading(false);
    }
  }, [tier, page]);

  useEffect(() => { load(); }, [load]);

  const tiers = ["전체", ...TIER_ORDER].reverse();

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-white mb-6">리더보드</h1>

      {/* 티어 필터 */}
      <div className="flex flex-wrap gap-2 mb-6">
        {tiers.map((t) => (
          <button
            key={t}
            onClick={() => { setTier(t); setPage(1); }}
            className={`px-3 py-1 text-sm rounded transition-colors ${
              tier === t
                ? "bg-gray-700 text-white"
                : "text-gray-400 hover:text-white hover:bg-gray-800"
            }`}
          >
            {t === "전체" ? "전체" : <TierBadge tier={t} size="sm" />}
          </button>
        ))}
      </div>

      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 text-gray-400 text-xs uppercase tracking-wider">
              <th className="px-4 py-3 text-center w-14">순위</th>
              <th className="px-4 py-3 text-left">사용자</th>
              <th className="px-4 py-3 text-center w-28">티어</th>
              <th className="px-4 py-3 text-right w-24">레이팅</th>
              <th className="px-4 py-3 text-right w-24">풀이 수</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-gray-500">
                  불러오는 중...
                </td>
              </tr>
            ) : entries.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-gray-500">
                  데이터가 없습니다.
                </td>
              </tr>
            ) : (
              entries.map((e) => (
                <tr
                  key={e.username}
                  className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors"
                >
                  <td className="px-4 py-3 text-center">
                    {e.rank <= 3 ? (
                      <span className="text-lg">
                        {e.rank === 1 ? "🥇" : e.rank === 2 ? "🥈" : "🥉"}
                      </span>
                    ) : (
                      <span className="text-gray-500">{e.rank}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/profile/${e.username}`}
                      className="text-white hover:text-blue-400 font-medium transition-colors"
                    >
                      {e.username}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <TierBadge tier={e.tier} size="sm" />
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-yellow-400">
                    {e.rating.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-400">
                    {e.solved_count}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 페이지네이션 */}
      <div className="flex justify-center gap-2 mt-6">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          className="px-4 py-2 text-sm bg-gray-800 text-gray-300 rounded disabled:opacity-40 hover:bg-gray-700 transition-colors"
        >
          이전
        </button>
        <span className="px-4 py-2 text-sm text-gray-400">{page} 페이지</span>
        <button
          onClick={() => setPage((p) => p + 1)}
          disabled={entries.length < 50}
          className="px-4 py-2 text-sm bg-gray-800 text-gray-300 rounded disabled:opacity-40 hover:bg-gray-700 transition-colors"
        >
          다음
        </button>
      </div>
    </div>
  );
}
