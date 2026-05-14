// Centralized Axios API client for production deployments.
// - Uses Vite env var VITE_API_URL as backend origin.
// - Sends cookies via withCredentials: true.
// - Keeps UI code untouched; import { api } / api.get/post elsewhere.

import axios from 'axios';

const raw = (import.meta).env?.VITE_API_URL;

const getApiBase = () => {
  if (!raw) return '';
  const noTrailing = String(raw).replace(/\/$/, '');
  // Allow configs like: https://host/api
  if (noTrailing.endsWith('/api')) return noTrailing.replace(/\/api\/?$/, '');
  return noTrailing;
};

const API_BASE = getApiBase();

// Create instance. If API_BASE is empty, fall back to same-origin /api.
export const api = axios.create({
  baseURL: API_BASE ? API_BASE + '/api' : '/api',
  withCredentials: true,
});

// Optional helper to build consistent error objects.
export const extractAxiosError = (error) => {
  if (error?.response) {
    return {
      status: error.response.status,
      data: error.response.data,
      message:
        error.response.data?.message ||
        error.response.data?.error ||
        `Request failed with status ${error.response.status}`,
    };
  }
  if (error?.request) {
    return { message: 'No response from server. Check network/CORS.' };
  }
  return { message: error?.message || 'Unknown error' };
};

