import React, { useEffect, useState } from 'react';
import { Container, Button, Spinner } from 'react-bootstrap';
import { Link, Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { initialData } from './data/seed';
import { authApi } from './api/authApi';
import SiteLayout from './components/SiteLayout';
import NotFound from './components/NotFound';
import Catalog from './pages/Catalog';
import ProductDetails from './pages/ProductDetails';
import { Login, Register, Profile } from './pages/Account';
import { Wishlist, Cart, Checkout } from './pages/Shopping';
import { MyOrders, MyOrderDetails } from './pages/MyOrders';
import AdminLayout from './admin/AdminLayout';
import { AdminDashboard, AdminProducts, AdminTaxonomy, AdminInventory, AdminOrders, AdminOrderDetails, AdminReports } from './admin/Pages';

// Dữ liệu tạm trên localStorage chỉ phục vụ UC-07 đến UC-18 (Wishlist, Cart, Orders, Admin demo).
// UC-01 đến UC-06 sử dụng API thật và phiên xác thực từ Spring Boot + SQL Server.
function readDemoData() {
  try { return JSON.parse(localStorage.getItem('laptopshop_demo_data')) || initialData; }
  catch { return initialData; }
}

function OnlyRole({ user, authChecking, role, children }) {
  if (authChecking) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="danger" size="sm" className="me-2" />
        <span className="text-muted">Đang kiểm tra phiên đăng nhập...</span>
      </Container>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  const allowedRoles = Array.isArray(role) ? role : [role];
  if (!allowedRoles.includes(user.role)) {
    return (
      <Container className="my-5">
        <h2>Không có quyền truy cập</h2>
        <p>Chức năng này dành cho {allowedRoles.includes('ADMIN') ? 'Admin' : 'Customer'}.</p>
        <Button as={Link} to="/" variant="danger">Về trang chủ</Button>
      </Container>
    );
  }
  return children;
}

export default function App() {
  const [data, setData] = useState(readDemoData);
  const [user, setUser] = useState(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [toasts, setToasts] = useState([]);
  const navigate = useNavigate();

  const customerId = user?.role === 'CUSTOMER' ? String(user.id) : '';
  const cart = data.cart[customerId] || [];
  const wishIds = data.wishlist[customerId] || [];
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  useEffect(() => {
    localStorage.setItem('laptopshop_demo_data', JSON.stringify(data));
  }, [data]);

  // Xóa triệt để key giả lập phiên đăng nhập cũ trên localStorage (nếu có) và xác thực trực tiếp với Backend
  useEffect(() => {
    localStorage.removeItem('laptopshop_demo_session');
    let active = true;
    authApi
      .getProfile()
      .then((profile) => {
        if (!active) return;
        setUser(profile);
        syncUserToLocalData(profile);
      })
      .catch(() => {
        if (!active) return;
        setUser(null);
      })
      .finally(() => {
        if (active) setAuthChecking(false);
      });
    return () => {
      active = false;
    };
  }, []);

  function addToast(text, variant = 'success') {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, text, variant }]);
  }
  function removeToast(id) { setToasts((prev) => prev.filter((t) => t.id !== id)); }
  function showNotice(text, variant = 'success') { addToast(text, variant); }

  function syncUserToLocalData(profile) {
    if (!profile || !profile.id) return;
    const summary = {
      id: Number(profile.id),
      fullName: profile.fullName,
      email: profile.email,
      phone: profile.phone || '',
      address: profile.address || '',
      role: profile.role,
      status: profile.status,
    };
    setData((prev) => {
      const exists = prev.users.some((u) => Number(u.id) === summary.id);
      return {
        ...prev,
        users: exists
          ? prev.users.map((u) => (Number(u.id) === summary.id ? { ...u, ...summary } : u))
          : [...prev.users, summary],
      };
    });
  }

  function handleLoginSuccess(profile) {
    setUser(profile);
    syncUserToLocalData(profile);
    showNotice('Đăng nhập thành công. Xin chào ' + profile.fullName + '!');
    navigate(profile.role === 'ADMIN' ? '/admin' : '/');
  }

  function handleRegisterSuccess() {
    showNotice('Đăng ký tài khoản thành công. Vui lòng đăng nhập.');
  }

  function handleProfileUpdated(updatedProfile, showToast = true) {
    setUser(updatedProfile);
    syncUserToLocalData(updatedProfile);
    if (showToast) {
      showNotice('Đã cập nhật hồ sơ cá nhân.');
    }
  }

  function handleSessionExpired() {
    setUser(null);
    showNotice('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.', 'warning');
    navigate('/login', { replace: true });
  }

  async function logout() {
    try {
      await authApi.logout();
    } catch {
      // Vẫn xóa state phía client nếu session trên server đã hết hạn trước đó
    }
    setUser(null);
    showNotice('Đã đăng xuất thành công.', 'info');
    navigate('/');
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

  return <Routes>
    <Route element={<SiteLayout user={user} onLogout={logout} cartCount={cartCount} wishCount={wishIds.length} toasts={toasts} onRemoveToast={removeToast} />}>
      <Route path="/" element={<Catalog data={data} user={user} wishIds={wishIds} onAddCart={addCart} onToggleWish={toggleWish} />} />
      <Route path="/laptops/:id" element={<ProductDetails data={data} user={user} wishIds={wishIds} onAddCart={addCart} onToggleWish={toggleWish} />} />
      <Route path="/login" element={<Login user={user} onLoginSuccess={handleLoginSuccess} />} />
      <Route path="/register" element={<Register user={user} onRegisterSuccess={handleRegisterSuccess} />} />
      <Route path="/profile" element={<OnlyRole user={user} authChecking={authChecking} role={['CUSTOMER', 'ADMIN']}><Profile user={user} onProfileUpdated={handleProfileUpdated} onSessionExpired={handleSessionExpired} /></OnlyRole>} />
      <Route path="/wishlist" element={<OnlyRole user={user} authChecking={authChecking} role="CUSTOMER"><Wishlist data={data} wishIds={wishIds} user={user} onToggleWish={toggleWish} onAddCart={addCart} /></OnlyRole>} />
      <Route path="/cart" element={<OnlyRole user={user} authChecking={authChecking} role="CUSTOMER"><Cart data={data} cart={cart} onQuantity={changeCartQuantity} onRemove={removeCart} /></OnlyRole>} />
      <Route path="/checkout" element={<OnlyRole user={user} authChecking={authChecking} role="CUSTOMER"><Checkout data={data} cart={cart} user={user} onPlaceOrder={placeOrder} /></OnlyRole>} />
      <Route path="/orders" element={<OnlyRole user={user} authChecking={authChecking} role="CUSTOMER"><MyOrders data={data} user={user} /></OnlyRole>} />
      <Route path="/orders/:id" element={<OnlyRole user={user} authChecking={authChecking} role="CUSTOMER"><MyOrderDetails data={data} user={user} onCancel={cancelOrder} onConfirm={confirmReceipt} /></OnlyRole>} />
      <Route path="/admin" element={<OnlyRole user={user} authChecking={authChecking} role="ADMIN"><AdminLayout /><AdminDashboard data={data} /></OnlyRole>} />
      <Route path="/admin/laptops" element={<OnlyRole user={user} authChecking={authChecking} role="ADMIN"><AdminLayout /><AdminProducts data={data} onSave={saveProduct} /></OnlyRole>} />
      <Route path="/admin/brands" element={<OnlyRole user={user} authChecking={authChecking} role="ADMIN"><AdminLayout /><AdminTaxonomy data={data} type="brands" onSave={saveTaxonomy} /></OnlyRole>} />
      <Route path="/admin/categories" element={<OnlyRole user={user} authChecking={authChecking} role="ADMIN"><AdminLayout /><AdminTaxonomy data={data} type="categories" onSave={saveTaxonomy} /></OnlyRole>} />
      <Route path="/admin/inventory" element={<OnlyRole user={user} authChecking={authChecking} role="ADMIN"><AdminLayout /><AdminInventory data={data} onUpdate={updateStock} /></OnlyRole>} />
      <Route path="/admin/orders" element={<OnlyRole user={user} authChecking={authChecking} role="ADMIN"><AdminLayout /><AdminOrders data={data} /></OnlyRole>} />
      <Route path="/admin/orders/:id" element={<OnlyRole user={user} authChecking={authChecking} role="ADMIN"><AdminLayout /><AdminOrderDetails data={data} onAdvance={advanceOrder} /></OnlyRole>} />
      <Route path="/admin/reports" element={<OnlyRole user={user} authChecking={authChecking} role="ADMIN"><AdminLayout /><AdminReports data={data} /></OnlyRole>} />
      <Route path="*" element={<NotFound />} />
    </Route>
  </Routes>;
}
