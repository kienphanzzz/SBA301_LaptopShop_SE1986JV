import React, { useEffect, useState } from 'react';
import { Badge, Button, Container, Form, Navbar, Nav } from 'react-bootstrap';
import { Link, NavLink, Outlet, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { ToastContainer } from './Toast';
import BackToTop from './BackToTop';

export default function SiteLayout({ user, onLogout, cartCount, wishCount, toasts, onRemoveToast }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [keyword, setKeyword] = useState(searchParams.get('q') || '');

  useEffect(() => {
    if (location.pathname === '/') {
      setKeyword(searchParams.get('q') || '');
    }
  }, [location.pathname, searchParams]);

  function handleSearch(event) {
    event.preventDefault();
    const trimmed = keyword.trim();
    navigate(trimmed ? '/?q=' + encodeURIComponent(trimmed) : '/');
  }

  return (
    <>
      <div className="top-strip">
        <Container className="d-flex justify-content-between align-items-center">
          <span>Hệ thống bán lẻ laptop chính hãng · Thanh toán khi nhận hàng (COD)</span>
          <span className="d-none d-md-inline">Tra cứu cấu hình, giá bán &amp; tồn kho trực tuyến</span>
        </Container>
      </div>
      <Navbar expand="lg" className="main-navbar" variant="dark">
        <Container className="gap-3">
          <Navbar.Brand as={Link} to="/" className="brand-mark">
            <span className="brand-emblem">L</span> LAPTOP<span>HUB</span>
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="site-menu" />
          <Navbar.Collapse id="site-menu">
            <Form onSubmit={handleSearch} className="header-search mx-lg-4 my-3 my-lg-0">
              <Form.Control
                placeholder="Tìm theo tên máy, SKU, thương hiệu hoặc cấu hình..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                aria-label="Tìm laptop"
              />
              {keyword && (
                <button
                  type="button"
                  className="header-search-clear"
                  aria-label="Xóa từ khóa"
                  onClick={() => {
                    setKeyword('');
                    if (location.pathname === '/' && searchParams.get('q')) {
                      navigate('/');
                    }
                  }}
                >
                  ×
                </button>
              )}
              <Button type="submit" variant="danger">Tìm kiếm</Button>
            </Form>
            <Nav className="ms-auto align-items-lg-center gap-1 flex-wrap">
              <Nav.Link as={NavLink} to="/" end>Danh mục</Nav.Link>
              {user?.role === 'CUSTOMER' && (
                <>
                  <Nav.Link as={NavLink} to="/wishlist">
                    Yêu thích <Badge bg="light" text="dark">{wishCount}</Badge>
                  </Nav.Link>
                  <Nav.Link as={NavLink} to="/cart">
                    Giỏ hàng <Badge bg="light" text="dark">{cartCount}</Badge>
                  </Nav.Link>
                  <Nav.Link as={NavLink} to="/orders">Đơn hàng</Nav.Link>
                </>
              )}
              {user?.role === 'ADMIN' && <Nav.Link as={NavLink} to="/admin">Quản trị</Nav.Link>}
              {user ? (
                <>
                  <Nav.Link as={NavLink} to={user.role === 'ADMIN' ? '/admin' : '/profile'} className="hello-user">
                    {user.fullName}
                  </Nav.Link>
                  <Button variant="outline-light" size="sm" onClick={onLogout}>Đăng xuất</Button>
                </>
              ) : (
                <Nav.Link as={NavLink} to="/login" className="header-login">Đăng nhập</Nav.Link>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <ToastContainer toasts={toasts} onRemove={onRemoveToast} />
      <main className="page-main"><Outlet /></main>
      <footer className="site-footer">
        <Container>
          <div className="footer-grid">
            <div>
              <h5 className="footer-brand">LAPTOPHUB</h5>
              <p>Chuyên cung cấp laptop văn phòng, học tập, đồ họa kỹ thuật và gaming chính hãng với thông tin cấu hình, giá bán và tồn kho minh bạch.</p>
            </div>
            <div>
              <h6>Điều hướng</h6>
              <Link to="/">Danh mục sản phẩm</Link>
              <Link to={!user ? '/login' : user.role === 'ADMIN' ? '/admin' : '/profile'}>
                Tài khoản khách hàng
              </Link>
            </div>
            <div>
              <h6>Chính sách mua hàng</h6>
              <p>Niêm yết minh bạch cấu hình, giá bán và số lượng tồn kho. Hỗ trợ đặt hàng trực tuyến và thanh toán khi nhận hàng (COD).</p>
            </div>
          </div>
          <div className="footer-bottom">© 2026 LAPTOPHUB · Hệ thống bán lẻ laptop chính hãng</div>
        </Container>
      </footer>
      <BackToTop />
    </>
  );
}
