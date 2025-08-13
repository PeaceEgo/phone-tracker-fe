export interface AuthResponse {
  message: string
  accessToken: string
  user: {
    id: string
    email: string
    fullName: string
  }
}

async function fetchWithCreds(input: RequestInfo, init?: RequestInit) {
  return fetch(input, {
    ...init,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
  })
}

export async function fetchWithAutoRefresh(input: RequestInfo, init?: RequestInit) {
  let response = await fetchWithCreds(input, init)

  if (response.status === 401) {
    const refreshResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    })

    if (!refreshResponse.ok) {
      throw new Error('Session expired. Please log in again.')
    }

    const { accessToken } = await refreshResponse.json()
    const { setState } = require('@/store/auth').useAuthStore
    setState({ accessToken })

    // Retry original request with new token
    response = await fetchWithCreds(input, {
      ...init,
      headers: {
        ...(init?.headers || {}),
        Authorization: `Bearer ${accessToken}`,
      },
    })
  }

  return response
}

export async function loginUser(data: { email: string; password: string }): Promise<AuthResponse> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
    method: 'POST',
    body: JSON.stringify(data),
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  })

  if (!res.ok) throw new Error((await res.json()).message || 'Login failed')
  return res.json()
}

export async function registerUser(data: { fullName: string; email: string; password: string }): Promise<AuthResponse> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
    method: 'POST',
    body: JSON.stringify(data),
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  })

  if (!res.ok) throw new Error((await res.json()).message || 'Registration failed')
  return res.json()
}

export async function logoutUser(): Promise<void> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  })
  if (!res.ok) throw new Error((await res.json()).message || 'Logout failed')
}
