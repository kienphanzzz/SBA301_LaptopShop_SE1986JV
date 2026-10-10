import React, { useState } from 'react';
import { Badge, Button, Col, Container, Form, Row } from 'react-bootstrap';
import { Link, useParams } from 'react-router-dom';
import { brandName, categoryName, money } from '../data/helpers';

export default function ProductDetails({ data, user, wishIds, onAddCart, onToggleWish }) {
  const { id } = useParams();
  const [quantity, setQuantity] = useState(1);
  const product = data.products.find((item) => item.id === Number(id));
  if (!product) return <Container className="py-5"><h3>Không tìm thấy laptop</h3><Link to="/">Trở về danh sách</Link></Container>;
  const available = product.status === 'ACTIVE' && product.stockQuantity > 0;
  return <Container className="py-4">
    <div className="crumb"><Link to="/">Trang chủ</Link> / <span>{product.name}</span></div>
    <Row className="g-4 mt-1">
      <Col md={6}><div className="detail-image-box"><img src={product.image} alt={product.name}/></div></Col>
      <Col md={6}>
        <div className="detail-content"><div className="eyebrow">{brandName(data.brands, product.brandId)} · {categoryName(data.categories, product.categoryId)}</div>
          <h1>{product.name}</h1><div className="sku">Mã SKU: {product.sku}</div>
          <div className="price-band"><strong>{money(product.price)}</strong>{product.oldPrice > product.price && <del>{money(product.oldPrice)}</del>}</div>
          <Badge bg={available ? 'success' : 'secondary'} className="mb-3">{product.status !== 'ACTIVE' ? 'Ngừng kinh doanh' : available ? 'Còn ' + product.stockQuantity + ' sản phẩm' : 'Tạm hết hàng'}</Badge>
          <p>{product.description}</p>
          <div className="spec-line"><span>Cấu hình</span><strong>{product.specs}</strong></div>
          {user?.role !== 'ADMIN' && <div className="d-flex flex-wrap gap-2 mt-4 align-items-center">
            <Form.Control aria-label="Số lượng" type="number" min="1" max={product.stockQuantity} value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} className="quantity-input" disabled={!available}/>
            <Button variant="danger" size="lg" disabled={!available || quantity < 1} onClick={() => onAddCart(product.id, quantity)}>🛒 Thêm vào giỏ</Button>
            {user?.role === 'CUSTOMER' && <Button variant="outline-danger" size="lg" onClick={() => onToggleWish(product.id)}>{wishIds.includes(product.id) ? '♥ Đã yêu thích' : '♡ Yêu thích'}</Button>}
          </div>}
        </div>
      </Col>
    </Row>
    <div className="white-panel mt-4"><h4>Thông tin chi tiết</h4><p>{product.description}</p><table className="table details-table"><tbody><tr><th>Thương hiệu</th><td>{brandName(data.brands, product.brandId)}</td></tr><tr><th>Danh mục</th><td>{categoryName(data.categories, product.categoryId)}</td></tr><tr><th>Cấu hình</th><td>{product.specs}</td></tr><tr><th>Tồn kho</th><td>{product.stockQuantity}</td></tr><tr><th>Trạng thái</th><td>{product.status}</td></tr></tbody></table></div>
  </Container>;
}
