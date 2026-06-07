import { NextResponse } from "next/server";

import { getUserRecords, toPublicUser } from "@/lib/server/users";
import type { PublicUser } from "@/lib/types";

/**
 * GET /api/users
 * Returns all users WITHOUT passwords. Powers the "Authorized By" filter
 * dropdown and any place the UI needs the full roster.
 */
export async function GET(): Promise<NextResponse<PublicUser[]>> {
  const users = await getUserRecords();
  return NextResponse.json(users.map(toPublicUser));
}
