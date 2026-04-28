import { sql } from "@vercel/postgres";
export { sql };

export async function initDb() {
  await sql`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`;

  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      username VARCHAR(50) UNIQUE NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      role VARCHAR(20) NOT NULL DEFAULT 'user',
      rating INTEGER NOT NULL DEFAULT 0,
      tier VARCHAR(20) NOT NULL DEFAULT 'iron',
      streak_current INTEGER NOT NULL DEFAULT 0,
      streak_max INTEGER NOT NULL DEFAULT 0,
      solved_count INTEGER NOT NULL DEFAULT 0,
      last_solved_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS problems (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      slug VARCHAR(100) UNIQUE NOT NULL,
      title VARCHAR(255) NOT NULL,
      title_en VARCHAR(255),
      description TEXT NOT NULL,
      function_signature TEXT NOT NULL DEFAULT '',
      function_name VARCHAR(100) NOT NULL DEFAULT '',
      difficulty VARCHAR(20) NOT NULL,
      category VARCHAR(100) NOT NULL,
      tags TEXT[] NOT NULL DEFAULT '{}',
      allowed_libs TEXT[] NOT NULL DEFAULT '{numpy}',
      time_limit_sec INTEGER NOT NULL DEFAULT 10,
      memory_limit_mb INTEGER NOT NULL DEFAULT 512,
      partial_score BOOLEAN NOT NULL DEFAULT true,
      is_public BOOLEAN NOT NULL DEFAULT true,
      ac_count INTEGER NOT NULL DEFAULT 0,
      submission_count INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS test_cases (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      problem_id UUID NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
      input_data TEXT NOT NULL,
      expected_output TEXT NOT NULL,
      is_sample BOOLEAN NOT NULL DEFAULT false,
      score_weight REAL NOT NULL DEFAULT 1.0,
      order_index INTEGER NOT NULL DEFAULT 0
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS submissions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id),
      problem_id UUID NOT NULL REFERENCES problems(id),
      code TEXT NOT NULL,
      status VARCHAR(20) NOT NULL DEFAULT 'pending',
      score INTEGER NOT NULL DEFAULT 0,
      time_ms INTEGER,
      memory_kb INTEGER,
      error_message TEXT,
      test_results JSONB,
      is_visible BOOLEAN NOT NULL DEFAULT false,
      submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS idx_submissions_user ON submissions(user_id)
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS idx_submissions_problem ON submissions(problem_id)
  `;
}
