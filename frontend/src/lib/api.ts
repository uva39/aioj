import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

export const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
});

// 요청 인터셉터: access token 자동 첨부
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// 응답 인터셉터: 401 시 토큰 갱신 시도
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const refresh = localStorage.getItem("refresh_token");
        if (!refresh) throw new Error("no refresh token");
        const { data } = await axios.post(`${API_BASE}/api/auth/refresh`, {
          refresh_token: refresh,
        });
        localStorage.setItem("access_token", data.access_token);
        localStorage.setItem("refresh_token", data.refresh_token);
        original.headers.Authorization = `Bearer ${data.access_token}`;
        return api(original);
      } catch {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        window.location.href = "/login";
      }
    }
    return Promise.reject(err);
  }
);

// ─── API 함수들 ───────────────────────────────────────────────

export interface ProblemListItem {
  id: string;
  slug: string;
  title: string;
  difficulty: string;
  category: string;
  tags: string[];
  ac_count: number;
  submission_count: number;
}

export interface TestCaseSample {
  id: string;
  input_data: string;
  expected_output: string;
  order_index: number;
}

export interface ProblemDetail extends ProblemListItem {
  title_en: string | null;
  description: string;
  function_signature: string;
  function_name: string;
  allowed_libs: string[];
  time_limit_sec: number;
  memory_limit_mb: number;
  partial_score: boolean;
  sample_test_cases: TestCaseSample[];
}

export interface SubmissionStatus {
  id: string;
  status: string;
  score: number;
  time_ms: number | null;
  memory_kb: number | null;
  error_message: string | null;
  created_at: string;
}

export interface SubmissionDetail extends SubmissionStatus {
  code: string;
  test_results: Record<string, unknown>[] | null;
  problem_id: string;
  user_id: string;
}

export interface SubmissionListItem {
  id: string;
  status: string;
  score: number;
  time_ms: number | null;
  created_at: string;
}

export interface UserPublic {
  id: string;
  username: string;
  tier: string;
  rating: number;
  solved_count: number;
  streak_current: number;
  streak_max: number;
  created_at: string;
}

export interface UserMe extends UserPublic {
  email: string;
  role: string;
}

export interface UserStats {
  username: string;
  tier: string;
  rating: number;
  solved_count: number;
  streak_current: number;
  streak_max: number;
  category_ratings: { category: string; rating: number; solved_count: number }[];
}

export interface LeaderboardEntry {
  rank: number;
  username: string;
  tier: string;
  rating: number;
  solved_count: number;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
}

// Auth
export const authApi = {
  register: (username: string, email: string, password: string) =>
    api.post<TokenResponse>("/api/auth/register", { username, email, password }),
  login: (username: string, password: string) =>
    api.post<TokenResponse>("/api/auth/login", { username, password }),
};

// Problems
export const problemsApi = {
  list: (params?: { category?: string; difficulty?: string; tag?: string; page?: number }) =>
    api.get<ProblemListItem[]>("/api/problems", { params }),
  get: (slug: string) =>
    api.get<ProblemDetail>(`/api/problems/${slug}`),
  mySubmissions: (slug: string) =>
    api.get<SubmissionListItem[]>(`/api/problems/${slug}/submissions`),
  solutions: (slug: string) =>
    api.get<SubmissionListItem[]>(`/api/problems/${slug}/solutions`),
};

// Submissions
export const submissionsApi = {
  submit: (problem_id: string, code: string) =>
    api.post<SubmissionStatus>("/api/submissions", { problem_id, code }),
  getStatus: (id: string) =>
    api.get<SubmissionStatus>(`/api/submissions/${id}`),
  getDetail: (id: string) =>
    api.get<SubmissionDetail>(`/api/submissions/${id}/detail`),
};

// Users
export const usersApi = {
  me: () => api.get<UserMe>("/api/users/me"),
  get: (username: string) => api.get<UserPublic>(`/api/users/${username}`),
  stats: (username: string) => api.get<UserStats>(`/api/users/${username}/stats`),
  calendar: (username: string) =>
    api.get<{ date: string; count: number }[]>(`/api/users/${username}/calendar`),
};

// Leaderboard
export const leaderboardApi = {
  get: (params?: { tier?: string; page?: number }) =>
    api.get<LeaderboardEntry[]>("/api/leaderboard", { params }),
};
