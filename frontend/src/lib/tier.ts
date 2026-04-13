export const TIER_ORDER = [
  "iron", "bronze", "silver", "gold", "platinum", "diamond", "ruby",
] as const;

export type Tier = typeof TIER_ORDER[number];

export const TIER_COLORS: Record<string, string> = {
  iron: "#818181",
  bronze: "#ad5600",
  silver: "#435f7a",
  gold: "#ec9a00",
  platinum: "#27e2a4",
  diamond: "#00b4fc",
  ruby: "#ff0062",
  unrated: "#9e9e9e",
};

export const TIER_LABELS: Record<string, string> = {
  iron: "Iron",
  bronze: "Bronze",
  silver: "Silver",
  gold: "Gold",
  platinum: "Platinum",
  diamond: "Diamond",
  ruby: "Ruby",
  unrated: "Unrated",
};

export const DIFFICULTY_COLORS: Record<string, string> = {
  iron: "#818181",
  bronze: "#ad5600",
  silver: "#435f7a",
  gold: "#ec9a00",
  platinum: "#27e2a4",
  diamond: "#00b4fc",
  ruby: "#ff0062",
};

export const VERDICT_COLORS: Record<string, string> = {
  accepted: "#00c853",
  wrong_answer: "#ef5350",
  time_limit_exceeded: "#ffa726",
  illegal_import: "#ab47bc",
  runtime_error: "#ef9a9a",
  memory_limit_exceeded: "#ffa726",
  pending: "#78909c",
  running: "#29b6f6",
};

export const VERDICT_LABELS: Record<string, string> = {
  accepted: "AC",
  wrong_answer: "WA",
  time_limit_exceeded: "TLE",
  illegal_import: "IE",
  runtime_error: "RE",
  memory_limit_exceeded: "MLE",
  pending: "채점 중",
  running: "실행 중",
};
