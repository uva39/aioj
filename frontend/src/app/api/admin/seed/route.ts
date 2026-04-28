import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

const PROBLEMS = [
  {
    slug: "gradient-descent-linear",
    title: "경사하강법으로 선형회귀 구현하기",
    title_en: "Linear Regression via Gradient Descent",
    difficulty: "bronze",
    category: "linear_model",
    tags: ["선형회귀", "경사하강법", "최적화"],
    allowed_libs: ["numpy"],
    function_name: "gradient_descent",
    time_limit_sec: 10,
    memory_limit_mb: 256,
    partial_score: true,
    description: `## 문제\n\n행렬 $X \\in \\mathbb{R}^{n \\times d}$와 타겟 벡터 $y \\in \\mathbb{R}^n$가 주어질 때,\n**경사하강법(Gradient Descent)** 을 사용하여 선형회귀의 가중치 벡터 $w \\in \\mathbb{R}^d$를 학습하라.\n\n### 수식\n\n손실 함수 (MSE):\n$$L(w) = \\frac{1}{n} \\|Xw - y\\|^2$$\n\n그래디언트:\n$$\\nabla_w L = \\frac{2}{n} X^\\top (Xw - y)$$\n\n업데이트 규칙:\n$$w \\leftarrow w - \\alpha \\cdot \\nabla_w L$$\n\n여기서 $\\alpha$는 학습률(learning rate)이다.\n\n### 조건\n- 가중치 $w$는 **영벡터(0)로 초기화**한다.\n- \`sklearn\`, \`torch\` 등 ML 라이브러리 사용 **금지**. \`numpy\`만 사용할 것.\n\n### 함수 시그니처\n\n\`\`\`python\ndef gradient_descent(\n    X: np.ndarray,  # shape: (n, d)\n    y: np.ndarray,  # shape: (n,)\n    lr: float,      # 학습률\n    n_iter: int     # 반복 횟수\n) -> np.ndarray:    # shape: (d,) — 학습된 가중치 w\n    pass\n\`\`\`\n\n### 예제\n\n\`\`\`python\nX = np.array([[1, 1], [1, 2], [1, 3]])\ny = np.array([2.0, 3.0, 4.0])\nw = gradient_descent(X, y, lr=0.1, n_iter=1000)\n# w ≈ [1.0, 1.0]  (bias=1, slope=1)\n\`\`\`\n\n> **힌트**: \`X.T @ (X @ w - y)\` 로 그래디언트를 계산하라.`,
    function_signature: `import numpy as np\n\ndef gradient_descent(\n    X: np.ndarray,\n    y: np.ndarray,\n    lr: float,\n    n_iter: int\n) -> np.ndarray:\n    # 여기에 코드를 작성하세요\n    pass`,
    sample_test_cases: [
      {
        input_data: '{"X": [[1,1],[1,2],[1,3]], "y": [2.0, 3.0, 4.0], "lr": 0.1, "n_iter": 1000}',
        expected_output: '{"type": "ndarray", "data": [1.0, 1.0]}',
        is_sample: true,
        order_index: 0,
      },
    ],
  },
  {
    slug: "relu-forward-backward",
    title: "ReLU 순전파와 역전파 구현하기",
    title_en: "ReLU Forward and Backward Pass",
    difficulty: "silver",
    category: "activation",
    tags: ["활성화함수", "역전파", "딥러닝기초"],
    allowed_libs: ["numpy"],
    function_name: "relu_forward_backward",
    time_limit_sec: 5,
    memory_limit_mb: 256,
    partial_score: true,
    description: `## 문제\n\n**ReLU(Rectified Linear Unit)** 활성화 함수의 순전파(forward)와 역전파(backward)를 구현하라.\n\n### ReLU 정의\n\n$$\\text{ReLU}(x) = \\max(0, x)$$\n\n### 역전파 (Chain Rule)\n\n상위 레이어에서 넘어온 그래디언트 $dout$이 주어질 때:\n\n$$\\frac{\\partial L}{\\partial x_i} = \\begin{cases} dout_i & \\text{if } x_i > 0 \\\\ 0 & \\text{if } x_i \\leq 0 \\end{cases}$$\n\n### 예제\n\n\`\`\`python\nx    = np.array([-1.0, 0.0, 2.0, -0.5, 3.0])\ndout = np.array([ 1.0, 1.0, 1.0,  1.0, 1.0])\nout, dx = relu_forward_backward(x, dout)\n# out = [0.0, 0.0, 2.0, 0.0, 3.0]\n# dx  = [0.0, 0.0, 1.0, 0.0, 1.0]\n\`\`\``,
    function_signature: `import numpy as np\n\ndef relu_forward_backward(\n    x: np.ndarray,\n    dout: np.ndarray\n) -> tuple:\n    # 여기에 코드를 작성하세요\n    pass`,
    sample_test_cases: [
      {
        input_data: '{"x": [-1.0, 0.0, 2.0, -0.5, 3.0], "dout": [1.0, 1.0, 1.0, 1.0, 1.0]}',
        expected_output: '{"type": "list", "data": [{"type": "ndarray", "data": [0.0, 0.0, 2.0, 0.0, 3.0]}, {"type": "ndarray", "data": [0.0, 0.0, 1.0, 0.0, 1.0]}]}',
        is_sample: true,
        order_index: 0,
      },
    ],
  },
  {
    slug: "kmeans-clustering",
    title: "K-Means 클러스터링 구현하기",
    title_en: "K-Means Clustering from Scratch",
    difficulty: "silver",
    category: "clustering",
    tags: ["클러스터링", "K-Means", "비지도학습"],
    allowed_libs: ["numpy"],
    function_name: "kmeans",
    time_limit_sec: 15,
    memory_limit_mb: 256,
    partial_score: true,
    description: `## 문제\n\n데이터 행렬 $X \\in \\mathbb{R}^{n \\times d}$와 클러스터 수 $k$가 주어질 때,\n**K-Means 클러스터링** 알고리즘을 구현하라.\n\n### 알고리즘\n\n1. **초기화**: 주어진 \`initial_centers\`를 초기 중심으로 사용\n2. **할당**: 각 데이터 포인트를 가장 가까운 중심에 할당\n3. **업데이트**: 각 클러스터의 중심을 평균으로 갱신\n4. 수렴하거나 \`max_iter\`에 도달할 때까지 반복`,
    function_signature: `import numpy as np\n\ndef kmeans(\n    X: np.ndarray,\n    initial_centers: np.ndarray,\n    max_iter: int = 100\n) -> tuple:\n    # 여기에 코드를 작성하세요\n    pass`,
    sample_test_cases: [
      {
        input_data: '{"X": [[0,0],[1,0],[0,1],[10,10],[11,10],[10,11]], "initial_centers": [[0,0],[10,10]], "max_iter": 100}',
        expected_output: '{"type": "list", "data": [{"type": "ndarray", "data": [0,0,0,1,1,1]}, {"type": "ndarray", "data": [[0.3333, 0.3333],[10.3333, 10.3333]]}]}',
        is_sample: true,
        order_index: 0,
      },
    ],
  },
  {
    slug: "adam-optimizer",
    title: "Adam 옵티마이저 구현하기",
    title_en: "Adam Optimizer from Scratch",
    difficulty: "gold",
    category: "optimizer",
    tags: ["최적화", "Adam", "딥러닝기초"],
    allowed_libs: ["numpy"],
    function_name: "adam_step",
    time_limit_sec: 5,
    memory_limit_mb: 256,
    partial_score: true,
    description: `## 문제\n\n**Adam (Adaptive Moment Estimation)** 옵티마이저의 단일 업데이트 스텝을 구현하라.\n\n### 알고리즘\n\n1차 모멘트: $m_t = \\beta_1 m_{t-1} + (1 - \\beta_1) g_t$\n\n2차 모멘트: $v_t = \\beta_2 v_{t-1} + (1 - \\beta_2) g_t^2$\n\n편향 보정: $\\hat{m}_t = \\frac{m_t}{1 - \\beta_1^t}$, $\\hat{v}_t = \\frac{v_t}{1 - \\beta_2^t}$\n\n파라미터 업데이트: $\\theta_t = \\theta_{t-1} - \\alpha \\cdot \\frac{\\hat{m}_t}{\\sqrt{\\hat{v}_t} + \\epsilon}$`,
    function_signature: `import numpy as np\n\ndef adam_step(\n    theta: np.ndarray,\n    grad: np.ndarray,\n    m: np.ndarray,\n    v: np.ndarray,\n    t: int,\n    lr: float = 0.001,\n    beta1: float = 0.9,\n    beta2: float = 0.999,\n    eps: float = 1e-8\n) -> tuple:\n    # 여기에 코드를 작성하세요\n    pass`,
    sample_test_cases: [
      {
        input_data: '{"theta": [1.0, 2.0], "grad": [0.1, 0.2], "m": [0.0, 0.0], "v": [0.0, 0.0], "t": 1}',
        expected_output: '{"type": "list", "data": [{"type": "ndarray", "data": [0.999, 1.999]}, {"type": "ndarray", "data": [0.01, 0.02]}, {"type": "ndarray", "data": [0.00001, 0.00004]}]}',
        is_sample: true,
        order_index: 0,
      },
    ],
  },
  {
    slug: "softmax-cross-entropy",
    title: "Softmax + Cross-Entropy 순전파/역전파",
    title_en: "Softmax with Cross-Entropy Forward & Backward",
    difficulty: "gold",
    category: "loss_function",
    tags: ["손실함수", "Softmax", "Cross-Entropy", "역전파"],
    allowed_libs: ["numpy"],
    function_name: "softmax_cross_entropy",
    time_limit_sec: 5,
    memory_limit_mb: 256,
    partial_score: true,
    description: `## 문제\n\n로짓(logit) 행렬 $Z \\in \\mathbb{R}^{n \\times C}$와 정답 레이블 $y \\in \\mathbb{Z}^n$이 주어질 때,\n**Softmax Cross-Entropy Loss** 의 순전파 값과 역전파 그래디언트를 함께 구하라.\n\n$$L = -\\frac{1}{n} \\sum_{i=1}^{n} \\log \\hat{p}_{i, y_i}$$\n\n역전파: $\\frac{\\partial L}{\\partial z_{i,c}} = \\frac{1}{n}(\\hat{p}_{i,c} - \\mathbb{1}[c = y_i])$`,
    function_signature: `import numpy as np\n\ndef softmax_cross_entropy(\n    Z: np.ndarray,\n    y: np.ndarray\n) -> tuple:\n    # 여기에 코드를 작성하세요\n    pass`,
    sample_test_cases: [
      {
        input_data: '{"Z": [[2.0, 1.0, 0.1]], "y": [0]}',
        expected_output: '{"type": "list", "data": [{"type": "float", "data": 0.4076}, {"type": "ndarray", "data": [[-0.3449, 0.2119, 0.1330]]}]}',
        is_sample: true,
        order_index: 0,
      },
    ],
  },
  {
    slug: "pca-from-scratch",
    title: "PCA (주성분 분석) 구현하기",
    title_en: "PCA (Principal Component Analysis) from Scratch",
    difficulty: "silver",
    category: "dimensionality_reduction",
    tags: ["PCA", "차원축소", "SVD", "공분산행렬"],
    allowed_libs: ["numpy"],
    function_name: "pca_transform",
    time_limit_sec: 10,
    memory_limit_mb: 256,
    partial_score: true,
    description: `## 문제\n\n데이터 행렬 $X \\in \\mathbb{R}^{n \\times d}$와 목표 차원 $k$가 주어질 때,\n**PCA (Principal Component Analysis)** 를 사용하여 $k$차원으로 투영된 결과를 반환하라.\n\n### 알고리즘\n\n1. 중심화: $\\tilde{X} = X - \\bar{X}$\n2. 공분산 행렬: $C = \\frac{1}{n-1} \\tilde{X}^\\top \\tilde{X}$\n3. 고유값 분해 (고유값 내림차순 정렬)\n4. 투영: $Z = \\tilde{X} V_k$`,
    function_signature: `import numpy as np\n\ndef pca_transform(\n    X: np.ndarray,\n    k: int\n) -> np.ndarray:\n    # 여기에 코드를 작성하세요\n    pass`,
    sample_test_cases: [
      {
        input_data: '{"X": [[2.5, 2.4], [0.5, 0.7], [2.2, 2.9], [1.9, 2.2], [3.1, 3.0]], "k": 1}',
        expected_output: '{"type": "ndarray", "data": [[0.8280], [-1.7776], [0.9922], [0.2742], [0.6832]]}',
        is_sample: true,
        order_index: 0,
      },
    ],
  },
];

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-admin-secret");
  if (secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }

  try {
    const inserted: string[] = [];

    for (const p of PROBLEMS) {
      // 이미 존재하면 스킵
      const exists = await sql`SELECT id FROM problems WHERE slug = ${p.slug}`;
      if (exists.rows.length > 0) {
        inserted.push(`SKIP: ${p.slug}`);
        continue;
      }

      const tagsLiteral = `{${p.tags.map((t) => `"${t}"`).join(",")}}`;
      const libsLiteral = `{${p.allowed_libs.map((l) => `"${l}"`).join(",")}}`;

      const pResult = await sql`
        INSERT INTO problems (
          slug, title, title_en, description, function_signature, function_name,
          difficulty, category, tags, allowed_libs,
          time_limit_sec, memory_limit_mb, partial_score
        ) VALUES (
          ${p.slug}, ${p.title}, ${p.title_en}, ${p.description},
          ${p.function_signature}, ${p.function_name},
          ${p.difficulty}, ${p.category}, ${tagsLiteral}::text[], ${libsLiteral}::text[],
          ${p.time_limit_sec}, ${p.memory_limit_mb}, ${p.partial_score}
        )
        RETURNING id
      `;
      const problemId = pResult.rows[0].id;

      for (const tc of p.sample_test_cases) {
        await sql`
          INSERT INTO test_cases (problem_id, input_data, expected_output, is_sample, order_index)
          VALUES (${problemId}, ${tc.input_data}, ${tc.expected_output}, ${tc.is_sample}, ${tc.order_index})
        `;
      }

      inserted.push(`OK: ${p.slug}`);
    }

    return NextResponse.json({ results: inserted });
  } catch (e: unknown) {
    console.error(e);
    return NextResponse.json({ detail: String(e) }, { status: 500 });
  }
}
