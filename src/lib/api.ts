// lib/api.ts

export interface AuthResponse {
  message: string;
  user: {
    id: string;
    email: string;
    fullName: string;
  };
}

export interface EmailVerificationResponse {
  message: string;
  user?: {
    id: string;
    email: string;
    fullName: string;
    isVerified: boolean;
  };
  token?: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL!;
const apiUrl = (path: string) => `${API_BASE}${path}`;

const AUTH_PAGES = [
  "/auth/login",
  "/auth/signup",
  "/auth/verify-email",
  "/auth/forgot-password",
  "/auth/reset-password",
];

function isOnAuthPage() {
  if (typeof window === "undefined") return false;
  return AUTH_PAGES.some((path) => window.location.pathname.startsWith(path));
}

function isLinkDevicePage() {
  if (typeof window === "undefined") return false;
  return window.location.pathname.startsWith("/link-device");
}

async function fetchWithCreds(input: RequestInfo, init: RequestInit = {}) {
  const headers = new Headers(init.headers || {});

  if (!headers.has("Content-Type") && init.body && typeof init.body === "string") {
    headers.set("Content-Type", "application/json");
  }

  return fetch(input, {
    ...init,
    credentials: "include",
    headers,
  });
}

async function clearSessionAndRedirect(options?: { redirect?: boolean }) {
  if (typeof window === "undefined") return;

  try {
    const { useAuthStore } = await import("@/store/auth");
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      needsVerification: false,
      verificationEmail: null,
      verificationSuccess: false,
    });
  } catch {
    // ignore store errors during teardown
  }

  const shouldRedirect = options?.redirect !== false;
  // Never hard-reload auth/link-device pages — that causes login↔link loops
  if (shouldRedirect && !isOnAuthPage() && !isLinkDevicePage()) {
    const next = `${window.location.pathname}${window.location.search}`;
    window.location.href = `/auth/login?next=${encodeURIComponent(next)}`;
  }
}

type AutoRefreshOptions = {
  /** When false, 401 clears local session but does not navigate away */
  redirectOnAuthFailure?: boolean;
};

/** Authenticated fetch: retries once after refresh on 401. */
export async function fetchWithAutoRefresh(
  input: string,
  init?: RequestInit,
  options?: AutoRefreshOptions
) {
  const redirectOnAuthFailure = options?.redirectOnAuthFailure !== false;
  let response = await fetchWithCreds(input, init);

  const isRefreshRequest = input.includes("/auth/refresh");

  if (response.status === 401 && !isRefreshRequest) {
    try {
      const refreshResponse = await fetchWithCreds(apiUrl("/auth/refresh"), {
        method: "POST",
      });

      if (refreshResponse.ok) {
        response = await fetchWithCreds(input, init);

        if (response.status === 401) {
          await clearSessionAndRedirect({ redirect: redirectOnAuthFailure });
          throw new Error("Authentication failed. Please log in again.");
        }
        return response;
      }

      await clearSessionAndRedirect({ redirect: redirectOnAuthFailure });
      throw new Error("Session expired. Please log in again.");
    } catch (err) {
      if (err instanceof Error && err.message.includes("Please log in")) {
        throw err;
      }
      await clearSessionAndRedirect({ redirect: redirectOnAuthFailure });
      throw new Error("Session expired. Please log in again.");
    }
  }

  return response;
}

