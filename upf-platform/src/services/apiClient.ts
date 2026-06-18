import { getApiBase, getStoredToken } from "./authApi";

type FetchOptions = RequestInit & { skipAuth?: boolean };

export async function apiFetch(path: string, init: FetchOptions = {}): Promise<Response> {
  const { skipAuth, headers: hdrs, ...rest } = init;
  const headers = new Headers(hdrs);
  if (!headers.has("Accept")) headers.set("Accept", "application/json");
  const token = skipAuth ? null : getStoredToken();
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  const base = getApiBase();
  const url = path.startsWith("http")
    ? path
    : `${base}${path.startsWith("/") ? "" : "/"}${path}`;
  return fetch(url, { ...rest, headers });
}

export async function apiJson<T>(path: string, init: FetchOptions = {}): Promise<T> {
  const res = await apiFetch(path, init);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `${res.status} ${res.statusText}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}
