import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { sql } from "@/lib/db";
import { signAccessToken, signRefreshToken } from "@/lib/auth-server";

export async function POST(req: NextRequest) {
  try {
    const { username, email, password } = await req.json();

    if (!username || !email || !password) {
      return NextResponse.json({ detail: "모든 필드를 입력하세요." }, { status: 422 });
    }
    if (username.length < 3 || username.length > 30) {
      return NextResponse.json({ detail: "유저명은 3~30자여야 합니다." }, { status: 422 });
    }
    if (password.length < 8) {
      return NextResponse.json({ detail: "비밀번호는 8자 이상이어야 합니다." }, { status: 422 });
    }

    const existing = await sql`
      SELECT id FROM users WHERE username = ${username} OR email = ${email}
    `;
    if (existing.rows.length > 0) {
      return NextResponse.json({ detail: "이미 사용 중인 유저명 또는 이메일입니다." }, { status: 409 });
    }

    const password_hash = await bcrypt.hash(password, 12);
    const result = await sql`
      INSERT INTO users (username, email, password_hash)
      VALUES (${username}, ${email}, ${password_hash})
      RETURNING id, username, role
    `;
    const user = result.rows[0];

    const payload = { sub: user.id, username: user.username, role: user.role };
    const access_token = await signAccessToken(payload);
    const refresh_token = await signRefreshToken(payload);

    return NextResponse.json({ access_token, refresh_token }, { status: 201 });
  } catch (e: unknown) {
    console.error(e);
    return NextResponse.json({ detail: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
