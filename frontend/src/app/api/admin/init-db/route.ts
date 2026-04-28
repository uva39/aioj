import { NextRequest, NextResponse } from "next/server";
import { initDb } from "@/lib/db";

// ADMIN_SECRET 헤더로 보호
export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-admin-secret");
  if (secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }

  try {
    await initDb();
    return NextResponse.json({ message: "DB 초기화 완료" });
  } catch (e: unknown) {
    console.error(e);
    return NextResponse.json({ detail: String(e) }, { status: 500 });
  }
}
