import React, { useCallback, useEffect, useState } from 'react';
import { Button, Container, Spinner } from 'react-bootstrap';
import { Link, Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { authApi } from './api/authApi';
import { adminApi } from './api/adminApi';
import { shoppingApi } from './api/shoppingApi';
import { getApiErrorMessage } from './api/catalogApi';
import SiteLayout from './components/SiteLayout';
import NotFound from './components/NotFound';
import Catalog from './pages/Catalog';
import ProductDetails from './pages/ProductDetails';
import { Login, Register, Profile } from './pages/Account';
import { Wishlist, Cart, Checkout } from './pages/Shopping';
import { MyOrders, MyOrderDetails } from './pages/MyOrders';
import AdminLayout from './admin/AdminLayout';
import { AdminDashboard, AdminProducts, AdminTaxonomy, AdminInventory, AdminOrders, AdminOrderDetails, AdminReports } from './admin/Pages';

const emptyData = {
  products: [],
  brands: [],
  categories: [],
  cart: {},
  wishlist: {},
  wishlistProducts: {},
  orders: [],
};

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
  const [data, setData] = useState(emptyData);
  const [user, setUser] = useState(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [toasts, setToasts] = useState([]);
  const navigate = useNavigate();
  const customerId = user?.role === 'CUSTOMER' ? String(user.id) : '';
  const cart = data.cart[customerId] || [];
  const wishIds = data.wishlist[customerId] || [];
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  function addToast(text, variant = 'success') {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, text, variant }]);
  }

  function removeToast(id) {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }

  function handleApiError(error, defaultMessage) {
    if (error?.response?.status === 401) {
      handleSessionExpired();
      return;
    }
    addToast(getApiErrorMessage(error, defaultMessage), 'danger');
  }

  const refreshCustomerData = useCallback(async (profileId) => {
    const [cartItems, wishlistItems, orders] = await Promise.all([
      shoppingApi.getCart(),
      shoppingApi.getWishlist(),
      shoppingApi.getMyOrders(),
    ]);
    const id = String(profileId);
    setData((previous) => ({
      ...previous,
      cart: { ...previous.cart, [id]: cartItems },
      wishlist: { ...previous.wishlist, [id]: wishlistItems.map((item) => item.laptopId) },
      wishlistProducts: { ...previous.wishlistProducts, [id]: wishlistItems },
      orders,
    }));
  }, []);

  const refreshAdminData = useCallback(async () => {
    const [products, brands, categories, orders] = await Promise.all([
      adminApi.getLaptops(),
      adminApi.getTaxonomy('brands'),
      adminApi.getTaxonomy('categories'),
      adminApi.getOrders(),
    ]);
    setData((previous) => ({ ...previous, products, brands, categories, orders }));
  }, []);

  useEffect(() => {
    let active = true;
    authApi.getProfile()
      .then(async (profile) => {
        if (!active) return;
        setUser(profile);
        if (profile.role === 'ADMIN') await refreshAdminData();
        else await refreshCustomerData(profile.id);
      })
      .catch((error) => {
        if (!active) return;
        setUser(null);
        if (error?.response && error.response.status !== 401) {
          addToast(getApiErrorMessage(error, 'Không thể kiểm tra phiên đăng nhập.'), 'danger');
        } else if (!error?.response && error?.request) {
          addToast(getApiErrorMessage(error, 'Không thể kết nối đến máy chủ.'), 'warning');
        }
      })
      .finally(() => {
        if (active) setAuthChecking(false);
      });
    return () => {
      active = false;
    };
  }, [refreshAdminData, refreshCustomerData]);

  async function handleLoginSuccess(profile) {
    setUser(profile);
    try {
      if (profile.role === 'ADMIN') await refreshAdminData();
      else await refreshCustomerData(profile.id);
      addToast('Đăng nhập thành công. Xin chào ' + profile.fullName + '!');
      navigate(profile.role === 'ADMIN' ? '/admin' : '/');
    } catch (error) {
      handleApiError(error, 'Đăng nhập được nhưng không thể tải dữ liệu tài khoản.');
    }
  }

  function handleRegisterSuccess() {
    addToast('Đăng ký tài khoản thành công. Vui lòng đăng nhập.');
  }

  function handleProfileUpdated(updatedProfile, showToast = true) {
    setUser(updatedProfile);
    if (showToast) addToast('Đã cập nhật hồ sơ cá nhân.');
  }

  function handleSessionExpired() {
    setUser(null);
    setData(emptyData);
    addToast('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.', 'warning');
    navigate('/login', { replace: true });
  }

  async function logout() {
    try {
      await authApi.logout();
    } catch (error) {
      if (error?.response?.status !== 401) {
        addToast(getApiErrorMessage(error, 'Không thể thông báo đăng xuất đến máy chủ.'), 'warning');
      }
    }
    setUser(null);
    setData(emptyData);
    addToast('Đã đăng xuất.', 'info');
    navigate('/');
  }

  function needCustomer() {
    if (user?.role !== 'CUSTOMER') {
      addToast('Đăng nhập Customer để thực hiện chức năng này.', 'warning');
      navigate('/login');
      return false;
    }
    return true;
  }

  async function refreshShopping() {
    if (user?.role === 'CUSTOMER') await refreshCustomerData(user.id);
  }

  async function toggleWish(laptopId) {
    if (!needCustomer()) return;
    try {
      const response = await shoppingApi.toggleWishlist(Number(laptopId));
      await refreshShopping();
      addToast(response.message || (response.added ? 'Đã thêm vào wishlist.' : 'Đã bỏ sản phẩm khỏi wishlist.'));
    } catch (error) {
      handleApiError(error, 'Không thể cập nhật danh sách yêu thích.');
    }
  }

  async function addCart(laptopId, quantity) {
    if (!needCustomer()) return;
    try {
      await shoppingApi.addToCart(Number(laptopId), Number(quantity));
      await refreshShopping();
      addToast('Đã thêm sản phẩm vào giỏ hàng.');
    } catch (error) {
      handleApiError(error, 'Không thể thêm sản phẩm vào giỏ hàng.');
    }
  }

  async function changeCartQuantity(laptopId, quantity) {
    try {
      await shoppingApi.updateCartQuantity(Number(laptopId), Number(quantity));
      await refreshShopping();
    } catch (error) {
      handleApiError(error, 'Không thể cập nhật số lượng trong giỏ hàng.');
    }
  }

  async function removeCart(laptopId) {
    try {
      await shoppingApi.removeFromCart(Number(laptopId));
      await refreshShopping();
      addToast('Đã xóa sản phẩm khỏi giỏ.');
    } catch (error) {
      handleApiError(error, 'Không thể xóa sản phẩm khỏi giỏ hàng.');
    }
  }

  async function placeOrder(form) {
    try {
      const order = await shoppingApi.placeOrder({
        receiverName: form.receiverName.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
      });
      await refreshShopping();
      addToast('Đặt hàng thành công. Mã đơn #' + order.id);
      return { id: order.id };
    } catch (error) {
      if (error?.response?.status === 401) handleApiError(error, 'Vui lòng đăng nhập lại.');
      return { error: getApiErrorMessage(error, 'Không thể tạo đơn hàng.') };
    }
  }

  async function updateMyOrder(orderId, action) {
    try {
      const order = action === 'cancel'
        ? await shoppingApi.cancelOrder(orderId)
        : await shoppingApi.confirmReceived(orderId);
      await refreshShopping();
      addToast(action === 'cancel' ? 'Đã hủy đơn hàng.' : 'Đã xác nhận nhận hàng.');
      return order;
    } catch (error) {
      handleApiError(error, 'Không thể cập nhật đơn hàng.');
      return null;
    }
  }

  async function saveProduct(form, id) {
    try {
      await adminApi.saveLaptop({
        ...form,
        sku: form.sku.trim().toUpperCase(),
        name: form.name.trim(),
        brandId: Number(form.brandId),
        categoryId: Number(form.categoryId),
        price: Number(form.price),
        oldPrice: form.oldPrice ? Number(form.oldPrice) : null,
        stockQuantity: Number(form.stockQuantity),
        description: form.description.trim(),
        specs: form.specs.trim(),
      }, id);
      await refreshAdminData();
      addToast(id ? 'Đã cập nhật laptop.' : 'Đã thêm laptop mới.');
      return '';
    } catch (error) {
      return getApiErrorMessage(error, 'Không thể lưu thông tin laptop.');
    }
  }

  async function saveTaxonomy(type, name, id) {
    try {
      await adminApi.saveTaxonomy(type, name.trim(), id);
      await refreshAdminData();
      addToast('Đã lưu ' + (type === 'brands' ? 'thương hiệu.' : 'danh mục.'));
      return '';
    } catch (error) {
      return getApiErrorMessage(error, 'Không thể lưu dữ liệu danh mục.');
    }
  }

  async function updateStock(productId, quantity) {
    try {
      await adminApi.updateStock(Number(productId), Number(quantity));
      await refreshAdminData();
      addToast('Đã cập nhật tồn kho.');
      return '';
    } catch (error) {
      return getApiErrorMessage(error, 'Không thể cập nhật tồn kho.');
    }
  }

  async function advanceOrder(orderId, nextStatus) {
    try {
      await adminApi.updateOrderStatus(Number(orderId), nextStatus);
      await refreshAdminData();
      addToast('Đã chuyển trạng thái đơn hàng.');
      return '';
    } catch (error) {
      return getApiErrorMessage(error, 'Không thể cập nhật trạng thái đơn hàng.');
    }
  }

  return <Routes>
    <Route element={<SiteLayout user={user} onLogout={logout} cartCount={cartCount} wishCount={wishIds.length} toasts={toasts} onRemoveToast={removeToast} />}>
      <Route path="/" element={<Catalog user={user} wishIds={wishIds} onAddCart={addCart} onToggleWish={toggleWish} />} />
      <Route path="/laptops/:id" element={<ProductDetails user={user} wishIds={wishIds} onAddCart={addCart} onToggleWish={toggleWish} />} />
      <Route path="/login" element={<Login user={user} onLoginSuccess={handleLoginSuccess} />} />
      <Route path="/register" element={<Register user={user} onRegisterSuccess={handleRegisterSuccess} />} />
      <Route path="/profile" element={<OnlyRole user={user} authChecking={authChecking} role={['CUSTOMER', 'ADMIN']}><Profile user={user} onProfileUpdated={handleProfileUpdated} onSessionExpired={handleSessionExpired} /></OnlyRole>} />
      <Route path="/wishlist" element={<OnlyRole user={user} authChecking={authChecking} role="CUSTOMER"><Wishlist data={data} wishIds={wishIds} user={user} onToggleWish={toggleWish} onAddCart={addCart} /></OnlyRole>} />
      <Route path="/cart" element={<OnlyRole user={user} authChecking={authChecking} role="CUSTOMER"><Cart cart={cart} onQuantity={changeCartQuantity} onRemove={removeCart} /></OnlyRole>} />
      <Route path="/checkout" element={<OnlyRole user={user} authChecking={authChecking} role="CUSTOMER"><Checkout cart={cart} user={user} onPlaceOrder={placeOrder} /></OnlyRole>} />
      <Route path="/orders" element={<OnlyRole user={user} authChecking={authChecking} role="CUSTOMER"><MyOrders data={data} /></OnlyRole>} />
      <Route path="/orders/:id" element={<OnlyRole user={user} authChecking={authChecking} role="CUSTOMER"><MyOrderDetails onUpdate={updateMyOrder} /></OnlyRole>} />
      <Route path="/admin" element={<OnlyRole user={user} authChecking={authChecking} role="ADMIN"><AdminLayout /><AdminDashboard data={data} /></OnlyRole>} />
      <Route path="/admin/laptops" element={<OnlyRole user={user} authChecking={authChecking} role="ADMIN"><AdminLayout /><AdminProducts data={data} onSave={saveProduct} /></OnlyRole>} />
      <Route path="/admin/brands" element={<OnlyRole user={user} authChecking={authChecking} role="ADMIN"><AdminLayout /><AdminTaxonomy data={data} type="brands" onSave={saveTaxonomy} /></OnlyRole>} />
      <Route path="/admin/categories" element={<OnlyRole user={user} authChecking={authChecking} role="ADMIN"><AdminLayout /><AdminTaxonomy data={data} type="categories" onSave={saveTaxonomy} /></OnlyRole>} />
      <Route path="/admin/inventory" element={<OnlyRole user={user} authChecking={authChecking} role="ADMIN"><AdminLayout /><AdminInventory data={data} onUpdate={updateStock} /></OnlyRole>} />
      <Route path="/admin/orders" element={<OnlyRole user={user} authChecking={authChecking} role="ADMIN"><AdminLayout /><AdminOrders data={data} /></OnlyRole>} />
      <Route path="/admin/orders/:id" element={<OnlyRole user={user} authChecking={authChecking} role="ADMIN"><AdminLayout /><AdminOrderDetails onAdvance={advanceOrder} /></OnlyRole>} />
      <Route path="/admin/reports" element={<OnlyRole user={user} authChecking={authChecking} role="ADMIN"><AdminLayout /><AdminReports /></OnlyRole>} />
      <Route path="*" element={<NotFound />} />
    </Route>
  </Routes>;
}
