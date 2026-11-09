# LAPTOPHUB — LAPTOP SHOP MANAGEMENT SYSTEM (SBA301)

Ứng dụng quản lý cửa hàng laptop gồm frontend React/Vite, backend Spring Boot và SQL Server. Frontend sử dụng REST API thật tại `/api/v1`; không lưu catalog, giỏ hàng, wishlist, đơn hàng hay quyền đăng nhập giả trong `localStorage`.

## Use case — màn hình và API

| UC | Use case | Màn hình | API chính |
|---|---|---|---|
| UC-01 | Đăng ký Customer | `/register` | `POST /auth/register` |
| UC-02 | Đăng nhập | `/login` | `POST /auth/login` |
| UC-03 | Đăng xuất | Nút Đăng xuất | `POST /auth/logout` |
| UC-04 | Hồ sơ cá nhân | `/profile` | `GET/PUT /profile` |
| UC-05 | Danh sách / tìm kiếm laptop | `/` | `GET /laptops` |
| UC-06 | Xem chi tiết laptop | `/laptops/:id` | `GET /laptops/{id}` |
| UC-07 | Wishlist | `/wishlist` | `GET/POST/DELETE /wishlist` |
| UC-08 | Giỏ hàng | `/cart` | `GET/POST/PUT/DELETE /cart` |
| UC-09 | Đặt hàng COD | `/checkout` | `POST /orders` |
| UC-10 | Đơn hàng của tôi | `/orders`, `/orders/:id` | `GET /orders/me` |
| UC-11 | Hủy đơn PENDING | `/orders/:id` | `POST /orders/me/{id}/cancel` |
| UC-12 | Xác nhận SHIPPING → COMPLETED | `/orders/:id` | `POST /orders/me/{id}/confirm-received` |
| UC-13 | Quản lý laptop | `/admin/laptops` | `/admin/laptops` |
| UC-14 | Thương hiệu / danh mục | `/admin/brands`, `/admin/categories` | `/admin/brands`, `/admin/categories` |
| UC-15 | Tồn kho | `/admin/inventory` | `PATCH /admin/laptops/{id}/stock` |
| UC-16 | Danh sách đơn toàn cửa hàng | `/admin/orders` | `GET /admin/orders` |
| UC-17 | Xử lý đơn | `/admin/orders/:id` | `/admin/orders/{id}` |
| UC-18 | Báo cáo doanh số | `/admin/reports` | `GET /admin/reports/sales` |

API có tiền tố `/api/v1`. Các API yêu cầu đăng nhập dùng phiên HTTP session, cookie và CSRF token; backend phân quyền bằng Spring Security. Các thao tác đặt hàng, cập nhật trạng thái và tồn kho được kiểm tra ở backend/database, không dựa vào route guard React.

## Khởi chạy

### 1. Cơ sở dữ liệu

Khởi tạo SQL Server `LaptopShopDB` và chạy lần lượt:

1. `database/01_create_database.sql`
2. `database/02_create_tables.sql`
3. `database/03_seed_data.sql`

Hướng dẫn chi tiết và câu lệnh kiểm tra bảng/dữ liệu: [`database/README.md`](database/README.md).

### 2. Backend Spring Boot

Yêu cầu Java 21 và SQL Server đang chạy. Sao chép `laptopshop_be/.env.example` thành `laptopshop_be/.env`, điền thông tin kết nối DB của máy bạn rồi chạy:

```powershell
cd laptopshop_be
.\mvnw.cmd spring-boot:run
```

Backend mặc định lắng nghe tại `http://localhost:8080`; cấu hình datasource nằm trong `.env`, không commit thông tin đăng nhập.

### 3. Frontend React/Vite

Yêu cầu Node.js 20.19+ hoặc 22.12+. Tạo `laptopshop_fe/.env` từ `.env.example` nếu cần đổi URL API, sau đó chạy:

```powershell
cd laptopshop_fe
npm.cmd install
npm.cmd run dev
```

Mở `http://localhost:5173/`. Không mở `index.html` trực tiếp. Vite mặc định chạy ở port 5173; backend CORS hiện cho phép origin này.

## Tài khoản DEMO

| Vai trò | Email | Mật khẩu |
|---|---|---|
| Customer | `khach@laptophub.demo` | `Password123!` |
| Admin | `admin@laptophub.demo` | `Password123!` |

Seed SQL tạo tài khoản Customer/Admin với mật khẩu `Password123!` nếu các tài khoản đó chưa tồn tại. Nếu tài khoản đã tồn tại, script không thay đổi mật khẩu; vì vậy mật khẩu có thể vẫn là `123456` hoặc giá trị đã được đặt trước đó. Mật khẩu trong database được lưu dạng BCrypt hash; frontend không tự xác thực và không lưu mật khẩu/session vào `localStorage`.

## Quy tắc nghiệp vụ chính

- Catalog công khai chỉ trả laptop `ACTIVE`, hỗ trợ tìm kiếm, lọc thương hiệu/danh mục/khoảng giá và sắp xếp giá.
- Wishlist không lưu trùng laptop; giỏ hàng và tồn kho được lưu trong database theo tài khoản.
- Checkout dùng COD, backend kiểm tra stock và tạo đơn `PENDING` cùng snapshot giá/tên sản phẩm trong transaction.
- Customer chỉ đọc/hủy đơn của chính mình; chỉ được hủy `PENDING` và xác nhận nhận hàng khi `SHIPPING`.
- Admin quản lý laptop, thương hiệu, danh mục, tồn kho và đơn hàng; chuyển trạng thái theo `PENDING → CONFIRMED → PACKING → SHIPPING`.
- Báo cáo doanh số lấy từ backend và chỉ tính đơn `COMPLETED` trong khoảng ngày đã chọn.

## Cấu trúc source

```text
laptopshop_fe/src/
  api/                 Axios client, auth, catalog, shopping và admin API
  pages/               Catalog, tài khoản, mua hàng và đơn hàng
  admin/               Màn hình quản trị
  App.jsx              Router, phiên người dùng và đồng bộ dữ liệu API
laptopshop_be/src/main/java/fu/laptopshop/
  config/              CORS, session, CSRF và Spring Security
  common/              Entity, repository, exception và mapper
  modules/              Controller → Service → Repository theo module
database/               SQL tạo schema và dữ liệu demo
```

## Kiểm tra trước khi commit

- Frontend: `cd laptopshop_fe; npm.cmd run build`
- Backend: `cd laptopshop_be; .\mvnw.cmd test`
- Kiểm tra các luồng customer: đăng ký/đăng nhập, giỏ hàng, checkout, xem/hủy/xác nhận đơn.
- Kiểm tra các luồng admin: quản lý sản phẩm, taxonomy, tồn kho, xử lý đơn và báo cáo.
- Kiểm tra desktop/mobile; không commit `node_modules`, `dist` hoặc file `.env`.
