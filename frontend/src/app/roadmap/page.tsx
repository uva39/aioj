import Link from "next/link";

const COURSES = [
  {
    id: "beginner",
    title: "입문 코스",
    subtitle: "ML 구현 첫걸음",
    duration: "2주",
    color: "#ad5600",
    tier: "Bronze",
    steps: [
      { title: "선형회귀 (정규방정식)", slug: "linear-regression-normal-equation", done: false },
      { title: "경사하강법", slug: "gradient-descent-linear-regression", done: false },
      { title: "로지스틱 회귀", slug: "logistic-regression", done: false },
      { title: "소프트맥스", slug: "softmax", done: false },
      { title: "2-Layer 신경망", slug: "two-layer-nn", done: false },
    ],
  },
  {
    id: "tree",
    title: "중급 코스",
    subtitle: "트리와 앙상블",
    duration: "3주",
    color: "#435f7a",
    tier: "Silver",
    steps: [
      { title: "결정 트리", slug: "decision-tree", done: false },
      { title: "랜덤 포레스트", slug: "random-forest", done: false },
      { title: "그래디언트 부스팅", slug: "gradient-boosting", done: false },
    ],
  },
  {
    id: "backprop",
    title: "딥러닝 코스",
    subtitle: "Backprop 마스터",
    duration: "4주",
    color: "#ec9a00",
    tier: "Gold",
    steps: [
      { title: "순전파", slug: "forward-pass", done: false },
      { title: "역전파", slug: "backpropagation", done: false },
      { title: "활성화 함수 미분", slug: "activation-derivatives", done: false },
      { title: "Batch Normalization", slug: "batch-normalization", done: false },
      { title: "Adam 옵티마이저", slug: "adam-optimizer", done: false },
    ],
  },
  {
    id: "attention",
    title: "어텐션 코스",
    subtitle: "Transformer 밑바닥 구현",
    duration: "4주",
    color: "#27e2a4",
    tier: "Platinum",
    steps: [
      { title: "Scaled Dot-Product Attention", slug: "scaled-dot-product-attention", done: false },
      { title: "Multi-head Attention", slug: "multi-head-attention", done: false },
      { title: "Positional Encoding", slug: "positional-encoding", done: false },
      { title: "Transformer 블록", slug: "transformer-block", done: false },
    ],
  },
];

export default function RoadmapPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-white mb-2">학습 경로</h1>
      <p className="text-gray-400 mb-8">
        선형회귀부터 Transformer까지, 체계적인 커리큘럼으로 단계별 성장하세요.
      </p>

      <div className="space-y-8">
        {COURSES.map((course) => (
          <div
            key={course.id}
            className="bg-gray-900 border rounded-xl overflow-hidden"
            style={{ borderColor: `${course.color}40` }}
          >
            {/* 코스 헤더 */}
            <div
              className="px-6 py-4 border-b flex items-center gap-4"
              style={{
                borderColor: `${course.color}30`,
                background: `${course.color}10`,
              }}
            >
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-bold text-white">{course.title}</h2>
                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded"
                    style={{
                      color: course.color,
                      border: `1px solid ${course.color}`,
                      background: `${course.color}15`,
                    }}
                  >
                    {course.tier}
                  </span>
                </div>
                <p className="text-sm text-gray-400 mt-0.5">{course.subtitle}</p>
              </div>
              <div className="text-sm text-gray-500">{course.duration}</div>
            </div>

            {/* 스텝 목록 */}
            <div className="divide-y divide-gray-800">
              {course.steps.map((step, i) => (
                <Link
                  key={step.slug}
                  href={`/problems/${step.slug}`}
                  className="flex items-center gap-4 px-6 py-3 hover:bg-gray-800/50 transition-colors group"
                >
                  {/* 스텝 번호 */}
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                    style={{
                      background: step.done ? course.color : "#374151",
                      color: step.done ? "#fff" : "#9ca3af",
                    }}
                  >
                    {step.done ? "✓" : i + 1}
                  </div>
                  <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
                    {step.title}
                  </span>
                  <span className="ml-auto text-gray-600 group-hover:text-gray-400 text-xs transition-colors">
                    →
                  </span>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
