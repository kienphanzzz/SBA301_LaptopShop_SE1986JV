# Hướng Dẫn Khởi Tạo & Xác Minh Database `LaptopShopDB` (SQL Server)

Tài liệu này hướng dẫn 3 thành viên trong nhóm đồ án **SBA301 — Laptop Shop Management System** khởi tạo và kiểm tra cơ sở dữ liệu chung `LaptopShopDB` trên **Microsoft SQL Server** bằng **SQL Server Management Studio (SSMS)** hoặc **SQLCMD**.

---

## 1. Danh sách file SQL trong thư mục `database/`

| Thứ tự | File | Mục đích |
| :---: | :--- | :--- |
| **1** | `01_create_database.sql` | Kiểm tra và tạo mới database `LaptopShopDB` nếu chưa tồn tại (không xóa hay ghi đè DB cũ). |
| **2** | `02_create_tables.sql` | Tạo 8 bảng chuẩn hóa (`users`, `brands`, `categories`, `laptops`, `wishlist_items`, `cart_items`, `orders`, `order_items`) cùng đầy đủ `PK`, `FK`, `UNIQUE`, `CHECK` và `INDEX`. |
| **3** | `03_seed_data.sql` | Chèn dữ liệu mẫu (được đánh dấu `[DEMO]`, mật khẩu chỉ lưu dạng BCrypt hash) đồng bộ với giao diện React. |

---

## 2. Cách chạy bằng SQL Server Management Studio (SSMS)

1. Mở **SQL Server Management Studio (SSMS)**.
2. Tại cửa sổ **Connect to Server**:
   - **Server type**: `Database Engine`
   - **Server name**: `.\SQLEXPRESS` (hoặc `DESKTOP-O816I4B\SQLEXPRESS` / `localhost`)
   - **Authentication**: `Windows Authentication` (hoặc `SQL Server Authentication` của máy bạn).
   - Nhấn **Connect**.
3. Mở và chạy lần lượt 3 file theo đúng thứ tự:
   - Vào **File -> Open -> File...**, chọn `database/01_create_database.sql` -> nhấn **Execute (F5)**.
   - Mở `database/02_create_tables.sql` -> nhấn **Execute (F5)**.
   - Mở `database/03_seed_data.sql` -> nhấn **Execute (F5)**.
4. Nhấn chuột phải vào thư mục **Databases** ở cột **Object Explorer** bên trái -> chọn **Refresh**, bạn sẽ thấy `LaptopShopDB` và 8 bảng bên trong mục **Tables**.

---

## 3. Cách chạy nhanh bằng Terminal (`sqlcmd`)

Nếu máy đã cài sẵn `sqlcmd` và dùng quyền Windows Authentication:

```powershell
sqlcmd -S ".\SQLEXPRESS" -E -i "database/01_create_database.sql" -C
sqlcmd -S ".\SQLEXPRESS" -E -i "database/02_create_tables.sql" -C
sqlcmd -S ".\SQLEXPRESS" -E -i "database/03_seed_data.sql" -C
```

---

## 4. Truy vấn xác minh trong SSMS sau khi chạy

Mở một **New Query** trên database `LaptopShopDB` và chạy đoạn kiểm tra sau:

```sql
USE [LaptopShopDB];
GO

-- 1. Kiểm tra danh sách 8 bảng đã tạo
SELECT TABLE_SCHEMA, TABLE_NAME
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_TYPE = 'BASE TABLE'
ORDER BY TABLE_NAME;

-- 2. Kiểm tra danh sách các Foreign Key (Khóa ngoại)
SELECT
    fk.name AS ForeignKeyName,
    OBJECT_NAME(fk.parent_object_id) AS ChildTable,
    COL_NAME(fkc.parent_object_id, fkc.parent_column_id) AS ChildColumn,
    OBJECT_NAME(fk.referenced_object_id) AS ReferencedTable,
    COL_NAME(fkc.referenced_object_id, fkc.referenced_column_id) AS ReferencedColumn,
    fk.delete_referential_action_desc AS OnDeleteAction
FROM sys.foreign_keys fk
INNER JOIN sys.foreign_key_columns fkc ON fk.object_id = fkc.constraint_object_id
ORDER BY ChildTable, ForeignKeyName;

-- 3. Kiểm tra các ràng buộc UNIQUE và CHECK
SELECT
    tc.TABLE_NAME,
    tc.CONSTRAINT_NAME,
    tc.CONSTRAINT_TYPE
FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS tc
WHERE tc.CONSTRAINT_TYPE IN ('PRIMARY KEY', 'UNIQUE', 'CHECK')
ORDER BY tc.TABLE_NAME, tc.CONSTRAINT_TYPE;

-- 4. Kiểm tra số lượng bản ghi mẫu trong 8 bảng
SELECT 'users' AS TableName, COUNT(*) AS TotalRows FROM dbo.users
UNION ALL SELECT 'brands', COUNT(*) FROM dbo.brands
UNION ALL SELECT 'categories', COUNT(*) FROM dbo.categories
UNION ALL SELECT 'laptops', COUNT(*) FROM dbo.laptops
UNION ALL SELECT 'wishlist_items', COUNT(*) FROM dbo.wishlist_items
UNION ALL SELECT 'cart_items', COUNT(*) FROM dbo.cart_items
UNION ALL SELECT 'orders', COUNT(*) FROM dbo.orders
UNION ALL SELECT 'order_items', COUNT(*) FROM dbo.order_items;
```

---

## 5. Cách xem Sơ đồ ERD (Database Diagram) trong SSMS

1. Trong **Object Explorer**, mở rộng **Databases -> LaptopShopDB**.
2. Nhấn chuột phải vào **Database Diagrams** -> chọn **New Database Diagram** (nếu SSMS hỏi tạo support objects, chọn **Yes**).
3. Chọn cả 8 bảng (`brands`, `cart_items`, `categories`, `laptops`, `order_items`, `orders`, `users`, `wishlist_items`) -> nhấn **Add** -> **Close**.
4. Nhấn chuột phải vào vùng trống -> chọn **Arrange Tables** để xem sơ đồ quan hệ khóa ngoại trực quan.

---

## 6. Cấu hình kết nối an toàn trong Spring Boot (Theo mẫu `talenthub_be` của cô)

Không lưu mật khẩu trực tiếp trong `application.yaml` hay commit lên Git. Tạo file `.env` ở thư mục gốc của project Backend (và thêm `.env` vào `.gitignore`):

```properties
DB_URL=jdbc:sqlserver://localhost:1433;databaseName=LaptopShopDB;encrypt=true;trustServerCertificate=true
DB_USERNAME=<ten_dang_nhap_sql_cua_ban>
DB_PASSWORD=<mat_khau_sql_cua_ban>
JPA_DDL_AUTO=validate
```
