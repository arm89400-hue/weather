import axios from "axios";

// Empty by default: nginx (see frontend/nginx.conf) proxies /api and /socket.io to the
// backend, so relative URLs work from whatever host/IP loaded the page — no need to know the
// backend's address at build time. Set VITE_API_URL only for local (non-Docker) dev, where
// the Vite dev server and backend run as genuinely separate origins.
const API_URL = import.meta.env.VITE_API_URL ?? "";

export const apiClient = axios.create({
  baseURL: `${API_URL}/api`,
  withCredentials: true, // send the httpOnly refresh-token cookie
});

let accessToken: string | null = null;
let onTokenRefreshed: ((token: string) => void) | null = null;
let onAuthExpired: (() => void) | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function setAuthCallbacks(callbacks: {
  onTokenRefreshed: (token: string) => void;
  onAuthExpired: () => void;
}) {
  onTokenRefreshed = callbacks.onTokenRefreshed;
  onAuthExpired = callbacks.onAuthExpired;
}

apiClient.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

let refreshInFlight: Promise<string> | null = null;

apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        refreshInFlight ??= refreshAccessToken();
        const newToken = await refreshInFlight;
        refreshInFlight = null;
        original.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(original);
      } catch (refreshError) {
        refreshInFlight = null;
        onAuthExpired?.();
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

async function refreshAccessToken(): Promise<string> {
  const res = await axios.post(
    `${API_URL}/api/auth/refresh`,
    {},
    { withCredentials: true }
  );
  const token = res.data.accessToken as string;
  setAccessToken(token);
  onTokenRefreshed?.(token);
  return token;
}
