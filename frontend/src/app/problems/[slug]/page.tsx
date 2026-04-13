"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import toast from "react-hot-toast";
import { problemsApi, submissionsApi, ProblemDetail, SubmissionListItem } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import TierBadge from "@/components/TierBadge";
import VerdictBadge from "@/components/VerdictBadge";

// Monaco Editor는 SSR 불가
const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

type Tab = "description" | "submissions" | "solutions";

export default function ProblemPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { user } = useAuthStore();

  const [problem, setProblem] = useState<ProblemDetail | null>(null);
  const [code, setCode] = useState("");
  const [tab, setTab] = useState<Tab>("description");
  const [submissions, setSubmissions] = useState<SubmissionListItem[]>([]);
  const [solutions, setSolutions] = useState<SubmissionListItem[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [judgeResult, setJudgeResult] = useState<{
    status: string;
    score: number;
    time_ms: number | null;
    error_message: string | null;
  } | null>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    problemsApi.get(slug).then(({ data }) => {
      setProblem(data);
      setCode(data.function_signature + "\n    pass\n");
    });
  }, [slug]);

  const loadSubmissions = useCallback(async () => {
    if (!user) return;
    try {
      const { data } = await problemsApi.mySubmissions(slug);
      setSubmissions(data);
    } catch {
      // 무시
    }
  }, [slug, user]);

  const loadSolutions = useCallback(async () => {
    if (!user) return;
    try {
      const { data } = await problemsApi.solutions(slug);
      setSolutions(data);
    } catch {
      // AC 전이면 403 — 조용히 무시
    }
  }, [slug, user]);

  useEffect(() => {
    if (tab === "submissions") loadSubmissions();
    if (tab === "solutions") loadSolutions();
  }, [tab, loadSubmissions, loadSolutions]);

  async function handleSubmit() {
    if (!user) {
      toast.error("로그인이 필요합니다.");
      router.push("/login");
      return;
    }
    if (!problem) return;
    setSubmitting(true);
    setJudgeResult(null);
    try {
      const { data } = await submissionsApi.submit(problem.id, code);
      toast("채점 중...", { icon: "⏳" });

      // 폴링: 채점 결과 확인
      pollingRef.current = setInterval(async () => {
        const { data: status } = await submissionsApi.getStatus(data.id);
        if (status.status !== "pending" && status.status !== "running") {
          clearInterval(pollingRef.current!);
          setSubmitting(false);
          setJudgeResult({
            status: status.status,
            score: status.score,
            time_ms: status.time_ms,
            error_message: status.error_message,
          });
          if (status.status === "accepted") {
            toast.success("정답입니다!");
          } else {
            toast.error(
              status.status === "illegal_import"
                ? "금지된 라이브러리를 사용했습니다."
                : "오답입니다."
            );
          }
          loadSubmissions();
        }
      }, 1500);
    } catch {
      setSubmitting(false);
      toast.error("제출에 실패했습니다.");
    }
  }

  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  if (!problem) {
    return (
      <div className="flex items-center justify-center h-96 text-gray-500">
        불러오는 중...
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-3.5rem)] flex overflow-hidden">
      {/* 왼쪽: 문제 설명 */}
      <div className="w-[45%] flex flex-col border-r border-gray-800 overflow-hidden">
        {/* 헤더 */}
        <div className="px-6 py-4 border-b border-gray-800">
          <div className="flex items-center gap-3 mb-1">
            <TierBadge tier={problem.difficulty} />
            <h1 className="text-lg font-bold text-white">{problem.title}</h1>
            {problem.title_en && (
              <span className="text-sm text-gray-500">{problem.title_en}</span>
            )}
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span>{problem.category}</span>
            <span>시간 제한 {problem.time_limit_sec}s</span>
            <span>메모리 {problem.memory_limit_mb}MB</span>
            <span className="text-blue-400">
              허용: {problem.allowed_libs.join(", ")}
            </span>
          </div>
        </div>

        {/* 탭 */}
        <div className="flex border-b border-gray-800">
          {(["description", "submissions", "solutions"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-3 text-sm font-medium transition-colors ${
                tab === t
                  ? "text-white border-b-2 border-blue-500"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              {t === "description" ? "문제" : t === "submissions" ? "내 제출" : "풀이 보기"}
            </button>
          ))}
        </div>

        {/* 탭 내용 */}
        <div className="flex-1 overflow-y-auto p-6">
          {tab === "description" && (
            <>
              <div className="prose-problem">
                <ReactMarkdown
                  remarkPlugins={[remarkMath]}
                  rehypePlugins={[rehypeKatex]}
                >
                  {problem.description}
                </ReactMarkdown>
              </div>

              {/* 공개 테스트케이스 */}
              {problem.sample_test_cases.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-semibold text-gray-300 mb-3">예제</h3>
                  {problem.sample_test_cases.map((tc, i) => (
                    <div key={tc.id} className="mb-4">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <div className="text-xs text-gray-500 mb-1">입력 {i + 1}</div>
                          <pre className="bg-gray-900 border border-gray-700 rounded p-3 text-xs text-gray-300 overflow-x-auto">
                            {tc.input_data}
                          </pre>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-1">출력 {i + 1}</div>
                          <pre className="bg-gray-900 border border-gray-700 rounded p-3 text-xs text-gray-300 overflow-x-auto">
                            {tc.expected_output}
                          </pre>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 태그 */}
              {problem.tags.length > 0 && (
                <div className="mt-6 flex flex-wrap gap-2">
                  {problem.tags.map((t) => (
                    <span
                      key={t}
                      className="text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </>
          )}

          {tab === "submissions" && (
            <div>
              {!user ? (
                <p className="text-gray-500 text-sm">로그인 후 확인할 수 있습니다.</p>
              ) : submissions.length === 0 ? (
                <p className="text-gray-500 text-sm">제출 기록이 없습니다.</p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-gray-500 border-b border-gray-800">
                      <th className="pb-2 text-left">결과</th>
                      <th className="pb-2 text-right">점수</th>
                      <th className="pb-2 text-right">시간</th>
                      <th className="pb-2 text-right">제출일</th>
                    </tr>
                  </thead>
                  <tbody>
                    {submissions.map((s) => (
                      <tr key={s.id} className="border-b border-gray-800/50 py-2">
                        <td className="py-2">
                          <VerdictBadge status={s.status} />
                        </td>
                        <td className="py-2 text-right text-gray-400">{s.score}</td>
                        <td className="py-2 text-right text-gray-400">
                          {s.time_ms != null ? `${s.time_ms}ms` : "—"}
                        </td>
                        <td className="py-2 text-right text-gray-500 text-xs">
                          {new Date(s.created_at).toLocaleDateString("ko-KR")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {tab === "solutions" && (
            <div>
              {!user ? (
                <p className="text-gray-500 text-sm">로그인 후 확인할 수 있습니다.</p>
              ) : solutions.length === 0 ? (
                <p className="text-gray-500 text-sm">
                  이 문제를 먼저 AC 해야 다른 사람의 풀이를 볼 수 있습니다.
                </p>
              ) : (
                <div className="space-y-2">
                  {solutions.map((s) => (
                    <div
                      key={s.id}
                      className="flex items-center justify-between bg-gray-800 rounded px-4 py-2 text-sm"
                    >
                      <VerdictBadge status={s.status} />
                      <span className="text-gray-400">
                        {s.time_ms != null ? `${s.time_ms}ms` : ""}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 오른쪽: 에디터 + 결과 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 에디터 */}
        <div className="flex-1 overflow-hidden">
          <MonacoEditor
            height="100%"
            language="python"
            theme="vs-dark"
            value={code}
            onChange={(v) => setCode(v ?? "")}
            options={{
              fontSize: 14,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              padding: { top: 16 },
              fontFamily: "JetBrains Mono, Fira Code, monospace",
              fontLigatures: true,
            }}
          />
        </div>

        {/* 하단 바 */}
        <div className="border-t border-gray-800 px-4 py-3 flex items-center gap-4">
          {/* 채점 결과 */}
          {judgeResult && (
            <div className="flex items-center gap-3">
              <VerdictBadge status={judgeResult.status} score={judgeResult.score} showScore />
              {judgeResult.time_ms != null && (
                <span className="text-xs text-gray-500">{judgeResult.time_ms}ms</span>
              )}
              {judgeResult.error_message && (
                <span className="text-xs text-red-400 max-w-xs truncate">
                  {judgeResult.error_message}
                </span>
              )}
            </div>
          )}
          <div className="ml-auto flex gap-2">
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="bg-green-700 hover:bg-green-600 disabled:opacity-50 text-white font-semibold px-5 py-2 rounded-lg text-sm transition-colors"
            >
              {submitting ? "채점 중..." : "제출"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
