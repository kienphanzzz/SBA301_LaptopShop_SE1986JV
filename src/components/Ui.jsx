import React from 'react';
import { Badge, Button, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { brandName, money, orderLabels, orderVariant } from '../data/helpers';

const FALLBACK_IMAGE = '/assets/laptop-silver.svg';

export function PageTitle({ tag, title, description }) {
  return (
    <div className="page-heading">
      {tag && <div className="eyebrow">{tag}</div>}
      <h1>{title}</h1>
      {description && <p>{description}</p>}
    </div>
  );
}

export function EmptyState({ title = 'Chưa có dữ liệu', text, to, action, onAction }) {
  return (
    <div className="empty-state">
      <h4>{title}</h4>
      {text && <p>{text}</p>}
      {onAction ? (
        <Button variant="outline-secondary" onClick={onAction}>
          {action || 'Đặt lại bộ lọc'}
        </Button>
      ) : (
        to && (
          <Button as={Link} to={to} variant="danger">
            {action || 'Xem sản phẩm'}
          </Button>
        )
      )}
    </div>
  );
}

export function ProductCard({ product, brands = [], onAddCart, onToggleWish, isFavorite, user }) {
  const stock = Number(product.stockQuantity ?? 0);
  const available = product.status === 'ACTIVE' && stock > 0;
  const hasValidOldPrice = product.oldPrice != null && Number(product.oldPrice) > Number(product.price);
  const resolvedBrand = product.brandName || brandName(brands, product.brandId);

  return (
    <Card className="product-card h-100">
      <div className="product-photo-wrap">
        {user?.role === 'CUSTOMER' && (
          <button
            type="button"
            className={'heart-btn ' + (isFavorite ? 'active' : '')}
            title={isFavorite ? 'Bỏ yêu thích' : 'Lưu vào yêu thích'}
            aria-label={isFavorite ? 'Bỏ yêu thích' : 'Lưu vào yêu thích'}
            onClick={() => onToggleWish(product.id, product)}
          >
            {isFavorite ? '♥' : '♡'}
          </button>
        )}
        <Link to={'/laptops/' + product.id} className="product-photo-link">
          <img
            src={product.image || FALLBACK_IMAGE}
            alt={product.name}
            className="product-photo"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = FALLBACK_IMAGE;
            }}
          />
        </Link>
      </div>
      <Card.Body className="d-flex flex-column">
        <div className="product-meta-row">
          <span className="small-brand">{resolvedBrand}</span>
          {product.sku && <span className="product-card-sku">{product.sku}</span>}
        </div>
        <Card.Title className="product-name">
          <Link to={'/laptops/' + product.id}>{product.name}</Link>
        </Card.Title>
        <div className="product-specs" title={product.specs}>
          {product.specs}
        </div>
        <div className="mt-auto pt-3">
          <div className="product-price-block">
            <span className="product-price">{money(product.price)}</span>
            {hasValidOldPrice && (
              <span className="old-price">{money(product.oldPrice)}</span>
            )}
          </div>
          <div className="stock-badge-row">
            {!available ? (
              <span className="stock-status out">Tạm hết hàng</span>
            ) : stock <= 5 ? (
              <span className="stock-status low">Còn {stock} máy</span>
            ) : (
              <span className="stock-status ok">Còn hàng ({stock})</span>
            )}
          </div>
          <div className="d-flex gap-2 mt-2 pt-1">
            <Button
              as={Link}
              to={'/laptops/' + product.id}
              variant="outline-secondary"
              className="flex-fill"
            >
              Xem chi tiết
            </Button>
            {user?.role !== 'ADMIN' && (
              <Button
                variant="danger"
                className="flex-fill"
                disabled={!available}
                onClick={() => onAddCart(product.id, 1, product)}
              >
                {available ? 'Thêm vào giỏ' : 'Hết hàng'}
              </Button>
            )}
          </div>
        </div>
      </Card.Body>
    </Card>
  );
}

export function StatusBadge({ status }) {
  return (
    <Badge className="status-pill" bg={orderVariant(status)}>
      {orderLabels[status] || status}
    </Badge>
  );
}

export function CardSkeleton() {
  return (
    <div className="product-card skeleton-card">
      <div className="skeleton skeleton-img" />
      <div className="skeleton-body">
        <div className="skeleton skeleton-line short" />
        <div className="skeleton skeleton-line" />
        <div className="skeleton skeleton-line medium" />
        <div className="skeleton skeleton-price" />
        <div className="skeleton skeleton-btn" />
      </div>
    </div>
  );
}

export function CatalogSkeleton({ count = 6 }) {
  return (
    <div className="row g-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="col-md-6 col-xl-4">
          <CardSkeleton />
        </div>
      ))}
    </div>
  );
}
