import { axiosClient, ensureCsrfToken } from './axiosClient';

export const authApi = {
  async register(payload) {
    await ensureCsrfToken(false);
    const response = await axiosClient.post('/auth/register', payload);
    return response.data;
  },

  async login(payload) {
    await ensureCsrfToken(false);
    const response = await axiosClient.post('/auth/login', payload);
    // Sau khi đăng nhập, phiên HttpSession thay đổi nên làm mới CSRF token cho các request tiếp theo
    await ensureCsrfToken(true).catch(() => {});
    return response.data;
  },

  async logout() {
    await ensureCsrfToken(false);
    const response = await axiosClient.post('/auth/logout');
    await ensureCsrfToken(true).catch(() => {});
    return response.data;
  },

  async refresh() {
    await ensureCsrfToken(false);
    const response = await axiosClient.post('/auth/refresh');
    return response.data;
  },

  async getProfile() {
    const response = await axiosClient.get('/profile');
    return response.data;
  },

  async updateProfile(payload) {
    await ensureCsrfToken(false);
    const response = await axiosClient.put('/profile', payload);
    return response.data;
  },
};
