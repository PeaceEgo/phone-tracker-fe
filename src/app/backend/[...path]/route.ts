import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BACKEND = (
  process.env.BACKEND_URL ||
  "https://phone-tracker-be.onrender.com"
).replace(/\/$/, "");

type RouteContext = { params: Promise<{ path: string[] }> };

/**
 * Rewrite upstream Set-Cookie so the browser stores cookies on the FE host
 * (first-party). SameSite=None cross-site cookies are blocked on many phones.
 */
function rewriteSetCookie(raw: string, request: NextRequest): string {
  let cookie = raw
    .replace(/;\s*Domain=[^;]*/gi, "")
    .replace(/;\s*SameSite=[^;]*/gi, "")
    .replace(/;\s*Secure/gi, "")
    .replace(/;\s*Path=[^;]*/gi, "");

  // Always root path so /backend/api and /api/socket-token both receive cookies
  cookie += "; Path=/; SameSite=Lax";

  // Only mark Secure on real HTTPS. Adding Secure on http://localhost
  // breaks cookies in some mobile browsers / tunnels.
  const isHttps =
    request.nextUrl.protocol === "https:" ||
    request.headers.get("x-forwarded-proto") === "https";

  if (isHttps) {
    cookie += "; Secure";
  }

  return cookie;
}

async function proxyRequest(request: NextRequest, path: string[]) {
  const targetPath = path.join("/");
  const targetUrl = `${BACKEND}/${targetPath}${request.nextUrl.search}`;

  const headers = new Headers();
  const incomingCookie = request.headers.get("cookie");
  if (incomingCookie) headers.set("cookie", incomingCookie);

  const contentType = request.headers.get("content-type");
  if (contentType) headers.set("content-type", contentType);

  const accept = request.headers.get("accept");
  if (accept) headers.set("accept", accept);

  const init: RequestInit = {
    method: request.method,
    headers,
    redirect: "manual",
  };

  if (request.method !== "GET" && request.method !== "HEAD") {
    init.body = await request.arrayBuffer();
  }

  const upstream = await fetch(targetUrl, init);

  const responseHeaders = new Headers();
  const passThrough = ["content-type", "cache-control", "content-length"];
  for (const key of passThrough) {
    const value = upstream.headers.get(key);
    if (value) responseHeaders.set(key, value);
  }

  const response = new NextResponse(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: responseHeaders,
  });

  const rawCookies =
    typeof upstream.headers.getSetCookie === "function"
      ? upstream.headers.getSetCookie()
      : [];

  if (rawCookies.length > 0) {
    for (const raw of rawCookies) {
      response.headers.append("set-cookie", rewriteSetCookie(raw, request));
    }
  } else {
    const single = upstream.headers.get("set-cookie");
    if (single) {
      response.headers.append("set-cookie", rewriteSetCookie(single, request));
    }
  }

  return response;
}

export async function GET(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return proxyRequest(request, path);
}

export async function POST(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return proxyRequest(request, path);
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return proxyRequest(request, path);
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return proxyRequest(request, path);
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return proxyRequest(request, path);
}

export async function OPTIONS(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return proxyRequest(request, path);
}
