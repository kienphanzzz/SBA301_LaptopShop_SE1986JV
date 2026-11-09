import React, { useEffect, useState } from 'react';
import { Alert, Button, Col, Container, Modal, Row, Spinner, Table } from 'react-bootstrap';
import { Link, useParams } from 'react-router-dom';
import { EmptyState, PageTitle, StatusBadge } from '../components/Ui';
import { money } from '../data/helpers';
import { shoppingApi } from '../api/shoppingApi';
import { getApiErrorMessage } from '../api/catalogApi';

export function MyOrders({ data }) {
  const orders = data.orders || [];

  return (
    <Container className="py-4">
      <PageTitle
        title="Đơn hàng của tôi"
        description="Xem và theo dõi trạng thái các đơn hàng bạn đã đặt mua."
      />

      {orders.length === 0 ? (
        <EmptyState
          title="Bạn chưa có đơn hàng nào"
          text="Khám phá các sản phẩm laptop và đặt đơn hàng đầu tiên."
          to="/"
          action="Khám phá laptop"
        />
      ) : (
        <div className="white-panel table-responsive">
          <Table hover className="align-middle">
            <thead>
              <tr>
                <th>Mã đơn</th>
                <th>Ngày đặt</th>
                <th>Tổng tiền</th>
                <th>Trạng thái</th>
                <th style={{ width: '120px' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td className="fw-bold text-danger">#{order.id}</td>
                  <td>{order.orderDate}</td>
                  <td className="fw-bold">{money(order.totalAmount)}</td>
                  <td>
                    <StatusBadge status={order.status} />
                  </td>
                  <td>
                    <Button
                      as={Link}
                      to={'/orders/' + order.id}
                      variant="outline-danger"
                      size="sm"
                    >
                      Xem chi tiết
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}
    </Container>
  );
}

export function MyOrderDetails({ onUpdate }) {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirmAction, setConfirmAction] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');

    shoppingApi.getMyOrder(id)
      .then((result) => {
        if (active) setOrder(result);
      })
      .catch((requestError) => {
        if (active) {
          setError(getApiErrorMessage(requestError, 'Không thể tải chi tiết đơn hàng.'));
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="danger" />
        <span className="ms-2">Đang tải thông tin đơn hàng...</span>
      </Container>
    );
  }

  if (!order) {
    return (
      <Container className="py-5">
        <Alert variant="danger">{error || 'Không tìm thấy đơn hàng của bạn.'}</Alert>
        <Button as={Link} to="/orders" variant="outline-secondary">
          ← Trở lại danh sách đơn
        </Button>
      </Container>
    );
  }

  async function handleConfirmAction() {
    const updatedOrder = await onUpdate(order.id, confirmAction);
    if (updatedOrder) {
      setOrder(updatedOrder);
    }
    setConfirmAction('');
  }

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
        <div>
          <div className="eyebrow">ĐƠN HÀNG CỦA TÔI</div>
          <h1 className="section-title mb-0">Chi tiết đơn hàng #{order.id}</h1>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div className="white-panel mb-4">
        <h4>Thông tin giao nhận</h4>
        <Row className="g-3 mt-1">
          <Col md={6}>
            <p className="mb-2"><b>Ngày đặt hàng:</b> {order.orderDate}</p>
            <p className="mb-2"><b>Người nhận hàng:</b> {order.receiverName}</p>
            <p className="mb-0"><b>Số điện thoại:</b> {order.phone}</p>
          </Col>
          <Col md={6}>
            <p className="mb-2"><b>Địa chỉ nhận hàng:</b> {order.address}</p>
            <p className="mb-0"><b>Phương thức thanh toán:</b> {order.paymentMethod} (Thanh toán khi nhận hàng)</p>
          </Col>
        </Row>
      </div>

      <div className="white-panel table-responsive">
        <h4>Danh sách sản phẩm</h4>
        <Table className="align-middle mt-2">
          <thead>
            <tr>
              <th>Tên sản phẩm</th>
              <th>Đơn giá</th>
              <th style={{ width: '100px' }}>Số lượng</th>
              <th className="text-end">Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item, index) => (
              <tr key={index}>
                <td className="fw-semibold">{item.productName}</td>
                <td>{money(item.unitPrice)}</td>
                <td>{item.quantity}</td>
                <td className="text-end fw-bold">
                  {money(item.unitPrice * item.quantity)}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>

        <div className="text-end fs-5 fw-bold pt-2 border-top">
          Tổng thanh toán: <span className="text-danger">{money(order.totalAmount)}</span>
        </div>
      </div>

      <div className="d-flex gap-2 mt-4 flex-wrap">
        <Button as={Link} to="/orders" variant="outline-secondary">
          ← Quay lại danh sách
        </Button>

        {order.status === 'PENDING' && (
          <Button
            variant="outline-danger"
            onClick={() => setConfirmAction('cancel')}
          >
            Hủy đơn hàng
          </Button>
        )}

        {order.status === 'SHIPPING' && (
          <Button
            variant="success"
            onClick={() => setConfirmAction('receive')}
          >
            Đã nhận được hàng
          </Button>
        )}
      </div>

      <Modal show={!!confirmAction} onHide={() => setConfirmAction('')} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {confirmAction === 'cancel' ? 'Xác nhận hủy đơn hàng' : 'Xác nhận đã nhận hàng'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {confirmAction === 'cancel'
            ? 'Bạn có chắc chắn muốn hủy đơn hàng này? Số lượng tồn kho sẽ được hoàn trả lại cho cửa hàng.'
            : 'Xác nhận bạn đã nhận đủ và kiểm tra đúng các sản phẩm trong đơn hàng?'}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setConfirmAction('')}>
            Đóng
          </Button>
          <Button
            variant={confirmAction === 'cancel' ? 'danger' : 'success'}
            onClick={handleConfirmAction}
          >
            {confirmAction === 'cancel' ? 'Đồng ý hủy' : 'Xác nhận'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}
