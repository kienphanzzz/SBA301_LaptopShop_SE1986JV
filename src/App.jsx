import React, { useEffect, useState } from 'react';
import { Container, Button } from 'react-bootstrap';
import { Link, Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { initialData } from './data/seed';
import SiteLayout from './components/SiteLayout';
import NotFound from './components/NotFound';
import Catalog from './pages/Catalog';
import ProductDetails from './pages/ProductDetails';
import { Login, Register, Profile } from './pages/Account';
import { Wishlist, Cart, Checkout } from './pages/Shopping';
import { MyOrders, MyOrderDetails } from './pages/MyOrders';
import AdminLayout from './admin/AdminLayout';
import { AdminDashboard, AdminProducts, AdminTaxonomy, AdminInventory, AdminOrders, AdminOrderDetails, AdminReports } from './admin/Pages';

// Toàn bộ state demo được lưu trong localStorage. Không phải database thật.
function readDemoData() {
  try { return JSON.parse(localStorage.getItem('laptopshop_demo_data')) || initialData; }
  catch { return initialData; }
}
function readSession() {
  try { return JSON.parse(localStorage.getItem('laptopshop_demo_session')) || null; }
  catch { return null; }
}

function OnlyRole({ user, role, children }) {
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== role) return <Container className="my-5"><h2>Không có quyền truy cập</h2><p>Chức năng này dành cho {role === 'ADMIN' ? 'Admin' : 'Customer'}.</p><Button as={Link} to="/">Về trang chủ</Button></Container>;
  return children;
}

