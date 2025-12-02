const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function apiFetch(
  path: string,
  { method = "GET", body, token, params }: any = {}
) {
  let url = `${API_BASE}${path}`;

  // query params
  if (params) {
    const query = new URLSearchParams(params).toString();
    if (query) url += `?${query}`;
  }

  // pega token automaticamente do localStorage
  if (!token && typeof window !== "undefined") {
    token = localStorage.getItem("token") || undefined;
  }

  const headers: any = {
    Accept: "application/json",
  };

  // se não for FormData, enviar JSON
  if (body && !(body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  // adiciona token se existir
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    method,
    headers,
    body: body && !(body instanceof FormData) ? JSON.stringify(body) : body,
    cache: "no-store",
  });

  if (!res.ok) {
    const errorText = await res.text();
    let parsed;
    try {
      parsed = JSON.parse(errorText);
    } catch {
      parsed = errorText;
    }

    throw new Error(parsed.message || parsed.error || "Erro na API");
  }

  // algumas rotas retornam 204 No Content
  if (res.status === 204) return null;

  return res.json();
}

export default apiFetch;
