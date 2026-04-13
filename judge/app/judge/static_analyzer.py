"""
AST 기반 정적 분석기.
제출 코드에서 금지 라이브러리 import를 감지한다.
"""
import ast

# 금지 라이브러리 목록
BANNED_MODULES = {
    # ML/DL 프레임워크
    "sklearn", "scikit_learn",
    "torch", "torchvision", "torchaudio",
    "tensorflow", "tf",
    "keras",
    "jax", "flax", "optax",
    # Gradient boosting
    "xgboost", "lightgbm", "catboost",
    # 통계
    "statsmodels",
    # AutoML
    "autosklearn", "auto_sklearn", "h2o", "pycaret",
    # 기타 ML
    "transformers", "sentence_transformers",
    "cv2", "PIL",  # 이미지 처리 (문제에서 별도 허용 가능)
}


class ImportVisitor(ast.NodeVisitor):
    def __init__(self):
        self.violations: list[str] = []

    def visit_Import(self, node: ast.Import):
        for alias in node.names:
            base = alias.name.split(".")[0]
            if base in BANNED_MODULES:
                self.violations.append(f"금지된 라이브러리: import {alias.name} (line {node.lineno})")
        self.generic_visit(node)

    def visit_ImportFrom(self, node: ast.ImportFrom):
        if node.module:
            base = node.module.split(".")[0]
            if base in BANNED_MODULES:
                self.violations.append(f"금지된 라이브러리: from {node.module} import ... (line {node.lineno})")
        self.generic_visit(node)

    def visit_Call(self, node: ast.Call):
        """__import__('sklearn') 형태의 동적 import 감지."""
        if isinstance(node.func, ast.Name) and node.func.id == "__import__":
            if node.args and isinstance(node.args[0], ast.Constant):
                base = str(node.args[0].value).split(".")[0]
                if base in BANNED_MODULES:
                    self.violations.append(
                        f"금지된 라이브러리 동적 import: __import__('{node.args[0].value}') (line {node.lineno})"
                    )
        self.generic_visit(node)


def analyze(code: str) -> list[str]:
    """
    코드를 분석하여 금지 라이브러리 목록 반환.
    빈 리스트 = 문제 없음.
    """
    try:
        tree = ast.parse(code)
    except SyntaxError as e:
        return [f"문법 오류: {e}"]

    visitor = ImportVisitor()
    visitor.visit(tree)
    return visitor.violations
