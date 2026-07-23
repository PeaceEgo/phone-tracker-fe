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

export async function generateDeviceQr(data: {
  name: string;
  type: "android" | "ios";
}): Promise<{
  qrCodeId: string;
  qrCodeImage?: string;
  expiresIn: number;
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
  // Never hard-redirect away from /link-device on 401 — page handles re-auth with ?next=
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
    // Prefer production HTTPS when generating QRs that phones must scan
    if (!/localhost|127\.0\.0\.1/i.test(origin)) {
      return origin;
    }
  }
  return configured || "https://phone-tracker-fe.vercel.app";
}

export function deviceLinkPath(qrCodeId: string): string {
  return `${getPublicAppUrl()}/link-device/${qrCodeId}`;
}
