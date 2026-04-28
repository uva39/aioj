import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { sql } from "@/lib/db";
import { signAccessToken, signRefreshToken } from "@/lib/auth-server";

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ detail: "유저명과 비밀번호를 입력하세요." }, { status: 422 });
    }

    const result = await sql`
      SELECT id, username, email, password_hash, role
      FROM users WHERE username = ${username}
    `;
    const user = result.rows[0];

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return NextResponse.json({ detail: "유저명 또는 비밀번호가 올바르지 않습니다." }, { status: 401 });
    }

    const payload = { sub: user.id, username: user.username, role: user.role };
    const access_token = await signAccessToken(payload);
    const refresh_token = await signRefreshToken(payload);

    return NextResponse.json({ access_token, refresh_token });
  } catch (e: unknown) {
    console.error(e);
    return NextResponse.json({ detail: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
