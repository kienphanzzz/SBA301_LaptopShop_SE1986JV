import { axiosClient } from './axiosClient';
import { normalizeLaptop, normalizeTaxonomyItem } from './catalogApi';

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

export const adminApi = {
  async getLaptops() {
    const response = await axiosClient.get('/admin/laptops');
    return requireArray(response.data, 'danh sách laptop quản trị').map(normalizeLaptop);
  },

  async saveLaptop(payload, id) {
    const response = id
      ? await axiosClient.put(`/admin/laptops/${id}`, payload)
      : await axiosClient.post('/admin/laptops', payload);
    return normalizeLaptop(response.data);
  },

  async updateStock(id, stockQuantity) {
    const response = await axiosClient.patch(`/admin/laptops/${id}/stock`, { stockQuantity });
    return normalizeLaptop(response.data);
  },

  async getTaxonomy(type) {
    const response = await axiosClient.get(`/admin/${type}`);
    return requireArray(response.data, type).map(normalizeTaxonomyItem);
  },

  async saveTaxonomy(type, name, id) {
    const payload = { name };
    const response = id
      ? await axiosClient.put(`/admin/${type}/${id}`, payload)
      : await axiosClient.post(`/admin/${type}`, payload);
    return normalizeTaxonomyItem(response.data);
  },

  async getOrders() {
    const response = await axiosClient.get('/admin/orders');
    return requireArray(response.data, 'danh sách đơn hàng quản trị').map(normalizeOrder);
  },

  async getOrder(id) {
    const response = await axiosClient.get(`/admin/orders/${id}`);
    return normalizeOrder(response.data);
  },

  async updateOrderStatus(id, status) {
    const response = await axiosClient.patch(`/admin/orders/${id}/status`, { status });
    return normalizeOrder(response.data);
  },

  async getSalesReport(fromDate, toDate) {
    const response = await axiosClient.get('/admin/reports/sales', {
      params: { fromDate: fromDate || undefined, toDate: toDate || undefined },
    });
    return {
      ...response.data,
      orders: requireArray(response.data?.orders, 'báo cáo doanh số').map(normalizeOrder),
    };
  },
};
