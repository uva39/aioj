import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-server";
import { sql } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ detail: "인증이 필요합니다." }, { status: 401 });

  try {
    const result = await sql`
      SELECT id, user_id, problem_id, code, status, score,
             time_ms, memory_kb, error_message, test_results, submitted_at as created_at
      FROM submissions WHERE id = ${params.id}
    `;
    const sub = result.rows[0];
    if (!sub) return NextResponse.json({ detail: "제출을 찾을 수 없습니다." }, { status: 404 });
    if (sub.user_id !== user.sub && user.role !== "admin") {
      return NextResponse.json({ detail: "권한이 없습니다." }, { status: 403 });
    }
    return NextResponse.json(sub);
  } catch (e: unknown) {
    console.error(e);
    return NextResponse.json({ detail: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
