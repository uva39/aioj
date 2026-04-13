"use client";

import { VERDICT_COLORS, VERDICT_LABELS } from "@/lib/tier";

interface Props {
  status: string;
  score?: number;
  showScore?: boolean;
}

export default function VerdictBadge({ status, score, showScore }: Props) {
  const color = VERDICT_COLORS[status] ?? "#9e9e9e";
  const label = VERDICT_LABELS[status] ?? status.toUpperCase();

  return (
    <span
      className="inline-flex items-center gap-1 text-sm font-bold px-2 py-0.5 rounded"
      style={{ color, background: `${color}20` }}
    >
      {label}
      {showScore && score !== undefined && score < 100 && status === "accepted" && (
        <span className="text-xs opacity-70">({score})</span>
      )}
    </span>
  );
}
