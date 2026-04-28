import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-server";
import { sql } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ detail: "인증이 필요합니다." }, { status: 401 });

  try {
    const pResult = await sql`SELECT id FROM problems WHERE slug = ${params.slug}`;
    const problem = pResult.rows[0];
    if (!problem) return NextResponse.json({ detail: "문제를 찾을 수 없습니다." }, { status: 404 });

    const result = await sql`
      SELECT id, status, score, time_ms, submitted_at as created_at
      FROM submissions
      WHERE user_id = ${user.sub} AND problem_id = ${problem.id}
      ORDER BY submitted_at DESC
      LIMIT 20
    `;
    return NextResponse.json(result.rows);
  } catch (e: unknown) {
    console.error(e);
    return NextResponse.json({ detail: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
