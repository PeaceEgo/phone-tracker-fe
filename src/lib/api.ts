import { LoginFormData, RegisterFormData } from './validation';

export interface AuthResponse {
  message: string;
  user: {
    id: string;
    email: string;
    fullname: string;
  };
}

export async function registerUser(data: RegisterFormData): Promise<AuthResponse> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    credentials: 'include',
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Registration failed');
  }

  return response.json();
}

export async function loginUser(data:LoginFormData): Promise<AuthResponse> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    credentials: 'include',
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Login failed');
  }

  return response.json();
}

export async function refreshToken(): Promise<{ message: string }> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Token refresh failed');
  }

  return response.json();
}

export async function logoutUser(): Promise<void> {
  await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  });
}

export async function fetchProtectedData(): Promise<any> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/protected`, {
    method: 'GET',
    credentials: 'include',
  });

  if (!response.ok) {
    if (response.status === 401) {
      await refreshToken();
      const retryResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/protected`, {
        method: 'GET',
        credentials: 'include',
      });
      if (!retryResponse.ok) {
        throw new Error('Failed to fetch protected data after token refresh');
      }
      return retryResponse.json();
    }
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to fetch protected data');
  }

  return response.json();
}