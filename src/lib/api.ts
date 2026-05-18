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
  const ct = res.headers.get("content-type") || "";
  const body = ct.includes("json") ? await res.json().catch(() => null) : await res.text();
  if (!res.ok) throw new ApiError(res.status, body);
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
