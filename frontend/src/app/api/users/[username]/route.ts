import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    const result = await sql`
      SELECT id, username, tier, rating, solved_count,
             streak_current, streak_max, created_at
      FROM users WHERE username = ${params.username}
    `;
    if (!result.rows[0]) return NextResponse.json({ detail: "유저를 찾을 수 없습니다." }, { status: 404 });
    return NextResponse.json(result.rows[0]);
  } catch (e: unknown) {
    console.error(e);
    return NextResponse.json({ detail: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
