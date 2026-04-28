import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-server";
import { sql } from "@/lib/db";

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ detail: "인증이 필요합니다." }, { status: 401 });

  const result = await sql`
    SELECT id, username, email, role, rating, tier,
           streak_current, streak_max, solved_count, created_at
    FROM users WHERE id = ${user.sub}
  `;
  if (!result.rows[0]) return NextResponse.json({ detail: "유저를 찾을 수 없습니다." }, { status: 404 });

  return NextResponse.json(result.rows[0]);
}
