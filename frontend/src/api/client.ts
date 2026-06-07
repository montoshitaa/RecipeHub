import axios from 'axios';

let _accessToken: string | null = null;
let _refreshPromise: Promise<boolean> | null = null;
let _failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason: unknown) => void;
  config: any;
}> = [];

export const setAccessToken = (token: string | null) => {
  _accessToken = token;
};

export const getAccessToken = (): string | null => _accessToken;

function getCsrfToken(): string | null {
  const match = document.cookie.match(/(?:^|;\s*)csrfToken=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

const api = axios.create({
  baseURL: 'https://api.recipehub.lat',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  if (_accessToken) {
    config.headers.Authorization = 'Bearer ' + _accessToken;
  }

  const csrfToken = getCsrfToken();
  if (csrfToken) {
    config.headers['X-CSRF-Token'] = csrfToken;
  }

  return config;
});

function processQueue(error: unknown, token: string | null = null) {
  _failedQueue.forEach(({ resolve, reject, config }) => {
    if (error) {
      reject(error);
    } else {
      if (token) {
        config.headers.Authorization = 'Bearer ' + token;
      }
      resolve(api(config));
    }
  });
  _failedQueue = [];
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    if (originalRequest.url?.includes('/api/auth/refresh') ||
        originalRequest.url?.includes('/api/auth/login') ||
        originalRequest.url?.includes('/api/auth/register')) {
      return Promise.reject(error);
    }

    if (_refreshPromise) {
      try {
        await _refreshPromise;
        originalRequest.headers.Authorization = 'Bearer ' + _accessToken;
        return api(originalRequest);
      } catch {
        return Promise.reject(error);
      }
    }

    originalRequest._retry = true;

    _refreshPromise = (async () => {
      try {
        const res = await axios.post(
          'https://api.recipehub.lat/api/auth/refresh',
          {},
          { withCredentials: true }
        );
        const newToken: string = res.data.accessToken;
        setAccessToken(newToken);
        processQueue(null, newToken);
        return true;
      } catch (refreshError) {
        processQueue(refreshError, null);
        setAccessToken(null);
        window.location.href = '/login';
        return false;
      } finally {
        _refreshPromise = null;
      }
    })();

    try {
      await _refreshPromise;
      originalRequest.headers.Authorization = 'Bearer ' + _accessToken;
      return api(originalRequest);
    } catch {
      return Promise.reject(error);
    }
  }
);

export { api };
