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

// Base URL helper so we never forget it
const API_BASE = process.env.NEXT_PUBLIC_API_URL!;
const apiUrl = (path: string) => `${API_BASE}${path}`;

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

// --- Main fetch with refresh ---
export async function fetchWithAutoRefresh(input: string, init?: RequestInit) {
  console.log("🌐 Making request to:", input);

  let response = await fetchWithCreds(input, init);
  console.log("📥 Initial response status:", response.status);

  const isRefreshRequest = input.includes("/auth/refresh");

  if (response.status === 401 && !isRefreshRequest) {
    console.log("🔐 Got 401, attempting token refresh…");

    try {
      const refreshResponse = await fetchWithCreds(apiUrl("/auth/refresh"), {
        method: "POST",
      });

      console.log("🔄 Refresh response status:", refreshResponse.status);

      if (refreshResponse.ok) {
        console.log("✅ Refresh successful, retrying original request…");
        response = await fetchWithCreds(input, init);

        if (response.status === 401) {
          console.error("❌ Still getting 401 after refresh");
          if (typeof window !== "undefined") {
            const { useAuthStore } = await import("@/store/auth");
            useAuthStore.getState().logout();
            window.location.href = "/auth/login";
          }
          throw new Error("Authentication failed. Please log in again.");
        }
        return response;
      }

      console.error("❌ Refresh failed with status:", refreshResponse.status);
      if (typeof window !== "undefined") {
        const { useAuthStore } = await import("@/store/auth");
        useAuthStore.getState().logout();
        window.location.href = "/auth/login";
      }
      throw new Error("Session expired. Please log in again.");
    } catch (err) {
      console.error("❌ Refresh error:", err);
      if (typeof window !== "undefined") {
        const { useAuthStore } = await import("@/store/auth");
        useAuthStore.getState().logout();
        window.location.href = "/auth/login";
      }
      throw new Error("Session expired. Please log in again.");
    }
  }

  return response;
}

// ---------- Auth Endpoints ----------
export async function loginUser(data: { email: string; password: string }): Promise<AuthResponse> {
  const res = await fetchWithAutoRefresh(apiUrl("/auth/login"), {
    method: "POST",
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error((await res.json()).message || "Login failed");
  return res.json();
}

export async function registerUser(data: { fullName: string; email: string; password: string }): Promise<AuthResponse> {
  const res = await fetchWithAutoRefresh(apiUrl("/auth/register"), {
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
  const res = await fetchWithAutoRefresh(apiUrl("/auth/verify-email"), {
    method: "POST",
    body: JSON.stringify({ otp }),
  });

  const data = await res.json();
  if (res.status === 200 || res.status === 201) return data;
  throw new Error(data.message || "Verification failed");
};

export async function resendVerificationEmail(email: string): Promise<{ message: string }> {
  const res = await fetchWithAutoRefresh(apiUrl("/auth/resend-verification"), {
    method: "POST",
    body: JSON.stringify({ email }),
  });

  if (!res.ok) throw new Error((await res.json()).message || "Failed to resend verification");
  return res.json();
}

export async function logoutUser(): Promise<void> {
  const res = await fetchWithAutoRefresh(apiUrl("/auth/logout"), {
    method: "POST",
  });
  if (!res.ok) throw new Error((await res.json()).message || "Logout failed");
}

export async function getCurrentUser(): Promise<{ id: string; email: string; fullName: string } | null> {
  try {
    const res = await fetchWithAutoRefresh(apiUrl("/auth/me"), { method: "GET" });
    if (!res.ok) return null;
    const data = await res.json();
    return data.user || null;
  } catch (err) {
    console.error("❌ Session check failed:", err);
    return null;
  }
}

export async function invalidateAllSessions(): Promise<void> {
  const res = await fetchWithAutoRefresh(apiUrl("/auth/invalidate-sessions"), { method: "POST" });
  if (!res.ok) throw new Error((await res.json()).message || "Failed to invalidate sessions");
}
