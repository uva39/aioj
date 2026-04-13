"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { problemsApi, ProblemListItem } from "@/lib/api";
import { DIFFICULTY_COLORS, TIER_LABELS } from "@/lib/tier";
import TierBadge from "@/components/TierBadge";

const CATEGORIES = [
  "전체",
  "선형 모델",
  "트리 / 앙상블",
  "클러스터링",
  "차원 축소",
  "확률 모델",
  "거리/유사도",
  "순전파 / 역전파",
  "활성화 함수",
  "최적화",
  "정규화",
  "합성곱",
  "손실 함수",
  "순환 신경망",
  "어텐션",
];

const DIFFICULTIES = ["전체", "iron", "bronze", "silver", "gold", "platinum", "diamond", "ruby"];

export default function ProblemsPage() {
  const [problems, setProblems] = useState<ProblemListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("전체");
  const [difficulty, setDifficulty] = useState("전체");
  const [page, setPage] = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await problemsApi.list({
        category: category === "전체" ? undefined : category,
        difficulty: difficulty === "전체" ? undefined : difficulty,
        page,
      });
      setProblems(data);
    } finally {
      setLoading(false);
    }
  }, [category, difficulty, page]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-white mb-6">문제</h1>

      {/* 필터 */}
      <div className="flex flex-wrap gap-3 mb-6">
        {/* 난이도 */}
        <div className="flex items-center gap-1">
          {DIFFICULTIES.map((d) => (
            <button
              key={d}
              onClick={() => { setDifficulty(d); setPage(1); }}
              className={`px-3 py-1 text-sm rounded transition-colors ${
                difficulty === d
                  ? "bg-gray-700 text-white"
                  : "text-gray-400 hover:text-white hover:bg-gray-800"
              }`}
              style={d !== "전체" && difficulty === d ? { color: DIFFICULTY_COLORS[d] } : {}}
            >
              {d === "전체" ? "전체" : TIER_LABELS[d]}
            </button>
          ))}
        </div>
      </div>

      {/* 카테고리 */}
      <div className="flex flex-wrap gap-2 mb-6">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => { setCategory(c); setPage(1); }}
            className={`px-3 py-1 text-sm rounded-full border transition-colors ${
              category === c
                ? "border-blue-500 bg-blue-900/30 text-blue-300"
                : "border-gray-700 text-gray-400 hover:border-gray-500 hover:text-gray-200"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* 문제 테이블 */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 text-gray-400 text-xs uppercase tracking-wider">
              <th className="px-4 py-3 text-left w-16">#</th>
              <th className="px-4 py-3 text-left">문제</th>
              <th className="px-4 py-3 text-left w-28">카테고리</th>
              <th className="px-4 py-3 text-left w-24">난이도</th>
              <th className="px-4 py-3 text-right w-24">정답률</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-gray-500">
                  불러오는 중...
                </td>
              </tr>
            ) : problems.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-gray-500">
                  문제가 없습니다.
                </td>
              </tr>
            ) : (
              problems.map((p, i) => {
                const acRate =
                  p.submission_count > 0
                    ? Math.round((p.ac_count / p.submission_count) * 100)
                    : 0;
                return (
                  <tr
                    key={p.id}
                    className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors"
                  >
                    <td className="px-4 py-3 text-gray-500">
                      {(page - 1) * 20 + i + 1}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/problems/${p.slug}`}
                        className="text-white hover:text-blue-400 font-medium transition-colors"
                      >
                        {p.title}
                      </Link>
                      {p.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {p.tags.map((t) => (
                            <span
                              key={t}
                              className="text-xs bg-gray-800 text-gray-400 px-1.5 py-0.5 rounded"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{p.category}</td>
                    <td className="px-4 py-3">
                      <TierBadge tier={p.difficulty} size="sm" />
                    </td>
                    <td className="px-4 py-3 text-right text-gray-400">
                      {p.submission_count > 0 ? (
                        <span
                          className={
                            acRate >= 50
                              ? "text-green-400"
                              : acRate >= 25
                              ? "text-yellow-400"
                              : "text-red-400"
                          }
                        >
                          {acRate}%
                        </span>
                      ) : (
                        <span className="text-gray-600">—</span>
                      )}
                    </td>
                  </tr>
                );
              })
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
        <span className="px-4 py-2 text-sm text-gray-400">
          {page} 페이지
        </span>
        <button
          onClick={() => setPage((p) => p + 1)}
          disabled={problems.length < 20}
          className="px-4 py-2 text-sm bg-gray-800 text-gray-300 rounded disabled:opacity-40 hover:bg-gray-700 transition-colors"
        >
          다음
        </button>
      </div>
    </div>
  );
}
