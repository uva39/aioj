"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { usersApi, UserPublic, UserStats } from "@/lib/api";
import TierBadge from "@/components/TierBadge";
import { TIER_COLORS } from "@/lib/tier";

interface CalendarEntry { date: string; count: number }

export default function ProfilePage() {
  const { username } = useParams<{ username: string }>();
  const [user, setUser] = useState<UserPublic | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [calendar, setCalendar] = useState<CalendarEntry[]>([]);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    Promise.all([
      usersApi.get(username),
      usersApi.stats(username),
      usersApi.calendar(username),
    ])
      .then(([u, s, c]) => {
        setUser(u.data);
        setStats(s.data);
        setCalendar(c.data);
      })
      .catch(() => setNotFound(true));
  }, [username]);

  if (notFound) {
    return (
      <div className="flex items-center justify-center h-96 text-gray-500">
        사용자를 찾을 수 없습니다.
      </div>
    );
  }

  if (!user || !stats) {
    return (
      <div className="flex items-center justify-center h-96 text-gray-500">
        불러오는 중...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* 헤더 */}
      <div className="flex items-center gap-5 mb-8">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold border-2"
          style={{
            borderColor: TIER_COLORS[user.tier] ?? "#9e9e9e",
            background: `${TIER_COLORS[user.tier] ?? "#9e9e9e"}20`,
            color: TIER_COLORS[user.tier] ?? "#9e9e9e",
          }}
        >
          {user.username[0].toUpperCase()}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">{user.username}</h1>
          <div className="flex items-center gap-3 mt-1">
            <TierBadge tier={user.tier} />
            <span className="text-yellow-400 font-mono font-bold">
              {user.rating.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "풀이 수", value: stats.solved_count },
          { label: "레이팅", value: stats.rating.toLocaleString() },
          { label: "현재 스트릭", value: `${stats.streak_current}일` },
          { label: "최대 스트릭", value: `${stats.streak_max}일` },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center"
          >
            <div className="text-2xl font-bold text-white">{value}</div>
            <div className="text-sm text-gray-500 mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* 잔디 (GitHub 스타일) */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-8">
        <h2 className="text-sm font-semibold text-gray-300 mb-4">풀이 활동</h2>
        <CalendarHeatmap data={calendar} />
      </div>

      {/* 카테고리별 레이팅 */}
      {stats.category_ratings.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 className="text-sm font-semibold text-gray-300 mb-4">카테고리별 레이팅</h2>
          <div className="space-y-3">
            {stats.category_ratings
              .sort((a, b) => b.rating - a.rating)
              .map((cr) => (
                <div key={cr.category} className="flex items-center gap-3">
                  <span className="text-sm text-gray-400 w-32 shrink-0">{cr.category}</span>
                  <div className="flex-1 bg-gray-800 rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-blue-500"
                      style={{ width: `${Math.min(100, (cr.rating / 2000) * 100)}%` }}
                    />
                  </div>
                  <span className="text-sm font-mono text-yellow-400 w-12 text-right">
                    {cr.rating}
                  </span>
                  <span className="text-xs text-gray-500 w-10 text-right">
                    {cr.solved_count}문제
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

// 간단한 히트맵 컴포넌트
function CalendarHeatmap({ data }: { data: CalendarEntry[] }) {
  const map = new Map(data.map((d) => [d.date, d.count]));

  // 지난 52주 생성
  const today = new Date();
  const weeks: string[][] = [];
  let current = new Date(today);
  // 오늘이 속한 주의 토요일로 맞추기
  current.setDate(current.getDate() - current.getDay() + 6);

  for (let w = 0; w < 52; w++) {
    const week: string[] = [];
    for (let d = 6; d >= 0; d--) {
      const date = new Date(current);
      date.setDate(current.getDate() - d);
      week.push(date.toISOString().slice(0, 10));
    }
    weeks.unshift(week);
    current.setDate(current.getDate() - 7);
  }

  function getColor(count: number) {
    if (count === 0) return "#1f2937";
    if (count === 1) return "#166534";
    if (count <= 3) return "#15803d";
    if (count <= 6) return "#16a34a";
    return "#22c55e";
  }

  return (
    <div className="overflow-x-auto">
      <div className="flex gap-1">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1">
            {week.map((date) => {
              const count = map.get(date) ?? 0;
              return (
                <div
                  key={date}
                  title={`${date}: ${count}문제`}
                  className="w-3 h-3 rounded-sm"
                  style={{ background: getColor(count) }}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
