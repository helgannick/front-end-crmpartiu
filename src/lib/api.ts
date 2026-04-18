const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

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

  const res = await fetch(url, {
    method,
    headers,
    credentials: "include",
    body: body && !(body instanceof FormData) ? JSON.stringify(body) : body,
    cache: "no-store",
  });

  if (!res.ok) {
    const errorText = await res.text();
    let parsed: any;
    try {
      parsed = JSON.parse(errorText);
    } catch {
      parsed = errorText;
    }

    throw new Error(parsed.message || parsed.error || "Erro na API");
  }

  if (res.status === 204) return null;

  return res.json();
}

export default apiFetch;
