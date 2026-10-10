# LAPTOPHUB — LAPTOP SHOP MANAGEMENT SYSTEM (SBA301)

**PHASE 1 / WEEK 6: FRONTEND UI** — phong cách cửa hàng công nghệ tông đỏ. Source này được làm theo nội dung tài liệu `LaptopShop.docx` người dùng cung cấp (18 use case; 3 nhóm module) và thông báo Classroom hoàn thành UI/FrontEnd trước 18/10.

## Chạy bằng VS Code

1. Mở nguyên folder `laptopshop_fe` bằng VS Code (nơi có `package.json`).
2. Mở Terminal và chạy:
   ```bash
   npm install
   npm run dev
   ```
   Nếu PowerShell trên Windows chặn `npm`, chạy `npm.cmd install` và `npm.cmd run dev`.
3. Mở **http://localhost:5173/**.

Yêu cầu Node.js 20.19+ hoặc 22.12+ (Vite 7). **Không mở `index.html` trực tiếp**.

## Tài khoản DEMO

| Vai trò | Email | Mật khẩu demo |
|---|---|---|
| Customer | `khach@laptophub.demo` | `123456` |
| Admin | `admin@laptophub.demo` | `123456` |

Nhấn "Điền tài khoản" trong `/login`, sau đó nhấn Đăng nhập. Đây **không phải cơ chế xác thực an toàn**, chỉ để nhóm kiểm tra UI trước khi có backend.

## Use Case — màn hình tương ứng

| UC | Use Case | Route demo |
|---|---|---|
| UC-01 | Đăng ký (Customer) | `/register` |
| UC-02 | Đăng nhập | `/login` |
| UC-03 | Đăng xuất | Nút Đăng xuất ở header |
| UC-04 | Hồ sơ cá nhân | `/profile` |
| UC-05 | Danh sách / tìm kiếm laptop | `/` |
| UC-06 | Xem chi tiết laptop | `/laptops/:id` |
| UC-07 | Wishlist | `/wishlist` |
| UC-08 | Giỏ hàng | `/cart` |
| UC-09 | Đặt hàng COD | `/checkout` |
| UC-10 | Đơn hàng của tôi | `/orders`, `/orders/:id` |
| UC-11 | Hủy đơn PENDING | `/orders/:id` |
| UC-12 | Xác nhận SHIPPING → COMPLETED | `/orders/:id` |
| UC-13 | Quản lý laptop | `/admin/laptops` |
| UC-14 | Thương hiệu / danh mục | `/admin/brands`, `/admin/categories` |
| UC-15 | Tồn kho | `/admin/inventory` |
| UC-16 | Danh sách đơn toàn cửa hàng | `/admin/orders` |
| UC-17 | Xử lý đơn | `/admin/orders/:id` |
| UC-18 | Báo cáo doanh số | `/admin/reports` |

## Thực hành nghiệp vụ cơ bản đang mô phỏng trên frontend

- Catalog chỉ hiển thị laptop `ACTIVE`, lọc từ khóa / brand / category / khoảng giá.
- Wishlist không thêm cùng 1 laptop 2 lần.
- Giỏ hàng không cho thêm laptop INACTIVE / hết hàng, số lượng tối đa bằng tồn kho.
- Checkout COD: kiểm tra thông tin giao hàng, lưu snapshot giá và tên laptop, trừ stock, tạo đơn `PENDING`, làm trống giỏ.
- Customer chỉ xem đơn của mình; hủy `PENDING` hoàn kho; xác nhận nhận hàng khi `SHIPPING`.
- Admin thêm/sửa/ngừng bán laptop, SKU không trùng, giá > 0, tồn kho nguyên không âm.
- Admin xử lý theo `PENDING → CONFIRMED → PACKING → SHIPPING`; chỉ Customer chuyển từ `SHIPPING` sang `COMPLETED`.
- Doanh số chỉ tính đơn `COMPLETED` theo khoảng ngày.

**Quan trọng:** Việc đổi stock cùng order trong một `setState()` không thay thế transaction ACID của database. Các quy tắc nghiệp vụ và phân quyền **bắt buộc phải kiểm tra lại tại Spring Boot**, không thể dùng route guard phía React thay thế kiểm tra role ở API.

