import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

/* ── Token refresh interceptor ──────────────────────────── */

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (err: Error) => void;
}> = [];

function processQueue(error: Error | null) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve();
  });
  failedQueue = [];
}

let onAuthFailure: (() => void) | null = null;

export function setOnAuthFailure(cb: () => void) {
  onAuthFailure = cb;
}

const SKIP_REFRESH_URLS = ["/auth/login", "/auth/register", "/auth/refresh"];

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status !== 401 ||
      originalRequest._retry ||
      SKIP_REFRESH_URLS.some((url) => originalRequest.url?.includes(url))
    ) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then(() => api(originalRequest));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      await api.post("/auth/refresh");
      processQueue(null);
      return api(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError as Error);
      onAuthFailure?.();
      return Promise.reject(error);
    } finally {
      isRefreshing = false;
    }
  },
);

export default api;
