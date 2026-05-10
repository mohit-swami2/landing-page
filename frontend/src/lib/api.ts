function resolveApiBase() {
  const fromEnv = process.env.NEXT_PUBLIC_API_BASE?.trim();
  if (!fromEnv) {
    throw new Error("NEXT_PUBLIC_API_BASE is required. Set it in frontend environment variables.");
  }

  const normalized = fromEnv.replace(/\/+$/, "");
  if (!normalized.endsWith("/api")) {
    throw new Error("NEXT_PUBLIC_API_BASE must include '/api'. Example: https://your-backend.vercel.app/api");
  }

  return normalized;
}

export const API_BASE = resolveApiBase();

export async function apiFetch(path: string, options: RequestInit = {}, token?: string) {
  const headers: Record<string, string> = {
    ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
    ...((options.headers as Record<string, string>) || {})
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const res = await fetch(`${API_BASE}${normalizedPath}`, {
    ...options,
    headers
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || "Request failed");
  }
  return res.json();
}