## Công nghệ đúng mức SBA301

- React Function Components, Props, JSX
- `useState`, `useEffect`, `.map()`, `.filter()`, `.reduce()`, `onChange`, `onClick`
- React Router DOM: `Routes`, `Route`, `useNavigate`, `useParams`, `Link`
- React-Bootstrap: Container / Form / Table / Button / Modal / Alert / Card / Badge
- Vite 7, JavaScript. `axios` được khai báo dependency để chuyển sang REST API ở Phase tiếp theo, **chưa gọi API thật**.
- Không có Redux, Next.js, Zustand, TypeScript, payment gateway, chat, review, khuyến mại phức tạp.

## Cấu trúc code dễ đọc

```
src/
  main.jsx                 render React
  App.jsx                  Router + các hàm nghiệp vụ DEMO / useState
  data/seed.js             dữ liệu demo
  data/helpers.js          format tiền, kiểm tra email, phone, trạng thái
  components/SiteLayout.jsx   header/menu/footer
  components/Ui.jsx           product card / trạng thái / empty
  pages/Catalog.jsx          list & search
  pages/ProductDetails.jsx   detail
  pages/Account.jsx          login/register/profile
  pages/Shopping.jsx         wishlist/cart/checkout
  pages/MyOrders.jsx         order/detail/hủy/nhận
  admin/AdminLayout.jsx      menu admin
  admin/Pages.jsx           CRUD laptop, brands, inventory, orders, reports
  style.css                 UI giao diện
```

## Cần làm gì khi nhóm bắt đầu Spring Boot?

Đề tài yêu cầu Backend Controller → Service → Repository → DB, phân quyền role thật, mật khẩu hash BCrypt, transaction khi đặt đơn/trừ tồn. Hiện tài liệu **chỉ định use case, chưa cung cấp hợp đồng REST API cụ thể**, vì thế phần frontend tuần 6 đang hoạt động bằng dữ liệu demo. Nhóm BE cần thống nhất endpoints và JSON trước khi nối:

```
GET    /api/laptops?keyword=&brandId=&categoryId=&minPrice=&maxPrice=
GET    /api/laptops/{id}
POST   /api/auth/login
POST   /api/auth/register
GET    /api/users/me
GET    /api/wishlist
POST   /api/cart
POST   /api/orders
GET    /api/orders/me
POST   /api/orders/{id}/cancel
POST   /api/orders/{id}/confirm-received
GET    /api/admin/laptops
POST   /api/admin/laptops
PUT    /api/admin/laptops/{id}
PATCH  /api/admin/laptops/{id}/stock
GET    /api/admin/orders
PATCH  /api/admin/orders/{id}/status
GET    /api/admin/reports/sales
```

**Các URL trên chỉ là gợi ý để thảo luận** với nhóm BE, không phải endpoints đã có trong tài liệu hoặc đã triển khai. Khi có BE: tạo `src/api/axiosClient.js`, thay dữ liệu/handlers trong `App.jsx` và page bằng các API tương ứng. **Không đưa mật khẩu, khóa bí mật hay hash vào localStorage**. Xác thực nên dùng giải pháp token/session BE an toàn.

## Kiểm tra nhanh trước khi commit Git

- `npm run build` không lỗi.
- Guest truy cập được list, detail nhưng phải login trước khi vào cart.
- Customer đăng nhập → add to cart → checkout → xem đơn, cancel PENDING, receive SHIPPING.
- Admin đăng nhập → add/edit product, sửa stock, xử lý order, xem report.
- Resize màn hình desktop/mobile.
- Không commit `node_modules` hay `dist` (`.gitignore` đã loại trừ).
- Khi demo dữ liệu mẫu nếu bị thay đổi, xóa hai key `laptopshop_demo_data` và `laptopshop_demo_session` trong Local Storage trình duyệt (DevTools > Application > Local Storage), sau đó reload.

## Git commit

```bash
git add .
git commit -m "feat: implement laptop shop phase 1 React UI"
git push
```

Chạy các lệnh trong repo Git của nhóm và chỉ push vào branch đã thống nhất với nhóm, tránh ghi đè công việc người khác.
