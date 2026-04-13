import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* 히어로 섹션 */}
      <section className="flex flex-col items-center justify-center text-center py-24 px-4 bg-gradient-to-b from-gray-900 to-gray-950">
        <div className="inline-flex items-center gap-2 bg-blue-900/40 border border-blue-700/50 text-blue-300 text-sm px-4 py-1.5 rounded-full mb-6">
          <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
          numpy-only 채점 · 즉각 피드백
        </div>
        <h1 className="text-5xl md:text-6xl font-black text-white leading-tight mb-4">
          AI/ML을 직접 구현하고
          <br />
          <span className="text-blue-400">채점받으세요</span>
        </h1>
        <p className="text-lg text-gray-400 max-w-xl mb-8">
          sklearn 한 줄이 아닌, 직접 짠 gradient descent가 통과해야 AC.
          <br />
          선형회귀부터 Transformer까지, 구현이 곧 실력입니다.
        </p>
        <div className="flex gap-3">
          <Link
            href="/problems"
            className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
          >
            문제 풀기
          </Link>
          <Link
            href="/roadmap"
            className="bg-gray-800 hover:bg-gray-700 text-gray-200 font-semibold px-6 py-3 rounded-lg transition-colors"
          >
            학습 경로 보기
          </Link>
        </div>
      </section>

      {/* 특징 카드 */}
      <section className="max-w-5xl mx-auto w-full px-4 py-16 grid md:grid-cols-3 gap-6">
        {FEATURES.map((f) => (
          <div
            key={f.title}
            className="bg-gray-900 border border-gray-800 rounded-xl p-6"
          >
            <div className="text-3xl mb-3">{f.icon}</div>
            <h3 className="text-white font-bold mb-2">{f.title}</h3>
            <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </section>

      {/* 채점 결과 예시 */}
      <section className="max-w-5xl mx-auto w-full px-4 pb-16">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">어떻게 채점되나요?</h2>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 font-mono text-sm space-y-2">
          {VERDICT_EXAMPLES.map((v) => (
            <div key={v.label} className="flex items-center gap-3">
              <span
                className="w-16 text-right font-bold text-sm"
                style={{ color: v.color }}
              >
                {v.label}
              </span>
              <span className="text-gray-400">{v.desc}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 티어 시스템 */}
      <section className="max-w-5xl mx-auto w-full px-4 pb-20">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">티어 시스템</h2>
        <div className="flex flex-wrap justify-center gap-3">
          {TIERS.map((t) => (
            <div
              key={t.name}
              className="flex flex-col items-center gap-1 px-5 py-3 rounded-xl border"
              style={{
                borderColor: `${t.color}40`,
                background: `${t.color}10`,
              }}
            >
              <span className="font-bold" style={{ color: t.color }}>
                {t.name}
              </span>
              <span className="text-xs text-gray-400">{t.desc}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

const FEATURES = [
  {
    icon: "⚡",
    title: "즉각적인 채점",
    desc: "코드 제출 후 수 초 내 채점 결과 반환. 맞았는지 틀렸는지 바로 확인하세요.",
  },
  {
    icon: "🔒",
    title: "numpy-only 강제",
    desc: "sklearn, PyTorch 등 고수준 라이브러리 사용 시 IE(Illegal Import)로 즉시 차단.",
  },
  {
    icon: "📈",
    title: "티어 & 레이팅",
    desc: "Iron부터 Ruby까지. 카테고리별 세부 레이팅으로 내 약점을 파악하세요.",
  },
  {
    icon: "🏆",
    title: "오픈 챌린지",
    desc: "월간 챌린지, 스피드 라운드로 다른 사람들과 실력을 겨뤄보세요.",
  },
  {
    icon: "🔥",
    title: "스트릭 & 뱃지",
    desc: "하루 1문제 AC 스트릭. 카테고리 마스터 뱃지로 학습 동기를 유지하세요.",
  },
  {
    icon: "📚",
    title: "학습 경로",
    desc: "선형회귀부터 Transformer까지 체계적인 커리큘럼으로 단계별 성장.",
  },
];

const VERDICT_EXAMPLES = [
  { label: "AC", color: "#00c853", desc: "Accepted — 정답. 모든 테스트케이스 통과" },
  { label: "WA", color: "#ef5350", desc: "Wrong Answer — 수치 오차 초과 또는 오답" },
  { label: "TLE", color: "#ffa726", desc: "Time Limit Exceeded — for 루프로 짜면 TLE, 벡터화(@ 연산)로 짜면 AC" },
  { label: "IE", color: "#ab47bc", desc: "Illegal Import — sklearn, torch 등 금지 라이브러리 감지" },
  { label: "RE", color: "#ef9a9a", desc: "Runtime Error — 실행 중 예외 발생" },
];

const TIERS = [
  { name: "Iron", color: "#818181", desc: "입문" },
  { name: "Bronze", color: "#ad5600", desc: "기초 ML" },
  { name: "Silver", color: "#435f7a", desc: "중급 ML" },
  { name: "Gold", color: "#ec9a00", desc: "딥러닝 기초" },
  { name: "Platinum", color: "#27e2a4", desc: "딥러닝 심화" },
  { name: "Diamond", color: "#00b4fc", desc: "고급 이론" },
  { name: "Ruby", color: "#ff0062", desc: "논문 수준" },
];
