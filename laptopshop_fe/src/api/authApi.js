import { axiosClient, ensureCsrfToken } from './axiosClient';

export const authApi = {
  async register(payload) {
    const response = await axiosClient.post('/auth/register', payload);
    return response.data;
  },

  async login(payload) {
    const response = await axiosClient.post('/auth/login', payload);
    // Sau khi đăng nhập thành công, làm mới CSRF token để đồng bộ token mới cho các request tiếp theo
    await ensureCsrfToken(true).catch(() => {});
    return response.data;
  },

  async logout() {
    const response = await axiosClient.post('/auth/logout');
    // Sau khi đăng xuất, làm mới CSRF token cho các request tiếp theo
    await ensureCsrfToken(true).catch(() => {});
    return response.data;
  },

  async refresh() {
    const response = await axiosClient.post('/auth/refresh');
    return response.data;
  },

  async getProfile() {
    const response = await axiosClient.get('/profile');
    return response.data;
  },

  async updateProfile(payload) {
    const response = await axiosClient.put('/profile', payload);
    return response.data;
  },
};

