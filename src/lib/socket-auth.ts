/** Fetch JWT for Socket.IO (httpOnly cookie is same-origin via /backend proxy). */
export async function getSocketAuthToken(): Promise<string | null> {
  try {
    const res = await fetch("/api/socket-token", {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { token?: string };
    return data.token || null;
  } catch {
    return null;
  }
}
