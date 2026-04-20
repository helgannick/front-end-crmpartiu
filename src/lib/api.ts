import { refreshToken } from './auth';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

async function doFetch(url: string, options: RequestInit) {
  return fetch(url, { ...options, credentials: "include", cache: "no-store" });
}

export async function apiFetch(
  path: string,
  { method = "GET", body, params }: { method?: string; body?: any; params?: Record<string, string> } = {}
) {
  let url = `${API_BASE}${path}`;

  if (params) {
    const query = new URLSearchParams(params).toString();
    if (query) url += `?${query}`;
  }

  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  if (body && !(body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const options: RequestInit = {
    method,
    headers,
    body: body && !(body instanceof FormData) ? JSON.stringify(body) : body,
  };

  let res = await doFetch(url, options);

  if (res.status === 401) {
    const refreshed = await refreshToken();
    if (refreshed) {
      res = await doFetch(url, options);
    } else {
      if (typeof window !== 'undefined') window.location.href = '/auth/login';
      throw new Error('Sessão expirada');
    }
  }

  if (!res.ok) {
    const errorText = await res.text();
    let parsed: any;
    try {
      parsed = JSON.parse(errorText);
    } catch {
      parsed = errorText;
    }

    const details = parsed.details?.map((d: any) => `${d.field}: ${d.message}`).join("; ");
    throw new Error(details || parsed.message || parsed.error || "Erro na API");
  }

  if (res.status === 204) return null;

  return res.json();
}

export default apiFetch;
