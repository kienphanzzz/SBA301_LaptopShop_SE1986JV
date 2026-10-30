import React, { useState } from 'react';
import { Alert, Button, Col, Container, Form, Row } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { PageTitle } from '../components/Ui';
import { isValidPhone, money } from '../data/helpers';

export function Checkout({ cart, user, onPlaceOrder }) {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    receiverName: user.fullName || '',
    phone: user.phone || '',
    address: user.address || '',
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const totalAmount = cart.reduce((sum, item) => sum + item.quantity * item.product.price, 0);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (submitting) return;

    const nextErrors = {};
    if (!form.receiverName.trim()) {
      nextErrors.receiverName = 'Vui lòng nhập họ tên người nhận.';
    }
    if (!isValidPhone(form.phone)) {
      nextErrors.phone = 'Số điện thoại phải có từ 9 đến 11 chữ số.';
    }
    if (!form.address.trim()) {
      nextErrors.address = 'Vui lòng nhập địa chỉ nhận hàng.';
    }
    if (!cart.length) {
      nextErrors.cart = 'Giỏ hàng đang trống, không thể đặt hàng.';
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    const result = await onPlaceOrder(form);

    if (result.error) {
      setErrors({ cart: result.error });
      setSubmitting(false);
      return;
    }

    navigate('/orders/' + result.id);
    setSubmitting(false);
  }

  const formFields = [
    { name: 'receiverName', label: 'Họ tên người nhận' },
    { name: 'phone', label: 'Số điện thoại' },
    { name: 'address', label: 'Địa chỉ giao hàng' },
  ];

  return (
    <Container className="py-4">
      <PageTitle
        title="Thông tin đặt hàng"
        description="Xác nhận người nhận và địa chỉ giao hàng. Phương thức thanh toán: COD."
      />

      <Form onSubmit={handleSubmit}>
        <Row className="g-4">
          <Col lg={7}>
            <div className="white-panel">
              <h4>Thông tin nhận hàng</h4>

              {errors.cart && <Alert variant="danger">{errors.cart}</Alert>}

              {formFields.map((field) => (
                <Form.Group key={field.name} className="mb-3">
                  <Form.Label>
                    {field.label} <span className="required">*</span>
                  </Form.Label>
                  <Form.Control
                    name={field.name}
                    value={form[field.name]}
                    onChange={handleChange}
                    isInvalid={!!errors[field.name]}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors[field.name]}
                  </Form.Control.Feedback>
                </Form.Group>
              ))}

              <div className="cod-box">
                <strong>◉ Thanh toán khi nhận hàng (COD)</strong>
                <small className="d-block text-muted mt-1">
                  Thanh toán trực tiếp bằng tiền mặt cho nhân viên giao hàng.
                </small>
              </div>
            </div>
          </Col>

          <Col lg={5}>
            <div className="white-panel order-summary">
              <h4>Đơn hàng ({cart.length} sản phẩm)</h4>

              {cart.map((item) => (
                <div className="summary-line" key={item.laptopId}>
                  <span>
                    {item.product.name} × {item.quantity}
                  </span>
                  <strong>{money(item.product.price * item.quantity)}</strong>
                </div>
              ))}

              <div className="summary-line summary-total">
                <span>Tổng cộng:</span>
                <strong className="text-danger">{money(totalAmount)}</strong>
              </div>

              <Button
                type="submit"
                variant="danger"
                className="w-100 mt-3"
                disabled={!cart.length || submitting}
              >
                {submitting ? 'Đang đặt hàng...' : 'Đặt hàng (COD)'}
              </Button>

              <Button
                as={Link}
                to="/cart"
                variant="link"
                className="w-100 mt-2 text-secondary"
              >
                ← Quay lại giỏ hàng
              </Button>
            </div>
          </Col>
        </Row>
      </Form>
    </Container>
  );
}

export default Checkout;
