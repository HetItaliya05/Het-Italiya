import { api, extractAxiosError } from './api';

export const loginRequest = async (phone, password) => {
  try {
    const res = await api.post('/auth/login', { phone, password });
    return { success: true, data: res.data };
  } catch (error) {
    const err = extractAxiosError(error);
    return { success: false, error: err, status: err?.status };
  }
};

export const registerRequest = async (phone, password) => {
  try {
    const res = await api.post('/auth/register', { phone, password });
    return { success: true, data: res.data };
  } catch (error) {
    const err = extractAxiosError(error);
    return { success: false, error: err, status: err?.status };
  }
};

