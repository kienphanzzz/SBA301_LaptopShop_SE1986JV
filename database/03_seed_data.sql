/* ==========================================================================
   FILE: 03_seed_data.sql
   PROJECT: Laptop Shop Management System (SBA301)
   TARGET DATABASE: LaptopShopDB (SQL Server)
   DESCRIPTION:
     - Dữ liệu mẫu (DEMO SEED DATA) đồng bộ với frontend.
     - Tuyệt đối KHÔNG chứa mật khẩu plaintext hoặc secret; cột password_hash
       chỉ lưu chuỗi BCrypt 60 ký tự hợp lệ ($2a$10$...).
     - Hỗ trợ cả trường hợp laptop có giá cũ (old_price > price) và không có
       giá cũ (old_price IS NULL).
     - Cột image tham chiếu đúng các file SVG thực tế trong public/assets/.
     - Kiểm tra chống trùng từng bản ghi (Idempotent), chạy lại nhiều lần
       không bị lỗi trùng khóa.
   ========================================================================== */

USE [LaptopShopDB];
GO

SET NOCOUNT ON;
GO

/* ==========================================================================
   1. SEED BRANDS (6 thương hiệu mẫu)
   ========================================================================== */
SET IDENTITY_INSERT dbo.brands ON;

INSERT INTO dbo.brands (id, name, description, status)
SELECT v.id, v.name, v.description, v.status
FROM (VALUES
    (1, N'ASUS',   N'[DEMO] Thương hiệu laptop ASUS chính hãng',    'ACTIVE'),
    (2, N'Dell',   N'[DEMO] Thương hiệu laptop Dell bền bỉ',        'ACTIVE'),
    (3, N'Lenovo', N'[DEMO] Thương hiệu laptop Lenovo đa dụng',     'ACTIVE'),
    (4, N'HP',     N'[DEMO] Thương hiệu laptop HP thanh lịch',      'ACTIVE'),
    (5, N'Acer',   N'[DEMO] Thương hiệu laptop Acer hiệu năng cao', 'ACTIVE'),
    (6, N'Apple',  N'[DEMO] Thương hiệu MacBook cao cấp',           'ACTIVE')
) AS v(id, name, description, status)
WHERE NOT EXISTS (
    SELECT 1 FROM dbo.brands b WHERE b.id = v.id OR b.name = v.name
);

SET IDENTITY_INSERT dbo.brands OFF;
PRINT N'Đã kiểm tra / thêm dữ liệu mẫu cho bảng [dbo].[brands].';
GO

/* ==========================================================================
   2. SEED CATEGORIES (4 danh mục mẫu)
   ========================================================================== */
SET IDENTITY_INSERT dbo.categories ON;

INSERT INTO dbo.categories (id, name, description, status)
SELECT v.id, v.name, v.description, v.status
FROM (VALUES
    (1, N'Văn phòng - học tập', N'[DEMO] Laptop phục vụ học tập và công việc văn phòng', 'ACTIVE'),
    (2, N'Gaming',              N'[DEMO] Laptop cấu hình cao chơi game và đồ án nặng',   'ACTIVE'),
    (3, N'Mỏng nhẹ - cao cấp',  N'[DEMO] Laptop sang trọng, pin bền, dễ di chuyển',      'ACTIVE'),
    (4, N'Đồ họa - kỹ thuật',   N'[DEMO] Laptop màn hình chuẩn màu, xử lý kỹ thuật',     'ACTIVE')
) AS v(id, name, description, status)
WHERE NOT EXISTS (
    SELECT 1 FROM dbo.categories c WHERE c.id = v.id OR c.name = v.name
);

SET IDENTITY_INSERT dbo.categories OFF;
PRINT N'Đã kiểm tra / thêm dữ liệu mẫu cho bảng [dbo].[categories].';
GO

/* ==========================================================================
   3. SEED LAPTOPS (8 sản phẩm mẫu đồng bộ với FE và thư mục public/assets)
   ========================================================================== */
SET IDENTITY_INSERT dbo.laptops ON;

INSERT INTO dbo.laptops (
    id, sku, name, brand_id, category_id, specs, description, image, price, old_price, stock_quantity, status
)
SELECT
    v.id, v.sku, v.name, v.brand_id, v.category_id, v.specs, v.description, v.image, v.price, v.old_price, v.stock_quantity, v.status
