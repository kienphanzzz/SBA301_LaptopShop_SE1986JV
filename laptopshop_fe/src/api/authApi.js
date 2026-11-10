import { axiosClient, resetCsrfToken } from './axiosClient';

export const authApi = {
  async register(payload) {
    const response = await axiosClient.post('/auth/register', payload);
    return response.data;
  },

  async login(payload) {
    const response = await axiosClient.post('/auth/login', payload);
    // Sau khi đăng nhập thành công, bỏ token cache để request kế tiếp lấy token khớp cookie hiện tại
    resetCsrfToken();
    return response.data;
  },

  async logout() {
    const response = await axiosClient.post('/auth/logout');
    // Sau khi đăng xuất, bỏ token cache cho các request tiếp theo
    resetCsrfToken();
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

