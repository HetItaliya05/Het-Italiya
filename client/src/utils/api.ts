// Centralized API helpers for production deployments.
// Uses VITE_API_URL (Render / external host) OR falls back to same-origin.

export const getApiBase = (): string => {
  const raw = (import.meta as any).env?.VITE_API_URL?.trim() as string | undefined;

  // Recommended: VITE_API_URL should be backend origin (e.g. https://het-italiya-1.onrender.com)
  // Some older configs may include /api; handle both.
  if (!raw) return '';

  const noTrailing = raw.replace(/\/$/, '');
  if (noTrailing.endsWith('/api')) return noTrailing.replace(/\/api\/?$/, '');
  return noTrailing;
};

export const API_BASE = getApiBase();

export const apiUrl = (path: string): string => {
  const normalized = path.startsWith('/') ? path : `/${path}`;

  // If VITE_API_URL isn't set, call same-origin at /api.
  if (!API_BASE) return `/api${normalized}`;

  // If caller already provided /api/..., keep it.
  if (normalized.startsWith('/api')) return `${API_BASE}${normalized}`;

  // Otherwise append /api.
  return `${API_BASE}/api${normalized}`;
};

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<{ ok: true; data: T } | { ok: false; error: any; status?: number }> {
  try {
    const res = await fetch(apiUrl(path), {
      ...options,
      headers: {
        ...(options.headers || {}),
        ...(options.body && !(options.headers as any)?.['Content-Type']
          ? { 'Content-Type': 'application/json' }
          : {}),
      },
    });

    const status = res.status;
    const text = await res.text();
    const json = text ? safeJsonParse(text) : null;

    if (!res.ok) return { ok: false, error: json ?? text, status };
    return { ok: true, data: json as T };
  } catch (error) {
    return { ok: false, error };
  }
}

function safeJsonParse(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

