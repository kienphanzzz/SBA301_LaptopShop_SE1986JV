import React from 'react';
import { Link } from 'react-router-dom';
import { Container } from 'react-bootstrap';

export default function NotFound() {
  return (
    <Container className="not-found-wrap">
      <div className="not-found-card">
        <div className="not-found-code">404</div>
        <div className="not-found-divider" />
        <h1 className="not-found-title">Trang không tồn tại</h1>
        <p className="not-found-text">
          Trang bạn đang tìm kiếm đã bị xóa, đổi địa chỉ<br />hoặc chưa bao giờ tồn tại.
        </p>
        <div className="not-found-actions">
          <Link to="/" className="btn btn-danger not-found-btn">
            ← Về trang chủ
          </Link>
          <Link to="/login" className="btn btn-outline-secondary not-found-btn">
            Đăng nhập
          </Link>
        </div>
        <div className="not-found-hint">
          💡 Thử tìm kiếm laptop theo tên hoặc thương hiệu ở thanh tìm kiếm phía trên.
        </div>
      </div>
    </Container>
  );
}
