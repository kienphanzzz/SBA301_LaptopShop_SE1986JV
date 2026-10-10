import React from 'react';
import { Container, Nav } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';

export default function AdminLayout() {
  const menu = [
    ['Tổng quan', '/admin'],
    ['Laptop', '/admin/laptops'],
    ['Thương hiệu', '/admin/brands'],
    ['Danh mục', '/admin/categories'],
    ['Tồn kho', '/admin/inventory'],
    ['Đơn hàng', '/admin/orders'],
    ['Doanh số', '/admin/reports'],
  ];
  return <Container className="admin-nav-container pt-4"><div className="admin-nav-head"><div><div className="eyebrow">LAPTOPHUB ADMIN</div><h2>Quản trị cửa hàng</h2></div><span className="admin-tag">Khu vực Admin · Demo UI</span></div><Nav className="admin-nav flex-wrap">{menu.map(([name, path]) => <Nav.Link key={path} as={NavLink} end={path === '/admin'} to={path}>{name}</Nav.Link>)}</Nav></Container>;
}
