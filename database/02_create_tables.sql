/* ==========================================================================
   FILE: 02_create_tables.sql
   PROJECT: Laptop Shop Management System (SBA301 - 18 Use Cases)
   TARGET DATABASE: LaptopShopDB (SQL Server)
   DESCRIPTION:
     - Tạo 8 bảng chuẩn hóa dùng chung cho cả 3 thành viên (UC-01 -> UC-18):
       1. users
       2. brands
       3. categories
       4. laptops
       5. wishlist_items
       6. cart_items
       7. orders
       8. order_items
     - Kiểm tra sự tồn tại trước khi tạo, KHÔNG DROP hoặc xóa bảng hiện có.
     - Toàn bộ khóa ngoại dùng ON DELETE NO ACTION để ngăn xóa cứng dữ liệu
       đang được bảng khác tham chiếu (BR-22, NFR 8.4).
   ========================================================================== */

IF DB_ID(N'LaptopShopDB') IS NULL
BEGIN
    RAISERROR(N'Database [LaptopShopDB] chưa tồn tại. Vui lòng chạy 01_create_database.sql trước.', 16, 1);
    RETURN;
END
GO

USE [LaptopShopDB];
GO

/* ==========================================================================
   1. BẢNG USERS (UC-01, UC-02, UC-03, UC-04 | BR-01..BR-06)
   - email dùng COLLATE SQL_Latin1_General_CP1_CI_AS (Case-Insensitive) kết hợp
     UQ_users_email để đảm bảo kiểm tra trùng email không phân biệt hoa/thường.
   - password_hash bắt buộc định dạng BCrypt 60 ký tự ($2a$/$2b$/$2y$).
   ========================================================================== */
