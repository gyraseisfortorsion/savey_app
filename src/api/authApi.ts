import { apiClient } from '@/src/lib/api/axios';
import { LoginRequest, RegisterRequest, TokenResponse } from '@/src/types/auth';
import { UserResponse, UserUpdate } from '@/src/types/user';
import { UserBalance } from '@/src/types/transaction';
import { AUTH_BASE_URL } from '@/src/constants/api';

export interface UserWithBalance {
  user: UserResponse;
  balance: UserBalance;
}

interface BetterAuthResponse {
  token: string;
  user: { id: string; email: string; name?: string };
}

async function authFetch(path: string, body: object): Promise<TokenResponse> {
  let res: Response;
  try {
    res = await fetch(`${AUTH_BASE_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch (networkErr) {
    throw new Error('Cannot reach auth service. Check your connection.');
  }

  // Safely parse JSON — proxy/gateway errors may return HTML
  let data: Partial<BetterAuthResponse> & { message?: string } = {};
  const contentType = res.headers.get('content-type') ?? '';
  if (contentType.includes('application/json')) {
    data = await res.json();
  } else {
    const text = await res.text();
    if (!res.ok) throw new Error(`Auth service error (${res.status}): ${text.slice(0, 120)}`);
  }

  if (!res.ok) {
    throw new Error(data.message ?? 'Authentication failed');
  }

  if (!data.token) {
    throw new Error('Auth service returned no token');
  }

  return { access_token: data.token };
}

export async function login(data: LoginRequest): Promise<TokenResponse> {
  return authFetch('/api/auth/sign-in/email', { email: data.email, password: data.password });
}

export async function register(data: RegisterRequest): Promise<TokenResponse> {
  return authFetch('/api/auth/sign-up/email', {
    email: data.email,
    password: data.password,
    name: data.full_name ?? '',
  });
}

export async function getMe(): Promise<UserWithBalance> {
  const res = await apiClient.get<UserWithBalance>('/auth/me');
  return res.data;
}

export async function updateUser(userId: string, data: UserUpdate): Promise<UserResponse> {
  const res = await apiClient.put<UserResponse>(`/users/${userId}`, data);
  return res.data;
}
