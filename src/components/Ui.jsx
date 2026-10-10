import React from 'react';
import { Badge, Button, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { brandName, money, orderLabels, orderVariant } from '../data/helpers';

export function PageTitle({ tag, title, description }) {
  return <div className="page-heading">{tag && <div className="eyebrow">{tag}</div>}<h1>{title}</h1>{description && <p>{description}</p>}</div>;
}

export function EmptyState({ title = 'Chưa có dữ liệu', text, to, action }) {
  return <div className="empty-state"><div className="empty-art">▤</div><h4>{title}</h4>{text && <p>{text}</p>}{to && <Button as={Link} to={to} variant="danger">{action || 'Xem sản phẩm'}</Button>}</div>;
}

export function ProductCard({ product, brands, onAddCart, onToggleWish, isFavorite, user }) {
  const available = product.stockQuantity > 0 && product.status === 'ACTIVE';
  const discount = product.oldPrice > product.price ? Math.round((product.oldPrice - product.price) / product.oldPrice * 100) : 0;
  return (
    <Card className="product-card h-100">
      <div className="product-photo-wrap">
        {discount > 0 && <span className="sale-tag">Giảm {discount}%</span>}
        {user?.role === 'CUSTOMER' && <button className={'heart-btn ' + (isFavorite ? 'active' : '')} title="Yêu thích" onClick={() => onToggleWish(product.id)}>{isFavorite ? '♥' : '♡'}</button>}
        <Link to={'/laptops/' + product.id}><Card.Img variant="top" src={product.image} alt={product.name} className="product-photo" /></Link>
      </div>
      <Card.Body className="d-flex flex-column">
        <span className="small-brand">{brandName(brands, product.brandId)}</span>
        <Card.Title className="product-name"><Link to={'/laptops/' + product.id}>{product.name}</Link></Card.Title>
        <div className="product-specs">{product.specs}</div>
        <div className="mt-auto pt-3">
          <div className="product-price">{money(product.price)}</div>
          {product.oldPrice > product.price && <div className="old-price">{money(product.oldPrice)}</div>}
          <div className="d-flex gap-2 mt-3">
            <Button as={Link} to={'/laptops/' + product.id} variant="outline-secondary" className="flex-fill">Chi tiết</Button>
            {user?.role !== 'ADMIN' && <Button variant="danger" className="flex-fill" disabled={!available} onClick={() => onAddCart(product.id, 1)}>{available ? 'Thêm giỏ' : 'Hết hàng'}</Button>}
          </div>
        </div>
      </Card.Body>
    </Card>
  );
}

export function StatusBadge({ status }) {
  return <Badge className="status-pill" bg={orderVariant(status)}>{orderLabels[status] || status}</Badge>;
}
