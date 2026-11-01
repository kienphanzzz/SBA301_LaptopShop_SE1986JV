import React from 'react';
import { Button, Col, Container, Form, Row, Table } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { EmptyState, PageTitle } from '../components/Ui';
import { money } from '../data/helpers';

export function Cart({ cart, onQuantity, onRemove }) {
  const totalAmount = cart.reduce((sum, item) => sum + item.quantity * item.product.price, 0);
  const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);

  if (!cart.length) {
    return (
      <Container className="py-4">
        <PageTitle
          title="Giỏ hàng của bạn"
          description="Điều chỉnh số lượng trước khi tiến hành đặt mua."
        />
        <EmptyState
          title="Giỏ hàng đang trống"
          text="Khám phá laptop và thêm sản phẩm phù hợp."
          to="/"
          action="Khám phá laptop"
        />
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <PageTitle
        title="Giỏ hàng của bạn"
        description="Điều chỉnh số lượng trước khi tiến hành đặt mua."
      />

      <Row className="g-4">
        <Col lg={8}>
          <div className="white-panel">
            <div className="table-responsive">
              <Table className="cart-table align-middle">
                <thead>
                  <tr>
                    <th>Sản phẩm</th>
                    <th>Đơn giá</th>
                    <th style={{ width: '120px' }}>Số lượng</th>
                    <th>Thành tiền</th>
                    <th style={{ width: '80px' }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {cart.map((item) => (
                    <tr key={item.laptopId}>
                      <td>
                        <div className="cart-product">
                          <img
                            src={item.product.image}
                            alt={item.product.name}
                          />
                          <div>
                            <Link to={'/laptops/' + item.product.id}>
                              {item.product.name}
                            </Link>
                            <small className="d-block text-muted">
                              Kho: {item.product.stockQuantity}
                            </small>
                          </div>
                        </div>
                      </td>

                      <td>{money(item.product.price)}</td>

                      <td>
                        <Form.Control
                          className="cart-quantity"
                          type="number"
                          min="1"
                          max={item.product.stockQuantity}
                          value={item.quantity}
                          onChange={(e) =>
                            onQuantity(item.laptopId, Number(e.target.value))
                          }
                        />
                      </td>

                      <td className="fw-bold text-danger">
                        {money(item.product.price * item.quantity)}
                      </td>

                      <td>
                        <Button
                          size="sm"
                          variant="outline-danger"
                          onClick={() => onRemove(item.laptopId)}
                        >
                          Xóa
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </div>
        </Col>

        <Col lg={4}>
          <div className="white-panel order-summary">
            <h4>Thông tin đơn hàng</h4>

            <div className="summary-line">
              <span>Tổng số lượng:</span>
              <b>{totalQuantity} sản phẩm</b>
            </div>

            <div className="summary-line summary-total">
              <span>Tạm tính:</span>
              <strong className="text-danger">{money(totalAmount)}</strong>
            </div>

            <Button
              as={Link}
              to="/checkout"
              variant="danger"
              className="w-100 mt-3"
            >
              Tiến hành đặt hàng →
            </Button>

            <p className="small text-muted mt-3 mb-0">
              * Thanh toán COD khi nhận hàng. Không tích hợp cổng thanh toán.
            </p>
          </div>
        </Col>
      </Row>
    </Container>
  );
}

export default Cart;
