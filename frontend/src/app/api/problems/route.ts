import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const difficulty = searchParams.get("difficulty");
    const tag = searchParams.get("tag");
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
    const limit = 20;
    const offset = (page - 1) * limit;

    // 조건 동적 조합
    let rows;
    if (category && difficulty) {
      rows = await sql`
        SELECT id, slug, title, difficulty, category, tags, ac_count, submission_count
        FROM problems
        WHERE is_public = true AND category = ${category} AND difficulty = ${difficulty}
        ORDER BY created_at ASC
        LIMIT ${limit} OFFSET ${offset}
      `;
    } else if (category) {
      rows = await sql`
        SELECT id, slug, title, difficulty, category, tags, ac_count, submission_count
        FROM problems
        WHERE is_public = true AND category = ${category}
        ORDER BY created_at ASC
        LIMIT ${limit} OFFSET ${offset}
      `;
    } else if (difficulty) {
      rows = await sql`
        SELECT id, slug, title, difficulty, category, tags, ac_count, submission_count
        FROM problems
        WHERE is_public = true AND difficulty = ${difficulty}
        ORDER BY created_at ASC
        LIMIT ${limit} OFFSET ${offset}
      `;
    } else if (tag) {
      rows = await sql`
        SELECT id, slug, title, difficulty, category, tags, ac_count, submission_count
        FROM problems
        WHERE is_public = true AND ${tag} = ANY(tags)
        ORDER BY created_at ASC
        LIMIT ${limit} OFFSET ${offset}
      `;
    } else {
      rows = await sql`
        SELECT id, slug, title, difficulty, category, tags, ac_count, submission_count
        FROM problems
        WHERE is_public = true
        ORDER BY created_at ASC
        LIMIT ${limit} OFFSET ${offset}
      `;
    }

    return NextResponse.json(rows.rows);
  } catch (e: unknown) {
    console.error(e);
    return NextResponse.json({ detail: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
