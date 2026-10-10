import React, { useState } from 'react';
import { Alert, Button, Card, Col, Container, Form, Row, Table } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { EmptyState, PageTitle, ProductCard } from '../components/Ui';
import { isValidPhone, money } from '../data/helpers';

export function Wishlist({ data, wishIds, user, onToggleWish, onAddCart }) {
  const products = data.products.filter((item) => wishIds.includes(item.id));
  return <Container className="py-4"><PageTitle title="Laptop yêu thích" description="Những sản phẩm bạn đã lưu để xem lại."/>
    {products.length === 0 ? <EmptyState title="Chưa có laptop yêu thích" text="Nhấn biểu tượng trái tim ở sản phẩm để lưu." to="/" action="Khám phá laptop"/> :
      <Row className="g-3">{products.map((product) => <Col md={6} lg={3} key={product.id}><ProductCard product={product} brands={data.brands} user={user} isFavorite={wishIds.includes(product.id)} onToggleWish={onToggleWish} onAddCart={onAddCart}/></Col>)}</Row>}
  </Container>;
}

export function Cart({ data, cart, onQuantity, onRemove }) {
  const lines = cart.map((line) => ({ ...line, product: data.products.find((item) => item.id === line.laptopId) })).filter((line) => line.product);
  const total = lines.reduce((sum, line) => sum + line.quantity * line.product.price, 0);
  return <Container className="py-4"><PageTitle title="Giỏ hàng của bạn" description="Điều chỉnh số lượng trước khi tiến hành đặt mua."/>
    {!lines.length ? <EmptyState title="Giỏ hàng đang trống" text="Khám phá laptop và thêm sản phẩm phù hợp." to="/"/> :
      <Row className="g-4"><Col lg={8}><div className="white-panel"><div className="table-responsive"><Table className="cart-table align-middle"><thead><tr><th>Sản phẩm</th><th>Đơn giá</th><th>Số lượng</th><th>Thành tiền</th><th></th></tr></thead><tbody>{lines.map((line) => <tr key={line.laptopId}><td><div className="cart-product"><img src={line.product.image} alt=""/><div><Link to={'/laptops/' + line.product.id}>{line.product.name}</Link><small>Kho: {line.product.stockQuantity}</small></div></div></td><td>{money(line.product.price)}</td><td><Form.Control className="cart-quantity" type="number" min="1" max={line.product.stockQuantity} value={line.quantity} onChange={(e) => onQuantity(line.laptopId, Number(e.target.value))}/></td><td className="fw-bold">{money(line.product.price * line.quantity)}</td><td><Button size="sm" variant="outline-danger" onClick={() => onRemove(line.laptopId)}>Xóa</Button></td></tr>)}</tbody></Table></div></div></Col>
      <Col lg={4}><div className="white-panel order-summary"><h4>Thông tin đơn hàng</h4><div className="summary-line"><span>Sản phẩm</span><b>{lines.reduce((sum, item) => sum + item.quantity, 0)}</b></div><div className="summary-line summary-total"><span>Tạm tính</span><strong>{money(total)}</strong></div><Button as={Link} to="/checkout" variant="danger" className="w-100 mt-3">Tiến hành đặt hàng →</Button><p className="small text-muted mt-3 mb-0">Thanh toán COD khi nhận hàng. Không tích hợp cổng thanh toán.</p></div></Col></Row>}
  </Container>;
}

export function Checkout({ data, cart, user, onPlaceOrder }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ receiverName: user.fullName, phone: user.phone || '', address: user.address || '' });
  const [errors, setErrors] = useState({});
  const lines = cart.map((item) => ({ ...item, product: data.products.find((p) => p.id === item.laptopId) })).filter((item) => item.product);
  const total = lines.reduce((sum, item) => sum + item.quantity * item.product.price, 0);
  function change(e) { setForm({ ...form, [e.target.name]: e.target.value }); }
  function submit(e) {
    e.preventDefault();
    const nextErrors = {};
    if (!form.receiverName.trim()) nextErrors.receiverName = 'Vui lòng nhập người nhận.';
    if (!isValidPhone(form.phone)) nextErrors.phone = 'Số điện thoại phải có 9–11 chữ số.';
    if (!form.address.trim()) nextErrors.address = 'Vui lòng nhập địa chỉ giao hàng.';
    if (!lines.length) nextErrors.cart = 'Giỏ hàng đang trống.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    const result = onPlaceOrder(form);
    if (result.error) { setErrors({ cart: result.error }); return; }
    navigate('/orders/' + result.id);
  }
  return <Container className="py-4"><PageTitle title="Thông tin đặt hàng" description="Xác nhận người nhận và địa chỉ giao hàng. Phương thức thanh toán: COD."/>
    <Form onSubmit={submit}><Row className="g-4"><Col lg={7}><div className="white-panel"><h4>Thông tin nhận hàng</h4>{errors.cart && <Alert variant="danger">{errors.cart}</Alert>}
      {[{name:'receiverName',label:'Họ tên người nhận'},{name:'phone',label:'Số điện thoại'},{name:'address',label:'Địa chỉ giao hàng'}].map((field) => <Form.Group key={field.name} className="mb-3"><Form.Label>{field.label} <span className="required">*</span></Form.Label><Form.Control name={field.name} value={form[field.name]} onChange={change} isInvalid={!!errors[field.name]}/><Form.Control.Feedback type="invalid">{errors[field.name]}</Form.Control.Feedback></Form.Group>)}
      <div className="cod-box"><strong>◉ Thanh toán khi nhận hàng (COD)</strong><small>Bài tập không tích hợp payment gateway.</small></div>
    </div></Col>
    <Col lg={5}><div className="white-panel order-summary"><h4>Đơn hàng ({lines.length} sản phẩm)</h4>{lines.map((item) => <div className="summary-line" key={item.laptopId}><span>{item.product.name} × {item.quantity}</span><strong>{money(item.product.price * item.quantity)}</strong></div>)}<div className="summary-line summary-total"><span>Tổng cộng</span><strong>{money(total)}</strong></div><Button type="submit" variant="danger" className="w-100 mt-3" disabled={!lines.length}>Đặt hàng (COD)</Button><Button as={Link} to="/cart" variant="link" className="w-100 mt-2 text-secondary">← Quay lại giỏ</Button></div></Col></Row></Form>
  </Container>;
}