FROM (VALUES
    (1, 'ASU-VB-001',  N'ASUS Vivobook 15 OLED', 1, 1,
        N'Intel Core i5 • RAM 16GB • SSD 512GB • OLED 15.6 inch',
        N'[DEMO] Màn hình OLED sắc nét, thiết kế gọn gàng phù hợp học tập và công việc hằng ngày.',
        '/assets/laptop-silver.svg', CAST(16490000.00 AS DECIMAL(18,2)), CAST(18990000.00 AS DECIMAL(18,2)), 12, 'ACTIVE'),

    (2, 'LEN-LOQ-002', N'Lenovo LOQ 15 Gaming',  3, 2,
        N'Intel Core i5 • RAM 16GB • SSD 512GB • RTX 4050',
        N'[DEMO] Hiệu năng mạnh cho game, lập trình và các tác vụ nặng.',
        '/assets/laptop-dark.svg',   CAST(21990000.00 AS DECIMAL(18,2)), CAST(25990000.00 AS DECIMAL(18,2)), 7,  'ACTIVE'),

    (3, 'DEL-IN-003',  N'Dell Inspiron 14',      2, 1,
        N'Intel Core i5 • RAM 16GB • SSD 512GB • 14 inch FHD',
        N'[DEMO] Laptop thực dụng, bền bỉ, phù hợp sinh viên và dân văn phòng.',
        '/assets/laptop-blue.svg',   CAST(17990000.00 AS DECIMAL(18,2)), NULL,                                5,  'ACTIVE'),

    (4, 'HP-PAV-004',  N'HP Pavilion 14',        4, 3,
        N'Intel Core i5 • RAM 16GB • SSD 512GB • 14 inch',
        N'[DEMO] Thiết kế thanh lịch, trọng lượng nhẹ, màn hình đẹp.',
        '/assets/laptop-rose.svg',   CAST(19490000.00 AS DECIMAL(18,2)), CAST(21490000.00 AS DECIMAL(18,2)), 9,  'ACTIVE'),

    (5, 'ACE-NIT-005', N'Acer Nitro V 15',       5, 2,
        N'Intel Core i7 • RAM 16GB • SSD 512GB • RTX 4050',
        N'[DEMO] Cấu hình dành cho người thích chơi game và làm đồ án công nghệ.',
        '/assets/laptop-dark.svg',   CAST(23490000.00 AS DECIMAL(18,2)), CAST(26990000.00 AS DECIMAL(18,2)), 4,  'ACTIVE'),

    (6, 'APL-MBA-006', N'MacBook Air 13 M3',     6, 3,
        N'Apple M3 • RAM 16GB • SSD 256GB • 13.6 inch',
        N'[DEMO] Laptop cao cấp, thời lượng pin tốt, phù hợp người cần di chuyển nhiều.',
        '/assets/laptop-silver.svg', CAST(26990000.00 AS DECIMAL(18,2)), CAST(29990000.00 AS DECIMAL(18,2)), 6,  'ACTIVE'),

    (7, 'LEN-THI-007', N'Lenovo ThinkBook 16',   3, 4,
        N'AMD Ryzen 7 • RAM 16GB • SSD 512GB • 16 inch',
        N'[DEMO] Màn hình rộng và hiệu năng ổn định cho công việc chuyên môn.',
        '/assets/laptop-blue.svg',   CAST(19990000.00 AS DECIMAL(18,2)), NULL,                                0,  'ACTIVE'),

    (8, 'DEL-XPS-008', N'Dell XPS 13',           2, 3,
        N'Intel Core Ultra 7 • RAM 16GB • SSD 512GB',
        N'[DEMO] Dòng laptop mỏng nhẹ cao cấp với thiết kế tối giản.',
        '/assets/laptop-rose.svg',   CAST(32990000.00 AS DECIMAL(18,2)), CAST(35990000.00 AS DECIMAL(18,2)), 3,  'ACTIVE')
) AS v(id, sku, name, brand_id, category_id, specs, description, image, price, old_price, stock_quantity, status)
WHERE NOT EXISTS (
    SELECT 1 FROM dbo.laptops l WHERE l.id = v.id OR l.sku = v.sku
);

SET IDENTITY_INSERT dbo.laptops OFF;
PRINT N'Đã kiểm tra / thêm dữ liệu mẫu cho bảng [dbo].[laptops].';
GO

/* ==========================================================================
   4. SEED USERS (2 tài khoản DEMO với chuỗi BCrypt 60 ký tự hợp lệ)
   ========================================================================== */
SET IDENTITY_INSERT dbo.users ON;

INSERT INTO dbo.users (
    id, full_name, email, password_hash, phone, address, role, status
)
SELECT
    v.id, v.full_name, v.email, v.password_hash, v.phone, v.address, v.role, v.status
