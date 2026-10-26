import { axiosClient } from './axiosClient';
import { normalizeLaptop } from './catalogApi';

function requireArray(value, resource) {
  if (!Array.isArray(value)) {
    throw new Error(`Dữ liệu ${resource} trả về từ máy chủ không đúng định dạng danh sách.`);
  }
  return value;
}

function normalizeOrderDate(value) {
  return typeof value === 'string' ? value.slice(0, 10) : '';
}

function normalizeOrder(order) {
  return { ...order, orderDate: normalizeOrderDate(order.orderDate) };
}

export const shoppingApi = {
  async getCart() {
    const response = await axiosClient.get('/cart');
    const items = requireArray(response.data?.items, 'giỏ hàng');
    return items.map((item) => ({
      laptopId: Number(item.laptopId),
      quantity: Number(item.quantity),
      product: normalizeLaptop(item.laptop),
    }));
  },

  async addToCart(laptopId, quantity) {
    const response = await axiosClient.post('/cart', { laptopId, quantity });
    return response.data;
  },

  async updateCartQuantity(laptopId, quantity) {
    const response = await axiosClient.put(`/cart/${laptopId}`, { quantity });
    return response.data;
  },

  async removeFromCart(laptopId) {
    await axiosClient.delete(`/cart/${laptopId}`);
  },

  async getWishlist() {
    const response = await axiosClient.get('/wishlist');
    return requireArray(response.data, 'wishlist').map((item) => ({
      laptopId: Number(item.laptopId),
      product: normalizeLaptop(item.laptop),
    }));
  },

  async toggleWishlist(laptopId) {
    const response = await axiosClient.post(`/wishlist/${laptopId}/toggle`);
    return response.data;
  },

  async getMyOrders() {
    const response = await axiosClient.get('/orders/me');
    return requireArray(response.data, 'danh sách đơn hàng').map(normalizeOrder);
  },

  async getMyOrder(id) {
    const response = await axiosClient.get(`/orders/me/${id}`);
    return normalizeOrder(response.data);
  },

  async placeOrder(payload) {
    const response = await axiosClient.post('/orders', payload);
    return normalizeOrder(response.data);
  },

  async cancelOrder(id) {
    const response = await axiosClient.post(`/orders/me/${id}/cancel`);
    return normalizeOrder(response.data);
  },

  async confirmReceived(id) {
    const response = await axiosClient.post(`/orders/me/${id}/confirm-received`);
    return normalizeOrder(response.data);
  },
};
