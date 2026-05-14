import { api, extractAxiosError } from '../api';

// Kept for compatibility with existing imports.
// NOTE: Existing code uses apiFetch from '../utils/api.ts'.
// This file provides axios utilities and an apiFetch wrapper if needed.

export const apiGet = async (path, config = {}) => {
  try {
    const res = await api.get(path, config);
    return { ok: true, data: res.data };
  } catch (error) {
    const err = extractAxiosError(error);
    return { ok: false, error: err, status: err?.status };
  }
};

export const apiPost = async (path, body = {}, config = {}) => {
  try {
    const res = await api.post(path, body, config);
    return { ok: true, data: res.data };
  } catch (error) {
    const err = extractAxiosError(error);
    return { ok: false, error: err, status: err?.status };
  }
};

export const apiFetch = async (path, options = {}) => {
  const method = (options?.method || 'GET').toUpperCase();
  const headers = options?.headers || {};
  const body = options?.body;

  try {
    if (method === 'POST') {
      return await apiPost(path, body, { headers, withCredentials: true });
    }

    const res = await api.request({ url: path, method, headers, data: body });
    return { ok: true, data: res.data };
  } catch (error) {
    const err = extractAxiosError(error);
    return { ok: false, error: err, status: err?.status };
  }
};


