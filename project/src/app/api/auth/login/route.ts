import { NextResponse } from "next/server";

import type { ApiError, LoginRequest, LoginResponse } from "@/lib/types";
import { authenticate } from "@/lib/server/users";

/**
 * POST /api/auth/login
 * Body: { email, password }
 * Returns the public user (never the password) on success, 401 otherwise.
 */
export async function POST(
  request: Request,
): Promise<NextResponse<LoginResponse | ApiError>> {
  let body: Partial<LoginRequest>;
  try {
    body = (await request.json()) as Partial<LoginRequest>;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { email, password } = body;
  if (typeof email !== "string" || typeof password !== "string") {
    return NextResponse.json(
      { error: "Email and password are required." },
      { status: 400 },
    );
  }

  const user = await authenticate(email, password);
  if (!user) {
    return NextResponse.json(
      { error: "Invalid email or password." },
      { status: 401 },
    );
  }

  return NextResponse.json({ user });
}
