const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";
import { auth } from "../firebase";

type ApiErrorPayload = {
  error?: string;
  message?: string;
};

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

function buildUrl(path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${apiBaseUrl}${normalizedPath}`;
}

function extractErrorMessage(payload: unknown, status: number) {
  if (payload && typeof payload === "object") {
    const maybeApiError = payload as ApiErrorPayload;

    if (typeof maybeApiError.error === "string") {
      return maybeApiError.error;
    }

    if (typeof maybeApiError.message === "string") {
      return maybeApiError.message;
    }
  }

  return `Request failed with status ${status}`;
}

export async function apiRequest<TResponse>(path: string, init: RequestInit = {}): Promise<TResponse> {
  const headers = new Headers(init.headers);

  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(buildUrl(path), {
    ...init,
    headers,
  });

  const payload = (await response.json().catch(() => null)) as TResponse | ApiErrorPayload | null;

  if (!response.ok) {
    throw new ApiError(extractErrorMessage(payload, response.status), response.status);
  }

  return payload as TResponse;
}

export async function getAuthorizationHeader() {
  const currentUser = auth.currentUser;

  if (!currentUser) {
    throw new Error("You need to be signed in to perform this action.");
  }

  const token = await currentUser.getIdToken();

  return {
    Authorization: `Bearer ${token}`,
  };
}
