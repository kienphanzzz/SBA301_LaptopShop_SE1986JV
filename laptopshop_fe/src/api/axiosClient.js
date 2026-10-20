import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

export const axiosClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  withCredentials: true,
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',
  headers: {
    'Content-Type': 'application/json',
  },
});

let cachedCsrfToken = null;
let csrfPromise = null;

function readCsrfCookie() {
  if (typeof document === 'undefined' || !document.cookie) return null;
  const match = document.cookie
    .split('; ')
    .find((row) => row.startsWith('XSRF-TOKEN='));
  return match ? decodeURIComponent(match.split('=')[1]) : null;
}

export async function ensureCsrfToken(forceRefresh = false) {
  if (!forceRefresh) {
    const cookieToken = readCsrfCookie();
    if (cookieToken) {
      cachedCsrfToken = cookieToken;
      return cachedCsrfToken;
    }
    if (cachedCsrfToken) {
      return cachedCsrfToken;
    }
  }

  if (!csrfPromise) {
    csrfPromise = axios
      .get(`${BASE_URL}/auth/csrf`, { withCredentials: true, timeout: 8000 })
      .then((res) => {
        const token =
          res.headers?.['x-xsrf-token'] ||
          res.data?.token ||
          readCsrfCookie();
        if (token) {
          cachedCsrfToken = token;
        }
        return cachedCsrfToken;
      })
      .finally(() => {
        csrfPromise = null;
      });
  }

  return csrfPromise;
}

axiosClient.interceptors.request.use(async (config) => {
  const method = (config.method || 'get').toLowerCase();
  if (['post', 'put', 'patch', 'delete'].includes(method)) {
    const token = await ensureCsrfToken(false);
    if (token) {
      config.headers = config.headers || {};
      config.headers['X-XSRF-TOKEN'] = token;
    }
  }
  return config;
});

axiosClient.interceptors.response.use(
  (response) => {
    const headerToken = response.headers?.['x-xsrf-token'];
    if (headerToken) {
      cachedCsrfToken = headerToken;
    }
    return response;
  },
  async (error) => {
    const originalConfig = error.config;
    const status = error.response?.status;
    const method = (originalConfig?.method || 'get').toLowerCase();

    // Nếu CSRF token bị xoay vòng sau khi login/logout, tự động làm mới 1 lần
    if (
      status === 403 &&
      originalConfig &&
      !originalConfig._csrfRetried &&
      ['post', 'put', 'patch', 'delete'].includes(method) &&
      !String(originalConfig.url || '').includes('/auth/login')
    ) {
      originalConfig._csrfRetried = true;
      const freshToken = await ensureCsrfToken(true);
      if (freshToken) {
        originalConfig.headers = originalConfig.headers || {};
        originalConfig.headers['X-XSRF-TOKEN'] = freshToken;
        return axiosClient(originalConfig);
      }
    }

    return Promise.reject(error);
  }
);
