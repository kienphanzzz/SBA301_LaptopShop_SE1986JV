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
let refreshPromise = null;

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
    // timeout dài để chịu được Render Free khởi động nguội (~50s)
    csrfPromise = axios
      .get(`${BASE_URL}/auth/csrf`, { withCredentials: true, timeout: 60000 })
      .then((res) => {
        const token =
          res.data?.token ||
          res.headers?.['x-xsrf-token'] ||
          readCsrfCookie();
        if (!token) {
          throw new Error('Không lấy được CSRF token từ máy chủ.');
        }
        cachedCsrfToken = token;
        return token;
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
    config.headers.set('X-XSRF-TOKEN', token);
  }
  return config;
});

// Xóa token đã cache để request thay đổi dữ liệu kế tiếp lấy lại token khớp với cookie hiện tại
export function resetCsrfToken() {
  cachedCsrfToken = null;
}

// Lưu ý: KHÔNG cập nhật cachedCsrfToken từ header x-xsrf-token của response bất kỳ.
// Các GET song song khi chưa có cookie mỗi request sinh một token khác nhau, cookie cuối cùng
// trình duyệt giữ có thể không trùng với header của response đến sau -> 403. Token chỉ lấy từ /auth/csrf.
axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalConfig = error.config;
    const status = error.response?.status;
    const method = (originalConfig?.method || 'get').toLowerCase();
    const url = originalConfig?.url || '';

    // 1. Xử lý CSRF token xoay vòng (403)
    if (
      status === 403 &&
      originalConfig &&
      !originalConfig._csrfRetried &&
      ['post', 'put', 'patch', 'delete'].includes(method)
    ) {
      originalConfig._csrfRetried = true;
      const freshToken = await ensureCsrfToken(true);
      originalConfig.headers.set('X-XSRF-TOKEN', freshToken);
      return axiosClient(originalConfig);
    }

    // 2. Xử lý Token hết hạn (401 Unauthorized) -> Tự động gọi Refresh Token (Task 6)
    const isAuthAction = /\/auth\/(login|register|refresh|logout)$/.test(url);
    if (status === 401 && originalConfig && !originalConfig._retried && !isAuthAction) {
      originalConfig._retried = true;

      // Chia sẻ 1 promise duy nhất cho các request đồng thời bị 401 (ngăn race condition)
      if (!refreshPromise) {
        refreshPromise = (async () => {
          const csrf = await ensureCsrfToken(false);
          return axios.post(
            `${BASE_URL}/auth/refresh`,
            {},
            {
              withCredentials: true,
              headers: {
                'Content-Type': 'application/json',
                ...(csrf ? { 'X-XSRF-TOKEN': csrf } : {}),
              },
            }
          );
        })();
      }

      try {
        await refreshPromise;
        // Refresh thành công -> Thực hiện lại request ban đầu với cookie mới
        return axiosClient(originalConfig);
      } catch (refreshError) {
        // Refresh thất bại (hết hạn hoặc revoked) -> Thông báo phiên đăng nhập kết thúc
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('auth-session-expired'));
        }
        return Promise.reject(refreshError);
      } finally {
        refreshPromise = null;
      }
    }

    return Promise.reject(error);
  }
);
