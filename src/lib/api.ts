export interface AuthResponse {
  message: string
  user: {
    id: string
    email: string
    fullName: string
  }
}

export async function fetchWithCreds(input: RequestInfo, init: RequestInit = {}) {
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

// In your fetchWithAutoRefresh function
export async function fetchWithAutoRefresh(input: RequestInfo, init?: RequestInit) {
  console.log('🌐 Making request to:', input);
  
  let response = await fetchWithCreds(input, init);
  console.log('📥 Initial response status:', response.status);

  // Check if this is already a refresh request to avoid infinite loops
  const isRefreshRequest = input.toString().includes('/auth/refresh');
  
  if (response.status === 401 && !isRefreshRequest) {
    console.log('🔐 Got 401, attempting token refresh...');
    
    try {
      const refreshResponse = await fetchWithCreds(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`, {
        method: 'POST',
      });

      console.log('🔄 Refresh response status:', refreshResponse.status);
      
      if (refreshResponse.ok) {
        console.log('✅ Refresh successful, retrying original request...');
        
        // Retry the original request
        response = await fetchWithCreds(input, init);
        console.log('🔁 Retry response status:', response.status);
        
        if (response.status === 401) {
          console.error('❌ Still getting 401 after refresh - clearing auth state');
          
          // Clear auth state and redirect to login
          if (typeof window !== 'undefined') {
            const { useAuthStore } = await import('@/store/auth');
            useAuthStore.getState().logout();
            window.location.href = '/auth/login';
          }
          
          throw new Error('Authentication failed. Please log in again.');
        }
        
        return response;
      } else {
        console.error('❌ Refresh failed with status:', refreshResponse.status);
        
        // If refresh fails, clear auth and redirect to login
        if (typeof window !== 'undefined') {
          const { useAuthStore } = await import('@/store/auth');
          useAuthStore.getState().logout();
          window.location.href = '/auth/login';
        }
        
        throw new Error('Session expired. Please log in again.');
      }
    } catch (refreshError) {
      console.error('❌ Refresh error:', refreshError);
      
      // Clear auth state and redirect to login
      if (typeof window !== 'undefined') {
        const { useAuthStore } = await import('@/store/auth');
        useAuthStore.getState().logout();
        window.location.href = '/auth/login';
      }
      
      throw new Error('Session expired. Please log in again.');
    }
  }

  return response;
}

export async function loginUser(data: { email: string; password: string }): Promise<AuthResponse> {
  console.log('🔑 Attempting login for:', data.email);
  
  const res = await fetchWithAutoRefresh(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
    method: 'POST',
    body: JSON.stringify(data),
  });

  console.log('🔑 Login response status:', res.status);

  if (!res.ok) {
    const errorData = await res.json();
    console.error('❌ Login failed:', errorData);
    throw new Error(errorData.message || 'Login failed');
  }
  
  const loginData = await res.json();
  console.log('✅ Login successful:', loginData);
  
  return loginData;
}

export const verifyEmail = async (otp: string): Promise<any> => {
  const response = await fetchWithAutoRefresh(`${process.env.NEXT_PUBLIC_API_URL}/auth/verify-email`, {
    method: 'POST',
    body: JSON.stringify({ otp }),
  });

  const data = await response.json();
  
  if (response.status === 200 || response.status === 201) {
    return data;
  }
  
  throw new Error(data.message || 'Verification failed');
};

export async function resendVerificationEmail(email: string): Promise<{ message: string }> {
  const res = await fetchWithAutoRefresh(`${process.env.NEXT_PUBLIC_API_URL}/auth/resend-verification`, {
    method: 'POST',
    body: JSON.stringify({ email }),
  });

  if (!res.ok) throw new Error((await res.json()).message || 'Failed to resend verification');
  return res.json();
}

export async function registerUser(data: { fullName: string; email: string; password: string }): Promise<AuthResponse> {
  const res = await fetchWithAutoRefresh(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
    method: 'POST',
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error((await res.json()).message || 'Registration failed');
  
  const responseData = await res.json();
 
  return {
    ...responseData,
    message: 'Registration successful. Please check your email for the verification OTP.'
  };
}

export async function logoutUser(): Promise<void> {
  console.log('👋 Attempting logout...');
  
  const res = await fetchWithAutoRefresh(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
    method: 'POST',
  });
  
  console.log('👋 Logout response status:', res.status);
  
  if (!res.ok) throw new Error((await res.json()).message || 'Logout failed');
}

export async function getCurrentUser(): Promise<AuthResponse['user'] | null> {
  try {
    console.log('🔍 Checking current user session...');
    
    const res = await fetchWithAutoRefresh(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
      method: 'GET',
    });
    
    if (!res.ok) {
      console.log('❌ No valid session found');
      return null;
    }
    
    const data = await res.json();
    console.log('✅ Session valid, user:', data.user);
    return data.user;
  } catch (error) {
    console.error('❌ Session check failed:', error);
    return null;
  }
}

export async function invalidateAllSessions(): Promise<void> {
  const res = await fetchWithAutoRefresh(`${process.env.NEXT_PUBLIC_API_URL}/auth/invalidate-sessions`, {
    method: 'POST',
  });
  
  if (!res.ok) throw new Error((await res.json()).message || 'Failed to invalidate sessions');
}