import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    const uResult = await sql`SELECT id FROM users WHERE username = ${params.username}`;
    const user = uResult.rows[0];
    if (!user) return NextResponse.json({ detail: "유저를 찾을 수 없습니다." }, { status: 404 });

    const result = await sql`
      SELECT
        TO_CHAR(submitted_at, 'YYYY-MM-DD') as date,
        COUNT(*) FILTER (WHERE status = 'accepted') as count
      FROM submissions
      WHERE user_id = ${user.id}
        AND submitted_at >= NOW() - INTERVAL '1 year'
      GROUP BY TO_CHAR(submitted_at, 'YYYY-MM-DD')
      ORDER BY date ASC
    `;

    return NextResponse.json(result.rows.map((r) => ({ date: r.date, count: Number(r.count) })));
  } catch (e: unknown) {
    console.error(e);
    return NextResponse.json({ detail: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
