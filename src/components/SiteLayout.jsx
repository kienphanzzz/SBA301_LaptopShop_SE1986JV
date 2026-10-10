import React, { useState } from 'react';
import { Alert, Badge, Button, Container, Form, Navbar, Nav } from 'react-bootstrap';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';

export default function SiteLayout({ user, onLogout, cartCount, wishCount, notice, onDismiss }) {
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
          <span>Bài tập SBA301 · Frontend demo</span>
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
      <div className="demo-note">DỮ LIỆU DEMO · Giao diện tuần 6, chưa kết nối API Spring Boot</div>
      {notice && <Container className="mt-3"><Alert variant={notice.variant || 'info'} dismissible onClose={onDismiss}>{notice.text}</Alert></Container>}
      <main className="page-main"><Outlet /></main>
      <footer className="site-footer">
        <Container>
          <div className="footer-grid">
            <div><h5 className="footer-brand">LAPTOPHUB</h5><p>Giao diện đồ án Laptop Shop Management System · SBA301</p></div>
            <div><h6>Khám phá</h6><Link to="/">Danh sách laptop</Link><Link to="/login">Tài khoản</Link></div>
            <div><h6>Thông tin demo</h6><p>Giá và sản phẩm minh họa, không phải giao dịch thương mại thực tế.</p></div>
          </div>
          <div className="footer-bottom">© 2026 LaptopHub · Project nhóm SBA301</div>
        </Container>
      </footer>
    </>
  );
}
