import { NextRequest, NextResponse } from "next/server";
import { verifyToken, signAccessToken, signRefreshToken } from "@/lib/auth-server";

export async function POST(req: NextRequest) {
  try {
    const { refresh_token } = await req.json();
    if (!refresh_token) {
      return NextResponse.json({ detail: "refresh_token이 필요합니다." }, { status: 422 });
    }

    const payload = await verifyToken(refresh_token);
    const newPayload = { sub: payload.sub, username: payload.username, role: payload.role };
    const access_token = await signAccessToken(newPayload);
    const new_refresh_token = await signRefreshToken(newPayload);

    return NextResponse.json({ access_token, refresh_token: new_refresh_token });
  } catch {
    return NextResponse.json({ detail: "유효하지 않은 토큰입니다." }, { status: 401 });
  }
}
