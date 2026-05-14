import { apiFetch } from '../utils/api';

const getToken = () => localStorage.getItem('daman_auth_token');

export const adminLoginRequest = async (usernameOrPhone: string, password: string) => {
  // NOTE: backend expects { username, password }.
  // If user enters phone/email, backend still treats it as username.
  const username = String(usernameOrPhone ?? '').trim();
  if (!username || !password) return { ok: false, status: 400, error: { message: 'Username and password are required' } };

  return apiFetch<{ token: string; admin: { id: string; username: string; role: string } }>(`/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
};

// Thin adapter to match component usage
export const adminLoginRequestFromComponent = adminLoginRequest;

