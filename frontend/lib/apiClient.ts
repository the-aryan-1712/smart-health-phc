/**
 * Typed API client for Smart Health.
 * Centralises fetch calls, error handling, and type inference.
 */

const BASE_URL =
  typeof window !== "undefined"
    ? "" // Browser: relative paths (goes through Next.js API routes)
    : process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:8080";

interface ApiError {
  detail: string;
  status: number;
}

class SmartHealthApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "SmartHealthApiError";
    this.status = status;
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try {
      const err: ApiError = await res.json();
      message = err.detail ?? message;
    } catch {
      // ignore JSON parse failure
    }
    throw new SmartHealthApiError(message, res.status);
  }

  return res.json() as Promise<T>;
}

export const apiClient = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "POST", body: JSON.stringify(body) }),
};