// ---------- Public auth endpoints (no auto-refresh / no redirect) ----------
export async function loginUser(data: { email: string; password: string }): Promise<AuthResponse> {
  const res = await fetchWithCreds(apiUrl("/auth/login"), {
    method: "POST",
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error((await res.json()).message || "Login failed");
  return res.json();
}

export async function registerUser(data: {
  fullName: string;
  email: string;
  password: string;
}): Promise<AuthResponse> {
  const res = await fetchWithCreds(apiUrl("/auth/register"), {
    method: "POST",
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error((await res.json()).message || "Registration failed");

  const responseData = await res.json();
  return {
    ...responseData,
    message: "Registration successful. Please check your email for the verification OTP.",
  };
}

export const verifyEmail = async (otp: string): Promise<EmailVerificationResponse> => {
  const res = await fetchWithCreds(apiUrl("/auth/verify-email"), {
    method: "POST",
    body: JSON.stringify({ otp }),
  });

  const data = await res.json();
  if (res.status === 200 || res.status === 201) return data;
  throw new Error(data.message || "Verification failed");
};

export async function resendVerificationEmail(email: string): Promise<{ message: string }> {
  const res = await fetchWithCreds(apiUrl("/auth/resend-verification"), {
    method: "POST",
    body: JSON.stringify({ email }),
  });

  if (!res.ok) throw new Error((await res.json()).message || "Failed to resend verification");
  return res.json();
}

export async function logoutUser(): Promise<void> {
  // Plain fetch — logout must not trigger refresh/redirect loops
  const res = await fetchWithCreds(apiUrl("/auth/logout"), {
    method: "POST",
  });
  if (!res.ok) throw new Error((await res.json()).message || "Logout failed");
}

/** Session probe only — never redirects. */
export async function getCurrentUser(): Promise<{
  id: string;
  email: string;
  fullName: string;
} | null> {
  try {
    const res = await fetchWithCreds(apiUrl("/auth/me"), { method: "GET" });
    if (res.status === 401 || !res.ok) return null;
    const data = await res.json();
    return data.user || null;
  } catch {
    return null;
  }
}

export async function invalidateAllSessions(): Promise<void> {
  const res = await fetchWithAutoRefresh(apiUrl("/auth/invalidate-sessions"), {
    method: "POST",
  });
  if (!res.ok) throw new Error((await res.json()).message || "Failed to invalidate sessions");
}

export async function forgotPassword(email: string): Promise<{ message: string }> {
  const res = await fetchWithCreds(apiUrl("/auth/forgot-password"), {
    method: "POST",
    body: JSON.stringify({ email }),
  });
  if (!res.ok) throw new Error((await res.json()).message || "Failed to start password reset");
  return res.json();
}

export async function resetPassword(data: {
  email: string;
  otp: string;
  password: string;
}): Promise<{ message: string }> {
  const res = await fetchWithCreds(apiUrl("/auth/reset-password"), {
    method: "POST",
    body: JSON.stringify(data),
  });
  const body = await res.json().catch(() => ({}));
  if (res.status === 401) {
    throw new Error(body.message || "Invalid or expired reset code");
  }
  if (!res.ok) {
    throw new Error(body.message || "Failed to reset password");
  }
  return body;
}

export type QrLinkStatus = "pending" | "linked" | "expired" | "not_found";

export interface QrStatusResponse {
  status: QrLinkStatus;
  device: null | {
    deviceId: string;
    name: string;
    type: string;
    location?: unknown;
    locationName?: string;
  };
}

export interface QrPublicInfoResponse {
  status: QrLinkStatus;
  name: string | null;
  type: string | null;
  expiresAt: string | null;
}

const ALLOWED_CLAIM_API_HOSTS = [
  "phone-tracker-be.onrender.com",
  "localhost",
  "127.0.0.1",
];

/**
 * Resolve which API base the phone should call for public claim/info.
 * Prefer `?api=` from the QR (same backend that minted it), with a host allowlist.
 */
export function resolveClaimApiBase(apiFromQuery?: string | null): string {
  const fallback = (API_BASE || "/backend/api").replace(/\/$/, "");
  if (!apiFromQuery) return fallback;

  const trimmed = apiFromQuery.trim().replace(/\/$/, "");
  if (!trimmed) return fallback;

  // Same-origin relative proxy path
  if (trimmed.startsWith("/")) return trimmed;

  try {
    const url = new URL(trimmed);
    if (url.protocol !== "https:" && url.protocol !== "http:") return fallback;

    const hostOk = ALLOWED_CLAIM_API_HOSTS.some(
      (h) => url.hostname === h || url.hostname.endsWith(`.${h}`)
    );
    if (!hostOk) return fallback;

    // Expect .../api suffix when pointing at Nest
    return trimmed;
  } catch {
    return fallback;
  }
}

function claimApiUrl(apiBase: string, path: string) {
  return `${apiBase.replace(/\/$/, "")}${path}`;
}

/** Public fetch — no cookies (phone Safari blocks third-party auth cookies). */
async function publicJsonFetch(input: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers || {});
  if (!headers.has("Content-Type") && init.body) {
    headers.set("Content-Type", "application/json");
  }

  return fetch(input, {
    ...init,
    credentials: "omit",
    headers,
  });
}

export async function generateDeviceQr(data: {
  name: string;
  type: "android" | "ios";
}): Promise<{
  qrCodeId: string;
  qrCodeImage?: string;
  expiresIn: number;
  linkUrl?: string;
  message?: string;
}> {
  const res = await fetchWithAutoRefresh(apiUrl("/devices/generate-qr"), {
    method: "POST",
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error((await res.json()).message || "Failed to generate QR code");
  return res.json();
}

export async function getQrLinkStatus(qrCodeId: string): Promise<QrStatusResponse> {
  const res = await fetchWithAutoRefresh(apiUrl(`/devices/qr/${qrCodeId}/status`));
  if (!res.ok) throw new Error((await res.json()).message || "Failed to check QR status");
  return res.json();
}

/** Public: phone landing preview. */
export async function getPublicQrInfo(
  qrCodeId: string,
  claimToken: string,
  apiBase?: string | null
): Promise<QrPublicInfoResponse> {
  const base = resolveClaimApiBase(apiBase);
  const res = await publicJsonFetch(
    claimApiUrl(base, `/devices/qr/${encodeURIComponent(qrCodeId)}/info?claim=${encodeURIComponent(claimToken)}`)
  );
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(body.message || "Failed to load QR info");
  }
  return body;
}

/** Public: phone claims device for the QR generator's account (no login). */
export async function claimDeviceByQr(data: {
  qrCodeId: string;
  claimToken: string;
  location?: { latitude: number; longitude: number };
  deviceFingerprint?: string;
  userAgent?: string;
  apiBase?: string | null;
}): Promise<{
  message: string;
  device: {
    deviceId: string;
    name: string;
    type: string;
    location?: unknown;
    locationName?: string;
  };
}> {
  const base = resolveClaimApiBase(data.apiBase);
  const res = await publicJsonFetch(claimApiUrl(base, "/devices/qr/claim"), {
    method: "POST",
    body: JSON.stringify({
      qrCodeId: data.qrCodeId,
      claimToken: data.claimToken,
      ...(data.deviceFingerprint ? { deviceFingerprint: data.deviceFingerprint } : {}),
      ...(data.userAgent ? { userAgent: data.userAgent } : {}),
      ...(data.location
        ? {
            location: {
              latitude: data.location.latitude,
              longitude: data.location.longitude,
            },
          }
        : {}),
    }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(body.message || "Failed to claim device");
  }
  return body;
}

/** @deprecated Prefer claimDeviceByQr — kept for older companions. */
export async function linkDeviceByQr(data: {
  qrCodeId: string;
  location?: { latitude: number; longitude: number };
}): Promise<{
  message: string;
  device: {
    deviceId: string;
    name: string;
    type: string;
    location?: unknown;
    locationName?: string;
  };
}> {
  const res = await fetchWithAutoRefresh(
    apiUrl("/devices/link-by-qr"),
    {
      method: "POST",
      body: JSON.stringify(data),
    },
    { redirectOnAuthFailure: false }
  );
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(body.message || "Failed to link device");
  }
  return body;
}

/** Public app origin used in QR payloads (must match backend PUBLIC_APP_URL). */
export function getPublicAppUrl(): string {
  const configured = (process.env.NEXT_PUBLIC_APP_URL || "").replace(/\/$/, "");
  if (configured && !/localhost|127\.0\.0\.1/i.test(configured)) {
    return configured;
  }
  if (typeof window !== "undefined" && window.location?.origin) {
    const origin = window.location.origin.replace(/\/$/, "");
    if (!/localhost|127\.0\.0\.1/i.test(origin)) {
      return origin;
    }
  }
  return configured || "https://phone-tracker-fe.vercel.app";
}

/** Absolute production API base embedded in QR `api=` when generating client-side. */
export function getPublicApiUrlForQr(): string {
  const fromEnv = (process.env.NEXT_PUBLIC_CLAIM_API_URL || "").replace(/\/$/, "");
  if (fromEnv && /^https?:\/\//i.test(fromEnv)) return fromEnv;
  return "https://phone-tracker-be.onrender.com/api";
}

export function deviceLinkPath(
  qrCodeId: string,
  options?: { claimToken?: string; apiBase?: string }
): string {
  const params = new URLSearchParams();
  if (options?.claimToken) params.set("claim", options.claimToken);
  const api = options?.apiBase || getPublicApiUrlForQr();
  if (api) params.set("api", api);
  const qs = params.toString();
  return `${getPublicAppUrl()}/link-device/${qrCodeId}${qs ? `?${qs}` : ""}`;
}
