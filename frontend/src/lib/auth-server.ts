import { SignJWT, jwtVerify } from "jose";
import { NextRequest } from "next/server";

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || "dev-secret-change-in-production"
);

export async function signAccessToken(payload: Record<string, unknown>) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("30m")
    .sign(secret);
}

export async function signRefreshToken(payload: Record<string, unknown>) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(secret);
}

export async function verifyToken(token: string) {
  const { payload } = await jwtVerify(token, secret);
  return payload as { sub: string; username: string; role: string };
}

export async function getAuthUser(req: NextRequest) {
  const header = req.headers.get("authorization") ?? "";
  const token = header.replace("Bearer ", "");
  if (!token) return null;
  try {
    return await verifyToken(token);
  } catch {
    return null;
  }
}
