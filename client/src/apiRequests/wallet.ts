import { apiFetch } from '../utils/api';

const getToken = () => localStorage.getItem('daman_auth_token');

export const walletBalanceRequest = async () => {
  const token = getToken();
  if (!token) return { ok: false, status: 401, error: { message: 'Not authenticated' } };

  return apiFetch<{ balance: number }>(`/wallet/balance`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const walletAddRequest = async (amount: number) => {
  const token = getToken();
  if (!token) return { ok: false, status: 401, error: { message: 'Not authenticated' } };

  return apiFetch<{ balance: number }>(`/wallet/add`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ amount }),
  });
};

export const walletWithdrawRequest = async (amount: number) => {
  const token = getToken();
  if (!token) return { ok: false, status: 401, error: { message: 'Not authenticated' } };

  return apiFetch<{ balance: number }>(`/wallet/withdraw`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ amount }),
  });
};

export const walletClaimRequest = async (code: string) => {
  const token = getToken();
  if (!token) return { ok: false, status: 401, error: { message: 'Not authenticated' } };

  return apiFetch<{ balance: number; creditedAmount: number; code: string }>(`/wallet/claim`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ code }),
  });
};


