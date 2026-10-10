export function money(number) {
  return Number(number || 0).toLocaleString('vi-VN') + 'đ';
}

export function brandName(brands, id) {
  return brands.find((item) => item.id === Number(id))?.name || 'Không xác định';
}

export function categoryName(categories, id) {
  return categories.find((item) => item.id === Number(id))?.name || 'Không xác định';
}

export function isValidPhone(value) {
  return /^\d{9,11}$/.test(value.trim());
}

export function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export const orderLabels = {
  PENDING: 'Chờ xác nhận',
  CONFIRMED: 'Đã xác nhận',
  PACKING: 'Đang chuẩn bị',
  SHIPPING: 'Đang giao',
  COMPLETED: 'Hoàn tất',
  CANCELLED: 'Đã hủy',
};

export const nextOrderStatus = {
  PENDING: 'CONFIRMED',
  CONFIRMED: 'PACKING',
  PACKING: 'SHIPPING',
};

export function orderVariant(status) {
  return ({ PENDING: 'warning', CONFIRMED: 'info', PACKING: 'primary', SHIPPING: 'primary', COMPLETED: 'success', CANCELLED: 'secondary' })[status] || 'secondary';
}