IF OBJECT_ID(N'dbo.users', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.users (
        id              BIGINT          IDENTITY(1,1)   NOT NULL,
        full_name       NVARCHAR(150)                   NOT NULL,
        email           VARCHAR(150) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
        password_hash   VARCHAR(255)                    NOT NULL,
        phone           VARCHAR(20)                     NOT NULL,
        address         NVARCHAR(500)                   NULL,
        role            VARCHAR(20)                     NOT NULL
            CONSTRAINT DF_users_role DEFAULT ('CUSTOMER'),
        status          VARCHAR(20)                     NOT NULL
            CONSTRAINT DF_users_status DEFAULT ('ACTIVE'),
        created_at      DATETIME2                       NOT NULL
            CONSTRAINT DF_users_created_at DEFAULT (SYSDATETIME()),
        updated_at      DATETIME2                       NULL,

        CONSTRAINT PK_users PRIMARY KEY (id),
        CONSTRAINT UQ_users_email UNIQUE (email),
        CONSTRAINT CK_users_email_not_blank CHECK (LTRIM(RTRIM(email)) <> '' AND email LIKE '%_@__%.__%'),
        CONSTRAINT CK_users_password_hash_bcrypt CHECK (LEN(password_hash) = 60 AND password_hash LIKE '$2[aby]$[0-9][0-9]$%'),
        CONSTRAINT CK_users_role CHECK (role IN ('CUSTOMER', 'ADMIN')),
        CONSTRAINT CK_users_status CHECK (status IN ('ACTIVE', 'INACTIVE'))
    );
    PRINT N'Đã tạo bảng [dbo].[users].';
END
ELSE
BEGIN
    PRINT N'Bảng [dbo].[users] đã tồn tại. Bỏ qua.';
END
GO

/* ==========================================================================
   2. BẢNG BRANDS (UC-05, UC-06, UC-13, UC-14 | BR-22)
   ========================================================================== */
IF OBJECT_ID(N'dbo.brands', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.brands (
        id              BIGINT          IDENTITY(1,1)   NOT NULL,
        name            NVARCHAR(100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
        description     NVARCHAR(500)                   NULL,
        status          VARCHAR(20)                     NOT NULL
            CONSTRAINT DF_brands_status DEFAULT ('ACTIVE'),
        created_at      DATETIME2                       NOT NULL
            CONSTRAINT DF_brands_created_at DEFAULT (SYSDATETIME()),
        updated_at      DATETIME2                       NULL,

        CONSTRAINT PK_brands PRIMARY KEY (id),
        CONSTRAINT UQ_brands_name UNIQUE (name),
        CONSTRAINT CK_brands_status CHECK (status IN ('ACTIVE', 'INACTIVE'))
    );
    PRINT N'Đã tạo bảng [dbo].[brands].';
END
ELSE
BEGIN
    PRINT N'Bảng [dbo].[brands] đã tồn tại. Bỏ qua.';
END
GO

/* ==========================================================================
   3. BẢNG CATEGORIES (UC-05, UC-06, UC-13, UC-14 | BR-22)
   ========================================================================== */
IF OBJECT_ID(N'dbo.categories', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.categories (
        id              BIGINT          IDENTITY(1,1)   NOT NULL,
        name            NVARCHAR(100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
        description     NVARCHAR(500)                   NULL,
        status          VARCHAR(20)                     NOT NULL
            CONSTRAINT DF_categories_status DEFAULT ('ACTIVE'),
        created_at      DATETIME2                       NOT NULL
            CONSTRAINT DF_categories_created_at DEFAULT (SYSDATETIME()),
        updated_at      DATETIME2                       NULL,

        CONSTRAINT PK_categories PRIMARY KEY (id),
        CONSTRAINT UQ_categories_name UNIQUE (name),
        CONSTRAINT CK_categories_status CHECK (status IN ('ACTIVE', 'INACTIVE'))
    );
    PRINT N'Đã tạo bảng [dbo].[categories].';
END
ELSE
BEGIN
    PRINT N'Bảng [dbo].[categories] đã tồn tại. Bỏ qua.';
END
GO

/* ==========================================================================
   4. BẢNG LAPTOPS (UC-05, UC-06, UC-13, UC-15 | BR-07..BR-09, BR-20..BR-23)
   - old_price mặc định NULL khi không có giá cũ; nếu có phải > 0.
   - image mặc định NULL khi chưa gắn ảnh (không gán cứng 1 ảnh giả cho mọi máy).
   ========================================================================== */
IF OBJECT_ID(N'dbo.laptops', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.laptops (
        id              BIGINT          IDENTITY(1,1)   NOT NULL,
        sku             VARCHAR(50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
        name            NVARCHAR(255)                   NOT NULL,
        brand_id        BIGINT                          NOT NULL,
        category_id     BIGINT                          NOT NULL,
        specs           NVARCHAR(500)                   NOT NULL,
        description     NVARCHAR(MAX)                   NULL,
        image           VARCHAR(500)                    NULL,
        price           DECIMAL(18, 2)                  NOT NULL,
        old_price       DECIMAL(18, 2)                  NULL,
        stock_quantity  INT                             NOT NULL
            CONSTRAINT DF_laptops_stock_quantity DEFAULT (0),
        status          VARCHAR(20)                     NOT NULL
            CONSTRAINT DF_laptops_status DEFAULT ('ACTIVE'),
        created_at      DATETIME2                       NOT NULL
            CONSTRAINT DF_laptops_created_at DEFAULT (SYSDATETIME()),
        updated_at      DATETIME2                       NULL,

        CONSTRAINT PK_laptops PRIMARY KEY (id),
        CONSTRAINT UQ_laptops_sku UNIQUE (sku),
        CONSTRAINT FK_laptops_brands FOREIGN KEY (brand_id)
            REFERENCES dbo.brands (id) ON DELETE NO ACTION,
        CONSTRAINT FK_laptops_categories FOREIGN KEY (category_id)
            REFERENCES dbo.categories (id) ON DELETE NO ACTION,
        CONSTRAINT CK_laptops_price CHECK (price > 0),
        CONSTRAINT CK_laptops_old_price CHECK (old_price IS NULL OR old_price > 0),
        CONSTRAINT CK_laptops_stock_quantity CHECK (stock_quantity >= 0),
        CONSTRAINT CK_laptops_status CHECK (status IN ('ACTIVE', 'INACTIVE'))
    );
    PRINT N'Đã tạo bảng [dbo].[laptops].';
END
ELSE
BEGIN
    PRINT N'Bảng [dbo].[laptops] đã tồn tại. Bỏ qua.';
END
GO

/* ==========================================================================
   5. BẢNG WISHLIST_ITEMS (UC-07 | BR-10)
   ========================================================================== */
IF OBJECT_ID(N'dbo.wishlist_items', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.wishlist_items (
        id              BIGINT          IDENTITY(1,1)   NOT NULL,
        user_id         BIGINT                          NOT NULL,
        laptop_id       BIGINT                          NOT NULL,
        created_at      DATETIME2                       NOT NULL
            CONSTRAINT DF_wishlist_items_created_at DEFAULT (SYSDATETIME()),

        CONSTRAINT PK_wishlist_items PRIMARY KEY (id),
        CONSTRAINT UQ_wishlist_items_user_laptop UNIQUE (user_id, laptop_id),
        CONSTRAINT FK_wishlist_items_users FOREIGN KEY (user_id)
            REFERENCES dbo.users (id) ON DELETE NO ACTION,
        CONSTRAINT FK_wishlist_items_laptops FOREIGN KEY (laptop_id)
            REFERENCES dbo.laptops (id) ON DELETE NO ACTION
    );
    PRINT N'Đã tạo bảng [dbo].[wishlist_items].';
END
ELSE
BEGIN
    PRINT N'Bảng [dbo].[wishlist_items] đã tồn tại. Bỏ qua.';
END
GO

/* ==========================================================================
   6. BẢNG CART_ITEMS (UC-08, UC-09 | BR-11, BR-12)
   ========================================================================== */
IF OBJECT_ID(N'dbo.cart_items', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.cart_items (
        id              BIGINT          IDENTITY(1,1)   NOT NULL,
        user_id         BIGINT                          NOT NULL,
        laptop_id       BIGINT                          NOT NULL,
        quantity        INT                             NOT NULL,
        created_at      DATETIME2                       NOT NULL
            CONSTRAINT DF_cart_items_created_at DEFAULT (SYSDATETIME()),
        updated_at      DATETIME2                       NULL,

        CONSTRAINT PK_cart_items PRIMARY KEY (id),
        CONSTRAINT UQ_cart_items_user_laptop UNIQUE (user_id, laptop_id),
        CONSTRAINT FK_cart_items_users FOREIGN KEY (user_id)
            REFERENCES dbo.users (id) ON DELETE NO ACTION,
        CONSTRAINT FK_cart_items_laptops FOREIGN KEY (laptop_id)
            REFERENCES dbo.laptops (id) ON DELETE NO ACTION,
        CONSTRAINT CK_cart_items_quantity CHECK (quantity > 0)
    );
    PRINT N'Đã tạo bảng [dbo].[cart_items].';
END
ELSE
BEGIN
    PRINT N'Bảng [dbo].[cart_items] đã tồn tại. Bỏ qua.';
END
GO

/* ==========================================================================
   7. BẢNG ORDERS (UC-09..UC-12, UC-16..UC-18 | BR-14..BR-19, BR-24..BR-28)
   ========================================================================== */
IF OBJECT_ID(N'dbo.orders', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.orders (
        id              BIGINT          IDENTITY(1001,1) NOT NULL,
        user_id         BIGINT                           NOT NULL,
        order_date      DATETIME2                        NOT NULL
            CONSTRAINT DF_orders_order_date DEFAULT (SYSDATETIME()),
        receiver_name   NVARCHAR(150)                    NOT NULL,
        phone           VARCHAR(20)                      NOT NULL,
        address         NVARCHAR(500)                    NOT NULL,
        payment_method  VARCHAR(30)                      NOT NULL
            CONSTRAINT DF_orders_payment_method DEFAULT ('COD'),
        total_amount    DECIMAL(18, 2)                   NOT NULL,
        status          VARCHAR(20)                      NOT NULL
            CONSTRAINT DF_orders_status DEFAULT ('PENDING'),
        created_at      DATETIME2                        NOT NULL
            CONSTRAINT DF_orders_created_at DEFAULT (SYSDATETIME()),
        updated_at      DATETIME2                        NULL,

        CONSTRAINT PK_orders PRIMARY KEY (id),
        CONSTRAINT FK_orders_users FOREIGN KEY (user_id)
            REFERENCES dbo.users (id) ON DELETE NO ACTION,
        CONSTRAINT CK_orders_payment_method CHECK (payment_method IN ('COD')),
        CONSTRAINT CK_orders_total_amount CHECK (total_amount >= 0),
        CONSTRAINT CK_orders_status CHECK (
            status IN ('PENDING', 'CONFIRMED', 'PACKING', 'SHIPPING', 'COMPLETED', 'CANCELLED')
        )
    );
    PRINT N'Đã tạo bảng [dbo].[orders].';
END
ELSE
BEGIN
    PRINT N'Bảng [dbo].[orders] đã tồn tại. Bỏ qua.';
END
GO

/* ==========================================================================
   8. BẢNG ORDER_ITEMS (UC-09, UC-10, UC-11, UC-16, UC-18 | BR-11, BR-13, BR-14)
   ========================================================================== */
IF OBJECT_ID(N'dbo.order_items', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.order_items (
        id              BIGINT          IDENTITY(1,1)   NOT NULL,
        order_id        BIGINT                          NOT NULL,
        laptop_id       BIGINT                          NOT NULL,
        product_name    NVARCHAR(255)                   NOT NULL,
        unit_price      DECIMAL(18, 2)                  NOT NULL,
        quantity        INT                             NOT NULL,

        CONSTRAINT PK_order_items PRIMARY KEY (id),
        CONSTRAINT FK_order_items_orders FOREIGN KEY (order_id)
            REFERENCES dbo.orders (id) ON DELETE NO ACTION,
        CONSTRAINT FK_order_items_laptops FOREIGN KEY (laptop_id)
            REFERENCES dbo.laptops (id) ON DELETE NO ACTION,
        CONSTRAINT CK_order_items_unit_price CHECK (unit_price > 0),
        CONSTRAINT CK_order_items_quantity CHECK (quantity > 0)
    );
    PRINT N'Đã tạo bảng [dbo].[order_items].';
END
ELSE
BEGIN
    PRINT N'Bảng [dbo].[order_items] đã tồn tại. Bỏ qua.';
END
GO

/* ==========================================================================
   INDEX HỖ TRỢ TÌM KIẾM & BÁO CÁO (NFR 8.2 Performance)
   ========================================================================== */
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_laptops_brand_category_status' AND object_id = OBJECT_ID(N'dbo.laptops'))
BEGIN
    CREATE INDEX IX_laptops_brand_category_status
        ON dbo.laptops (status, brand_id, category_id);
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_orders_user_status_date' AND object_id = OBJECT_ID(N'dbo.orders'))
BEGIN
    CREATE INDEX IX_orders_user_status_date
        ON dbo.orders (user_id, status, order_date DESC);
END
GO
