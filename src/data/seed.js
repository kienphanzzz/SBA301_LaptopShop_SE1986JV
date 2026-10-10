// Dữ liệu mẫu để thực hành UI. Khi có Spring Boot, dữ liệu sẽ lấy từ REST API.
export const initialData = {
  brands: [
    { id: 1, name: 'ASUS', status: 'ACTIVE' },
    { id: 2, name: 'Dell', status: 'ACTIVE' },
    { id: 3, name: 'Lenovo', status: 'ACTIVE' },
    { id: 4, name: 'HP', status: 'ACTIVE' },
    { id: 5, name: 'Acer', status: 'ACTIVE' },
    { id: 6, name: 'Apple', status: 'ACTIVE' },
  ],
  categories: [
    { id: 1, name: 'Văn phòng - học tập', status: 'ACTIVE' },
    { id: 2, name: 'Gaming', status: 'ACTIVE' },
    { id: 3, name: 'Mỏng nhẹ - cao cấp', status: 'ACTIVE' },
    { id: 4, name: 'Đồ họa - kỹ thuật', status: 'ACTIVE' },
  ],
  products: [
    { id: 1, sku: 'ASU-VB-001', name: 'ASUS Vivobook 15 OLED', brandId: 1, categoryId: 1, price: 16490000, oldPrice: 18990000, stockQuantity: 12, status: 'ACTIVE', image: '/assets/laptop-silver.svg', description: 'Màn hình OLED sắc nét, thiết kế gọn gàng phù hợp học tập và công việc hằng ngày.', specs: 'Intel Core i5 • RAM 16GB • SSD 512GB • OLED 15.6 inch' },
    { id: 2, sku: 'LEN-LOQ-002', name: 'Lenovo LOQ 15 Gaming', brandId: 3, categoryId: 2, price: 21990000, oldPrice: 25990000, stockQuantity: 7, status: 'ACTIVE', image: '/assets/laptop-dark.svg', description: 'Hiệu năng mạnh cho game, lập trình và các tác vụ nặng.', specs: 'Intel Core i5 • RAM 16GB • SSD 512GB • RTX 4050' },
    { id: 3, sku: 'DEL-IN-003', name: 'Dell Inspiron 14', brandId: 2, categoryId: 1, price: 17990000, oldPrice: 19990000, stockQuantity: 5, status: 'ACTIVE', image: '/assets/laptop-blue.svg', description: 'Laptop thực dụng, bền bỉ, phù hợp sinh viên và dân văn phòng.', specs: 'Intel Core i5 • RAM 16GB • SSD 512GB • 14 inch FHD' },
    { id: 4, sku: 'HP-PAV-004', name: 'HP Pavilion 14', brandId: 4, categoryId: 3, price: 19490000, oldPrice: 21490000, stockQuantity: 9, status: 'ACTIVE', image: '/assets/laptop-rose.svg', description: 'Thiết kế thanh lịch, trọng lượng nhẹ, màn hình đẹp.', specs: 'Intel Core i5 • RAM 16GB • SSD 512GB • 14 inch' },
    { id: 5, sku: 'ACE-NIT-005', name: 'Acer Nitro V 15', brandId: 5, categoryId: 2, price: 23490000, oldPrice: 26990000, stockQuantity: 4, status: 'ACTIVE', image: '/assets/laptop-dark.svg', description: 'Cấu hình dành cho người thích chơi game và làm đồ án công nghệ.', specs: 'Intel Core i7 • RAM 16GB • SSD 512GB • RTX 4050' },
    { id: 6, sku: 'APL-MBA-006', name: 'MacBook Air 13 M3', brandId: 6, categoryId: 3, price: 26990000, oldPrice: 29990000, stockQuantity: 6, status: 'ACTIVE', image: '/assets/laptop-silver.svg', description: 'Laptop cao cấp, thời lượng pin tốt, phù hợp người cần di chuyển nhiều.', specs: 'Apple M3 • RAM 16GB • SSD 256GB • 13.6 inch' },
    { id: 7, sku: 'LEN-THI-007', name: 'Lenovo ThinkBook 16', brandId: 3, categoryId: 4, price: 19990000, oldPrice: 22490000, stockQuantity: 0, status: 'ACTIVE', image: '/assets/laptop-blue.svg', description: 'Màn hình rộng và hiệu năng ổn định cho công việc chuyên môn.', specs: 'AMD Ryzen 7 • RAM 16GB • SSD 512GB • 16 inch' },
    { id: 8, sku: 'DEL-XPS-008', name: 'Dell XPS 13', brandId: 2, categoryId: 3, price: 32990000, oldPrice: 35990000, stockQuantity: 3, status: 'ACTIVE', image: '/assets/laptop-rose.svg', description: 'Dòng laptop mỏng nhẹ cao cấp với thiết kế tối giản.', specs: 'Intel Core Ultra 7 • RAM 16GB • SSD 512GB' },
  ],
  users: [
    { id: 1, fullName: 'Nguyễn Minh Anh', email: 'khach@laptophub.demo', phone: '0912345678', address: 'Hà Nội', role: 'CUSTOMER', status: 'ACTIVE' },
    { id: 2, fullName: 'Quản trị cửa hàng', email: 'admin@laptophub.demo', phone: '0987654321', address: 'Hà Nội', role: 'ADMIN', status: 'ACTIVE' },
  ],
  cart: { '1': [] },
  wishlist: { '1': [2] },
  orders: [
    { id: 1001, userId: 1, orderDate: '2026-10-06', receiverName: 'Nguyễn Minh Anh', phone: '0912345678', address: 'Hà Nội', paymentMethod: 'COD', status: 'PENDING', totalAmount: 16490000, items: [{ laptopId: 1, productName: 'ASUS Vivobook 15 OLED', unitPrice: 16490000, quantity: 1 }] },
    { id: 1002, userId: 1, orderDate: '2026-10-04', receiverName: 'Nguyễn Minh Anh', phone: '0912345678', address: 'Hà Nội', paymentMethod: 'COD', status: 'SHIPPING', totalAmount: 21990000, items: [{ laptopId: 2, productName: 'Lenovo LOQ 15 Gaming', unitPrice: 21990000, quantity: 1 }] },
    { id: 1003, userId: 1, orderDate: '2026-09-29', receiverName: 'Nguyễn Minh Anh', phone: '0912345678', address: 'Hà Nội', paymentMethod: 'COD', status: 'COMPLETED', totalAmount: 17990000, items: [{ laptopId: 3, productName: 'Dell Inspiron 14', unitPrice: 17990000, quantity: 1 }] },
  ],
};
