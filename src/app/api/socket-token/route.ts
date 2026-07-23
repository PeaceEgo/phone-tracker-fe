import { cookies } from "next/headers";
import { NextResponse } from "next/server";

/**
 * Expose the httpOnly access_token to the client solely for Socket.IO auth.
 * HTTP API calls keep using first-party cookies via the /backend proxy.
 */
export async function GET() {
  const jar = await cookies();
  const token = jar.get("access_token")?.value;

  if (!token) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  return NextResponse.json({ token });
}
