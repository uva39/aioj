"use client";

import { TIER_COLORS, TIER_LABELS } from "@/lib/tier";

interface Props {
  tier: string;
  size?: "sm" | "md" | "lg";
}

export default function TierBadge({ tier, size = "md" }: Props) {
  const color = TIER_COLORS[tier] ?? TIER_COLORS.unrated;
  const label = TIER_LABELS[tier] ?? tier;

  const sizeClass = {
    sm: "text-xs px-1.5 py-0.5",
    md: "text-sm px-2 py-1",
    lg: "text-base px-3 py-1.5",
  }[size];

  return (
    <span
      className={`inline-block font-bold rounded ${sizeClass}`}
      style={{ color, border: `1px solid ${color}`, background: `${color}18` }}
    >
      {label}
    </span>
  );
}
