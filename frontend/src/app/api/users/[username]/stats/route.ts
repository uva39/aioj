import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    const uResult = await sql`
      SELECT id, username, tier, rating, solved_count, streak_current, streak_max
      FROM users WHERE username = ${params.username}
    `;
    const user = uResult.rows[0];
    if (!user) return NextResponse.json({ detail: "유저를 찾을 수 없습니다." }, { status: 404 });

    // 카테고리별 통계
    const catResult = await sql`
      SELECT p.category,
             COUNT(DISTINCT s.id) FILTER (WHERE s.status = 'accepted') as solved_count,
             COALESCE(SUM(DISTINCT p.ac_count), 0) as rating
      FROM submissions s
      JOIN problems p ON s.problem_id = p.id
      WHERE s.user_id = ${user.id} AND s.status = 'accepted'
      GROUP BY p.category
    `;

    return NextResponse.json({
      ...user,
      category_ratings: catResult.rows.map((r) => ({
        category: r.category,
        rating: Number(r.rating),
        solved_count: Number(r.solved_count),
      })),
    });
  } catch (e: unknown) {
    console.error(e);
    return NextResponse.json({ detail: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
