import React, { useState } from 'react';
import { Badge, Button, Container, Form, Navbar, Nav } from 'react-bootstrap';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { ToastContainer } from './Toast';
import BackToTop from './BackToTop';

export default function SiteLayout({ user, onLogout, cartCount, wishCount, toasts, onRemoveToast }) {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState('');

  function handleSearch(event) {
    event.preventDefault();
    navigate('/?q=' + encodeURIComponent(keyword.trim()));
  }

  return (
    <>
      <div className="top-strip">
        <Container className="d-flex justify-content-between flex-wrap gap-2">
          <span>✓ Laptop chính hãng &nbsp; ✓ Tư vấn lựa chọn &nbsp; ✓ Giao hàng COD</span>
          <span>Hotline hỗ trợ: 1900 6868 · Mở cửa 8:00 - 21:30</span>
        </Container>
      </div>
      <Navbar expand="lg" className="main-navbar" variant="dark">
        <Container className="gap-3">
          <Navbar.Brand as={Link} to="/" className="brand-mark"><span className="brand-emblem">L</span> LAPTOP<span>HUB</span></Navbar.Brand>
          <Navbar.Toggle aria-controls="site-menu" />
          <Navbar.Collapse id="site-menu">
            <Form onSubmit={handleSearch} className="header-search mx-lg-4 my-3 my-lg-0">
              <Form.Control placeholder="Tìm laptop ASUS, Dell, gaming, học tập..." value={keyword} onChange={(e) => setKeyword(e.target.value)} aria-label="Tìm laptop" />
              <Button type="submit" variant="light">Tìm kiếm</Button>
            </Form>
            <Nav className="ms-auto align-items-lg-center gap-1 flex-wrap">
              <Nav.Link as={NavLink} to="/">Trang chủ</Nav.Link>
              {user?.role === 'CUSTOMER' && <>
                <Nav.Link as={NavLink} to="/wishlist">♡ Yêu thích <Badge bg="light" text="dark">{wishCount}</Badge></Nav.Link>
                <Nav.Link as={NavLink} to="/cart">🛒 Giỏ hàng <Badge bg="light" text="dark">{cartCount}</Badge></Nav.Link>
                <Nav.Link as={NavLink} to="/orders">Đơn của tôi</Nav.Link>
              </>}
              {user?.role === 'ADMIN' && <Nav.Link as={NavLink} to="/admin">Quản trị</Nav.Link>}
              {user ? (
                <>
                  <Nav.Link as={NavLink} to={user.role === 'ADMIN' ? '/admin' : '/profile'} className="hello-user">{user.fullName}</Nav.Link>
                  <Button variant="outline-light" size="sm" onClick={onLogout}>Đăng xuất</Button>
                </>
              ) : (
                <Nav.Link as={NavLink} to="/login" className="header-login">Đăng nhập / Đăng ký</Nav.Link>
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
            <div><h5 className="footer-brand">LAPTOPHUB</h5><p>Hệ thống bán lẻ laptop chính hãng uy tín, đa dạng cấu hình cho học tập, làm việc và gaming.</p></div>
            <div><h6>Khám phá</h6><Link to="/">Danh sách laptop</Link><Link to="/login">Tài khoản</Link></div>
            <div><h6>Chính sách & Bảo hành</h6><p>Bảo hành chính hãng 12-24 tháng. Miễn phí vận chuyển toàn quốc cho đơn hàng COD.</p></div>
          </div>
          <div className="footer-bottom">© 2026 LAPTOPHUB · Hệ thống phân phối laptop chính hãng</div>
        </Container>
      </footer>
      <BackToTop />
    </>
  );
}
