// Cliente HTTP fino para o backend self-hosted (overcyber-backend).
// Em produção o frontend é servido pelo mesmo host que o backend (via nginx),
// então BASE_URL fica vazio. Em dev local defina VITE_API_BASE_URL=http://localhost:8787.

export const API_BASE_URL: string = (import.meta.env.VITE_API_BASE_URL as string) || "";

export class ApiError extends Error {
  constructor(public status: number, public body: any) {
    super(typeof body === "string" ? body : body?.error || `HTTP ${status}`);
  }
}

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(new RegExp("(?:^|; )" + name + "=([^;]*)"));
  return m ? decodeURIComponent(m[1]) : null;
}

export type ApiOptions = RequestInit & { json?: any };

export async function api<T = any>(path: string, opts: ApiOptions = {}): Promise<T> {
  const headers = new Headers(opts.headers || {});
  headers.set("Accept", "application/json");
  if (opts.json !== undefined) {
    headers.set("Content-Type", "application/json");
    opts.body = JSON.stringify(opts.json);
  }
  const method = (opts.method || (opts.body ? "POST" : "GET")).toUpperCase();
  if (!["GET", "HEAD"].includes(method)) {
    const csrf = getCookie("csrf");
    if (csrf) headers.set("X-CSRF-Token", csrf);
  }
  const res = await fetch(`${API_BASE_URL}/api${path}`, {
    ...opts,
    method,
    headers,
    credentials: "include",
  });
  if (res.status === 204) {
    return null as T;
  }
  const ct = res.headers.get("content-type") || "";
  if (res.ok && !ct.includes("json")) {
    throw new ApiError(res.status, "API retornou resposta não-JSON");
  }
  if (!res.ok) {
    let errBody: any = null;
    if (ct.includes("json")) {
      errBody = await res.json().catch(() => null);
    } else {
      errBody = await res.text().catch(() => null);
    }
    throw new ApiError(res.status, errBody);
  }
  const body = await res.json().catch(() => null);
  return body as T;
}

export const backend = {
  available: async () => {
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 1500);
      const r = await fetch(`${API_BASE_URL}/healthz`, { signal: ctrl.signal });
      clearTimeout(t);
      return r.ok;
    } catch {
      return false;
    }
  },
};
