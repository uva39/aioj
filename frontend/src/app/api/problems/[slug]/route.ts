import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const result = await sql`
      SELECT id, slug, title, title_en, description, function_signature,
             function_name, difficulty, category, tags, allowed_libs,
             time_limit_sec, memory_limit_mb, partial_score, ac_count, submission_count
      FROM problems
      WHERE slug = ${params.slug} AND is_public = true
    `;
    const problem = result.rows[0];
    if (!problem) return NextResponse.json({ detail: "문제를 찾을 수 없습니다." }, { status: 404 });

    const tcResult = await sql`
      SELECT id, input_data, expected_output, order_index
      FROM test_cases
      WHERE problem_id = ${problem.id} AND is_sample = true
      ORDER BY order_index ASC
    `;

    return NextResponse.json({
      ...problem,
      sample_test_cases: tcResult.rows,
    });
  } catch (e: unknown) {
    console.error(e);
    return NextResponse.json({ detail: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
