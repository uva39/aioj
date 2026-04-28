import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-server";
import { sql } from "@/lib/db";

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ detail: "인증이 필요합니다." }, { status: 401 });

  try {
    const { problem_id, code } = await req.json();
    if (!problem_id || !code) {
      return NextResponse.json({ detail: "problem_id와 code가 필요합니다." }, { status: 422 });
    }

    const pResult = await sql`
      SELECT id FROM problems WHERE id = ${problem_id} AND is_public = true
    `;
    if (!pResult.rows[0]) {
      return NextResponse.json({ detail: "문제를 찾을 수 없습니다." }, { status: 404 });
    }

    // 제출 카운트 증가
    await sql`UPDATE problems SET submission_count = submission_count + 1 WHERE id = ${problem_id}`;

    const result = await sql`
      INSERT INTO submissions (user_id, problem_id, code, status)
      VALUES (${user.sub}, ${problem_id}, ${code}, 'pending')
      RETURNING id, status, score, time_ms, memory_kb, error_message, submitted_at as created_at
    `;
    return NextResponse.json(result.rows[0], { status: 202 });
  } catch (e: unknown) {
    console.error(e);
    return NextResponse.json({ detail: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