export default function App() {
  const [data, setData] = useState(readDemoData);
  const [sessionId, setSessionId] = useState(readSession);
  const [toasts, setToasts] = useState([]);
  const navigate = useNavigate();
  const user = data.users.find((item) => item.id === sessionId) || null;
  const customerId = user?.role === 'CUSTOMER' ? String(user.id) : '';
  const cart = data.cart[customerId] || [];
  const wishIds = data.wishlist[customerId] || [];
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  useEffect(() => { localStorage.setItem('laptopshop_demo_data', JSON.stringify(data)); }, [data]);
  useEffect(() => { localStorage.setItem('laptopshop_demo_session', JSON.stringify(sessionId)); }, [sessionId]);

  function addToast(text, variant = 'success') {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, text, variant }]);
  }
  function removeToast(id) { setToasts((prev) => prev.filter((t) => t.id !== id)); }
  // Backward-compat alias
  function showNotice(text, variant = 'success') { addToast(text, variant); }
  function login(email, password) {
    // Chỉ 2 tài khoản DEMO; khi có BE sẽ thay bằng axios.post('/api/auth/login').
    if (password !== '123456') return 'Mật khẩu demo không đúng.';
    const emailText = email.trim().toLowerCase();
    if (emailText !== 'khach@laptophub.demo' && emailText !== 'admin@laptophub.demo') return 'Chỉ hỗ trợ hai tài khoản demo có sẵn.';
    const found = data.users.find((item) => item.email === emailText && item.status === 'ACTIVE');
    if (!found) return 'Tài khoản không hoạt động.';
    setSessionId(found.id);
    showNotice('Đăng nhập thành công.');
    navigate(found.role === 'ADMIN' ? '/admin' : '/');
    return '';
  }
  function logout() { setSessionId(null); showNotice('Đã đăng xuất thành công.', 'info'); navigate('/'); }
  function register(form) {
    if (data.users.some((item) => item.email.toLowerCase() === form.email.trim().toLowerCase())) return 'Email đã được sử dụng.';
    const id = Math.max(...data.users.map((item) => item.id), 0) + 1;
    const newUser = { id, fullName: form.fullName.trim(), email: form.email.trim().toLowerCase(), phone: form.phone.trim(), address: '', role: 'CUSTOMER', status: 'ACTIVE' };
    // Không lưu password lên trình duyệt. Chức năng đăng nhập thật phải do backend xử lý.
    setData((prev) => ({ ...prev, users: [...prev.users, newUser] }));
    setSessionId(id);
    showNotice('Đăng ký tài khoản thành công.');
    navigate('/profile');
    return '';
  }
  function updateProfile(form) {
    setData((prev) => ({ ...prev, users: prev.users.map((item) => item.id === user.id ? { ...item, fullName: form.fullName.trim(), phone: form.phone.trim(), address: form.address.trim() } : item) }));
    showNotice('Đã cập nhật hồ sơ cá nhân.');
  }
  function needCustomer() {
    if (user?.role !== 'CUSTOMER') { showNotice('Đăng nhập Customer để thực hiện chức năng này.', 'warning'); navigate('/login'); return false; }
    return true;
  }
  function syncApiProductList(products, apiProduct) {
    if (!apiProduct || !apiProduct.id) return products;
    const targetId = Number(apiProduct.id);
    const normalized = {
      id: targetId,
      sku: apiProduct.sku,
      name: apiProduct.name,
      brandId: Number(apiProduct.brandId),
      brandName: apiProduct.brandName,
      categoryId: Number(apiProduct.categoryId),
      categoryName: apiProduct.categoryName,
      price: Number(apiProduct.price),
      oldPrice: apiProduct.oldPrice != null ? Number(apiProduct.oldPrice) : null,
      stockQuantity: Number(apiProduct.stockQuantity),
      status: apiProduct.status || 'ACTIVE',
      image: apiProduct.image || '/assets/laptop-silver.svg',
      description: apiProduct.description || '',
      specs: apiProduct.specs || '',
    };
    const exists = products.some((item) => Number(item.id) === targetId);
    return exists
      ? products.map((item) => (Number(item.id) === targetId ? { ...item, ...normalized } : item))
      : [...products, normalized];
  }
  function toggleWish(laptopId, apiProduct) {
    if (!needCustomer()) return;
    const targetId = Number(laptopId);
    const alreadyWished = (data.wishlist[customerId] || []).includes(targetId);
    setData((prev) => {
      const oldIds = prev.wishlist[customerId] || [];
      const newIds = oldIds.includes(targetId)
        ? oldIds.filter((id) => Number(id) !== targetId)
        : [...oldIds, targetId];
      return {
        ...prev,
        products: syncApiProductList(prev.products, apiProduct),
        wishlist: { ...prev.wishlist, [customerId]: newIds },
      };
    });
    showNotice(alreadyWished ? 'Đã bỏ sản phẩm khỏi wishlist.' : 'Đã thêm vào wishlist.');
  }
  function addCart(laptopId, quantity, apiProduct) {
    if (!needCustomer()) return;
    const targetId = Number(laptopId);
    const product = apiProduct || data.products.find((item) => Number(item.id) === targetId);
    const existing = cart.find((item) => Number(item.laptopId) === targetId);
    if (!product || product.status !== 'ACTIVE' || Number(product.stockQuantity) === 0) { showNotice('Sản phẩm không thể đặt mua.', 'warning'); return; }
    const newQuantity = (existing?.quantity || 0) + Number(quantity);
    if (newQuantity < 1 || newQuantity > Number(product.stockQuantity)) { showNotice('Số lượng vượt tồn kho hiện có.', 'danger'); return; }
    setData((prev) => {
      const prevCart = prev.cart[customerId] || [];
      const prevExisting = prevCart.find((item) => Number(item.laptopId) === targetId);
      const nextQty = (prevExisting?.quantity || 0) + Number(quantity);
      const newCart = prevExisting
        ? prevCart.map((item) => (Number(item.laptopId) === targetId ? { ...item, quantity: nextQty } : item))
        : [...prevCart, { laptopId: targetId, quantity: nextQty }];
      return {
        ...prev,
        products: syncApiProductList(prev.products, apiProduct),
        cart: { ...prev.cart, [customerId]: newCart },
      };
    });
    showNotice('Đã thêm sản phẩm vào giỏ hàng.');
  }
  function changeCartQuantity(laptopId, quantity) {
    const product = data.products.find((item) => item.id === laptopId);
    if (!product || product.status !== 'ACTIVE' || quantity < 1 || quantity > product.stockQuantity) { showNotice('Số lượng phải từ 1 đến số lượng còn trong kho.', 'danger'); return; }
    setData((prev) => ({ ...prev, cart: { ...prev.cart, [customerId]: cart.map((item) => item.laptopId === laptopId ? { ...item, quantity } : item) } }));
  }
  function removeCart(laptopId) {
    setData((prev) => ({ ...prev, cart: { ...prev.cart, [customerId]: cart.filter((item) => item.laptopId !== laptopId) } }));
    showNotice('Đã xóa sản phẩm khỏi giỏ.');
  }
  function placeOrder(form) {
    if (!user || user.role !== 'CUSTOMER' || cart.length === 0) return { error: 'Giỏ hàng không hợp lệ.' };
    const items = [];
    for (const line of cart) {
      const product = data.products.find((item) => item.id === line.laptopId);
      if (!product || product.status !== 'ACTIVE' || line.quantity > product.stockQuantity) return { error: 'Một sản phẩm đã hết hàng hoặc không đủ tồn kho. Vui lòng kiểm tra giỏ hàng.' };
      items.push({ laptopId: product.id, productName: product.name, unitPrice: product.price, quantity: line.quantity });
    }
    const id = Math.max(...data.orders.map((item) => item.id), 1000) + 1;
    const order = { id, userId: user.id, orderDate: new Date().toISOString().slice(0, 10), receiverName: form.receiverName.trim(), phone: form.phone.trim(), address: form.address.trim(), paymentMethod: 'COD', status: 'PENDING', items, totalAmount: items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0) };
    setData((prev) => ({ ...prev,
      orders: [order, ...prev.orders],
      products: prev.products.map((product) => {
        const item = items.find((line) => line.laptopId === product.id);
        return item ? { ...product, stockQuantity: product.stockQuantity - item.quantity } : product;
      }),
      cart: { ...prev.cart, [customerId]: [] },
    }));
    showNotice('Đặt hàng thành công. Mã đơn #' + id);
    return { id };
  }
  function cancelOrder(orderId) {
    const order = data.orders.find((item) => item.id === Number(orderId) && item.userId === user?.id);
    if (!order || order.status !== 'PENDING') { showNotice('Chỉ được hủy đơn PENDING của bạn.', 'danger'); return; }
    setData((prev) => ({ ...prev,
      orders: prev.orders.map((item) => item.id === order.id ? { ...item, status: 'CANCELLED' } : item),
      products: prev.products.map((product) => {
        const line = order.items.find((item) => item.laptopId === product.id);
        return line ? { ...product, stockQuantity: product.stockQuantity + line.quantity } : product;
      }),
    }));
    showNotice('Đã hủy đơn, số lượng hàng được hoàn về kho.');
  }
  function confirmReceipt(orderId) {
    const order = data.orders.find((item) => item.id === Number(orderId) && item.userId === user?.id);
    if (!order || order.status !== 'SHIPPING') { showNotice('Chỉ xác nhận đơn đang giao.', 'danger'); return; }
    setData((prev) => ({ ...prev, orders: prev.orders.map((item) => item.id === order.id ? { ...item, status: 'COMPLETED' } : item) }));
    showNotice('Đã xác nhận nhận hàng.');
  }
  function saveProduct(form, id) {
    const sku = form.sku.trim().toUpperCase();
    const duplicate = data.products.some((item) => item.sku.toUpperCase() === sku && item.id !== id);
    if (duplicate) return 'SKU đã tồn tại.';
    if (!form.name.trim() || !sku || Number(form.price) <= 0 || Number(form.stockQuantity) < 0) return 'Vui lòng nhập tên, SKU, giá > 0 và tồn kho >= 0.';
    const newId = id || Math.max(...data.products.map((item) => item.id), 0) + 1;
    const product = { id: newId, sku, name: form.name.trim(), brandId: Number(form.brandId), categoryId: Number(form.categoryId), price: Number(form.price), oldPrice: Number(form.oldPrice) || 0, stockQuantity: Number(form.stockQuantity), status: form.status, image: form.image || '/assets/laptop-silver.svg', description: form.description.trim(), specs: form.specs.trim() };
    setData((prev) => ({ ...prev, products: id ? prev.products.map((item) => item.id === id ? product : item) : [...prev.products, product] }));
    showNotice(id ? 'Đã cập nhật laptop.' : 'Đã thêm laptop mới.');
    return '';
  }
  function saveTaxonomy(key, name, id) {
    const text = name.trim();
    if (!text) return 'Vui lòng nhập tên.';
    if (data[key].some((item) => item.name.toLowerCase() === text.toLowerCase() && item.id !== id)) return 'Tên đã tồn tại.';
    const newId = id || Math.max(...data[key].map((item) => item.id), 0) + 1;
    setData((prev) => ({ ...prev, [key]: id ? prev[key].map((item) => item.id === id ? { ...item, name: text } : item) : [...prev[key], { id: newId, name: text, status: 'ACTIVE' }] }));
    showNotice('Đã lưu ' + (key === 'brands' ? 'thương hiệu.' : 'danh mục.'));
    return '';
  }
  function updateStock(productId, number) {
    if (!Number.isInteger(Number(number)) || Number(number) < 0) return 'Tồn kho phải là số nguyên không âm.';
    setData((prev) => ({ ...prev, products: prev.products.map((item) => item.id === productId ? { ...item, stockQuantity: Number(number) } : item) }));
    showNotice('Đã cập nhật tồn kho.');
    return '';
  }
  function advanceOrder(orderId, nextStatus) {
    const steps = { PENDING: 'CONFIRMED', CONFIRMED: 'PACKING', PACKING: 'SHIPPING' };
    const order = data.orders.find((item) => item.id === Number(orderId));
    if (!order || steps[order.status] !== nextStatus) return 'Không thể chuyển trạng thái đơn hàng.';
    setData((prev) => ({ ...prev, orders: prev.orders.map((item) => item.id === order.id ? { ...item, status: nextStatus } : item) }));
    showNotice('Đã chuyển trạng thái đơn hàng.');
    return '';
  }
  function resetDemo() { setData(initialData); setSessionId(null); showNotice('Đã khôi phục dữ liệu ban đầu.', 'info'); navigate('/'); }

  return <Routes>
    <Route element={<SiteLayout user={user} onLogout={logout} cartCount={cartCount} wishCount={wishIds.length} toasts={toasts} onRemoveToast={removeToast} />}>
      <Route path="/" element={<Catalog data={data} user={user} wishIds={wishIds} onAddCart={addCart} onToggleWish={toggleWish} />} />
      <Route path="/laptops/:id" element={<ProductDetails data={data} user={user} wishIds={wishIds} onAddCart={addCart} onToggleWish={toggleWish} />} />
      <Route path="/login" element={<Login onLogin={login} />} />
      <Route path="/register" element={<Register onRegister={register} />} />
      <Route path="/profile" element={<OnlyRole user={user} role="CUSTOMER"><Profile user={user} onSave={updateProfile} /></OnlyRole>} />
      <Route path="/wishlist" element={<OnlyRole user={user} role="CUSTOMER"><Wishlist data={data} wishIds={wishIds} user={user} onToggleWish={toggleWish} onAddCart={addCart} /></OnlyRole>} />
      <Route path="/cart" element={<OnlyRole user={user} role="CUSTOMER"><Cart data={data} cart={cart} onQuantity={changeCartQuantity} onRemove={removeCart} /></OnlyRole>} />
      <Route path="/checkout" element={<OnlyRole user={user} role="CUSTOMER"><Checkout data={data} cart={cart} user={user} onPlaceOrder={placeOrder} /></OnlyRole>} />
      <Route path="/orders" element={<OnlyRole user={user} role="CUSTOMER"><MyOrders data={data} user={user} /></OnlyRole>} />
      <Route path="/orders/:id" element={<OnlyRole user={user} role="CUSTOMER"><MyOrderDetails data={data} user={user} onCancel={cancelOrder} onConfirm={confirmReceipt} /></OnlyRole>} />
      <Route path="/admin" element={<OnlyRole user={user} role="ADMIN"><AdminLayout /><AdminDashboard data={data} /></OnlyRole>} />
      <Route path="/admin/laptops" element={<OnlyRole user={user} role="ADMIN"><AdminLayout /><AdminProducts data={data} onSave={saveProduct} /></OnlyRole>} />
      <Route path="/admin/brands" element={<OnlyRole user={user} role="ADMIN"><AdminLayout /><AdminTaxonomy data={data} type="brands" onSave={saveTaxonomy} /></OnlyRole>} />
      <Route path="/admin/categories" element={<OnlyRole user={user} role="ADMIN"><AdminLayout /><AdminTaxonomy data={data} type="categories" onSave={saveTaxonomy} /></OnlyRole>} />
      <Route path="/admin/inventory" element={<OnlyRole user={user} role="ADMIN"><AdminLayout /><AdminInventory data={data} onUpdate={updateStock} /></OnlyRole>} />
      <Route path="/admin/orders" element={<OnlyRole user={user} role="ADMIN"><AdminLayout /><AdminOrders data={data} /></OnlyRole>} />
      <Route path="/admin/orders/:id" element={<OnlyRole user={user} role="ADMIN"><AdminLayout /><AdminOrderDetails data={data} onAdvance={advanceOrder} /></OnlyRole>} />
      <Route path="/admin/reports" element={<OnlyRole user={user} role="ADMIN"><AdminLayout /><AdminReports data={data} /></OnlyRole>} />
      <Route path="*" element={<NotFound />} />
    </Route>
  </Routes>;
}