FROM (VALUES
    (1, N'Nguyễn Minh Anh (Demo Customer)', 'khach@laptophub.demo',
        '$2a$10$tqmuJAw6/imDGf5oHloQqOKTlp4x/wqtgeRtg96KnNP3DObb2I8TS',
        '0912345678', N'Hà Nội (Dữ liệu Demo)', 'CUSTOMER', 'ACTIVE'),

    (2, N'Quản trị cửa hàng (Demo Admin)',  'admin@laptophub.demo',
        '$2a$10$tqmuJAw6/imDGf5oHloQqOKTlp4x/wqtgeRtg96KnNP3DObb2I8TS',
        '0987654321', N'Hà Nội (Dữ liệu Demo)', 'ADMIN',    'ACTIVE')
) AS v(id, full_name, email, password_hash, phone, address, role, status)
WHERE NOT EXISTS (
    SELECT 1 FROM dbo.users u WHERE u.id = v.id OR u.email = v.email
);

UPDATE dbo.users
SET password_hash = '$2a$10$tqmuJAw6/imDGf5oHloQqOKTlp4x/wqtgeRtg96KnNP3DObb2I8TS'
WHERE (email = 'khach@laptophub.demo'
       AND password_hash = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy')
   OR (email = 'admin@laptophub.demo'
       AND password_hash = '$2a$10$Dow1z0y2B8E6x3q7K9v5mO8pR4tW1uY6iA3sD5fG7hJ9kL2zX4cV6');

SET IDENTITY_INSERT dbo.users OFF;
PRINT N'Đã kiểm tra / thêm dữ liệu mẫu cho bảng [dbo].[users].';
GO

/* ==========================================================================
   5. SEED WISHLIST_ITEMS (Dữ liệu mẫu của Customer #1)
   ========================================================================== */
INSERT INTO dbo.wishlist_items (user_id, laptop_id)
SELECT v.user_id, v.laptop_id
FROM (VALUES
    (1, 2)
) AS v(user_id, laptop_id)
WHERE NOT EXISTS (
    SELECT 1 FROM dbo.wishlist_items w
    WHERE w.user_id = v.user_id AND w.laptop_id = v.laptop_id
);
PRINT N'Đã kiểm tra / thêm dữ liệu mẫu cho bảng [dbo].[wishlist_items].';
GO

/* ==========================================================================
   6. SEED ORDERS & ORDER_ITEMS (3 đơn hàng mẫu: PENDING, SHIPPING, COMPLETED)
   ========================================================================== */
SET IDENTITY_INSERT dbo.orders ON;

INSERT INTO dbo.orders (
    id, user_id, order_date, receiver_name, phone, address, payment_method, total_amount, status
)
SELECT
    v.id, v.user_id, v.order_date, v.receiver_name, v.phone, v.address, v.payment_method, v.total_amount, v.status
FROM (VALUES
    (1001, 1, CAST('2026-10-06T09:00:00' AS DATETIME2), N'Nguyễn Minh Anh', '0912345678', N'Hà Nội (Demo)', 'COD', CAST(16490000.00 AS DECIMAL(18,2)), 'PENDING'),
    (1002, 1, CAST('2026-10-04T14:30:00' AS DATETIME2), N'Nguyễn Minh Anh', '0912345678', N'Hà Nội (Demo)', 'COD', CAST(21990000.00 AS DECIMAL(18,2)), 'SHIPPING'),
    (1003, 1, CAST('2026-09-29T10:15:00' AS DATETIME2), N'Nguyễn Minh Anh', '0912345678', N'Hà Nội (Demo)', 'COD', CAST(17990000.00 AS DECIMAL(18,2)), 'COMPLETED')
) AS v(id, user_id, order_date, receiver_name, phone, address, payment_method, total_amount, status)
WHERE NOT EXISTS (
    SELECT 1 FROM dbo.orders o WHERE o.id = v.id
);

SET IDENTITY_INSERT dbo.orders OFF;

INSERT INTO dbo.order_items (
    order_id, laptop_id, product_name, unit_price, quantity
)
SELECT
    v.order_id, v.laptop_id, v.product_name, v.unit_price, v.quantity
FROM (VALUES
    (1001, 1, N'ASUS Vivobook 15 OLED', CAST(16490000.00 AS DECIMAL(18,2)), 1),
    (1002, 2, N'Lenovo LOQ 15 Gaming',  CAST(21990000.00 AS DECIMAL(18,2)), 1),
    (1003, 3, N'Dell Inspiron 14',      CAST(17990000.00 AS DECIMAL(18,2)), 1)
) AS v(order_id, laptop_id, product_name, unit_price, quantity)
WHERE NOT EXISTS (
    SELECT 1 FROM dbo.order_items oi
    WHERE oi.order_id = v.order_id AND oi.laptop_id = v.laptop_id
);

PRINT N'Đã kiểm tra / thêm dữ liệu mẫu cho bảng [dbo].[orders] và [dbo].[order_items].';
GO
