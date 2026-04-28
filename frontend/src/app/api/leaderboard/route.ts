import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tier = searchParams.get("tier");
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
    const limit = 50;
    const offset = (page - 1) * limit;

    let result;
    if (tier) {
      result = await sql`
        SELECT
          ROW_NUMBER() OVER (ORDER BY rating DESC, solved_count DESC) as rank,
          username, tier, rating, solved_count
        FROM users
        WHERE tier = ${tier}
        ORDER BY rating DESC, solved_count DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
    } else {
      result = await sql`
        SELECT
          ROW_NUMBER() OVER (ORDER BY rating DESC, solved_count DESC) as rank,
          username, tier, rating, solved_count
        FROM users
        ORDER BY rating DESC, solved_count DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
    }

    return NextResponse.json(result.rows);
  } catch (e: unknown) {
    console.error(e);
    return NextResponse.json({ detail: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
