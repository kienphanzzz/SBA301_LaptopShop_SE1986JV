import React, { useState } from 'react';
import { Alert, Button, Container, Modal, Table } from 'react-bootstrap';
import { Link, useParams } from 'react-router-dom';
import { EmptyState, PageTitle, StatusBadge } from '../components/Ui';
import { money } from '../data/helpers';

export function MyOrders({ data, user }) {
  const orders = data.orders.filter((item) => item.userId === user.id).sort((a,b) => b.id - a.id);
  return <Container className="py-4"><PageTitle title="Đơn hàng của tôi" description="Xem các đơn hàng thuộc tài khoản hiện tại."/>
    {!orders.length ? <EmptyState title="Bạn chưa có đơn hàng" to="/"/> : <div className="white-panel table-responsive"><Table hover className="align-middle"><thead><tr><th>Mã đơn</th><th>Ngày đặt</th><th>Thành tiền</th><th>Trạng thái</th><th>Chi tiết</th></tr></thead><tbody>{orders.map((order) => <tr key={order.id}><td className="fw-bold">#{order.id}</td><td>{order.orderDate}</td><td>{money(order.totalAmount)}</td><td><StatusBadge status={order.status}/></td><td><Button as={Link} to={'/orders/' + order.id} variant="outline-danger" size="sm">Xem đơn</Button></td></tr>)}</tbody></Table></div>}
  </Container>;
}

export function MyOrderDetails({ data, user, onCancel, onConfirm }) {
  const { id } = useParams();
  const order = data.orders.find((item) => item.id === Number(id) && item.userId === user.id);
  const [confirm, setConfirm] = useState('');
  if (!order) return <Container className="py-5"><Alert variant="danger">Không tìm thấy đơn hàng của bạn.</Alert><Link to="/orders">Trở lại danh sách đơn</Link></Container>;
  function handleAction() { if (confirm === 'cancel') onCancel(order.id); if (confirm === 'receive') onConfirm(order.id); setConfirm(''); }
  return <Container className="py-4"><div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4"><div><div className="eyebrow">ĐƠN HÀNG CỦA TÔI</div><h1 className="section-title">Đơn hàng #{order.id}</h1></div><StatusBadge status={order.status}/></div>
    <div className="white-panel mb-4"><h4>Thông tin đơn hàng</h4><p><b>Ngày đặt:</b> {order.orderDate}</p><p><b>Người nhận:</b> {order.receiverName}</p><p><b>Điện thoại:</b> {order.phone}</p><p><b>Địa chỉ:</b> {order.address}</p><p><b>Thanh toán:</b> {order.paymentMethod}</p></div>
    <div className="white-panel table-responsive"><h4>Sản phẩm đã đặt</h4><Table className="align-middle"><thead><tr><th>Tên laptop tại thời điểm đặt</th><th>Đơn giá</th><th>Số lượng</th><th>Thành tiền</th></tr></thead><tbody>{order.items.map((line, i) => <tr key={i}><td>{line.productName}</td><td>{money(line.unitPrice)}</td><td>{line.quantity}</td><td>{money(line.unitPrice * line.quantity)}</td></tr>)}</tbody></Table><div className="text-end fs-5 fw-bold">Tổng: <span className="text-danger">{money(order.totalAmount)}</span></div></div>
    <div className="d-flex gap-2 mt-3 flex-wrap"><Button as={Link} to="/orders" variant="outline-secondary">← Đơn hàng của tôi</Button>{order.status === 'PENDING' && <Button variant="outline-danger" onClick={() => setConfirm('cancel')}>Hủy đơn</Button>}{order.status === 'SHIPPING' && <Button variant="success" onClick={() => setConfirm('receive')}>Đã nhận hàng</Button>}</div>
    <Modal show={!!confirm} onHide={() => setConfirm('')} centered><Modal.Header closeButton><Modal.Title>Xác nhận</Modal.Title></Modal.Header><Modal.Body>{confirm === 'cancel' ? 'Bạn chắc chắn muốn hủy đơn hàng này? Tồn kho sẽ được hoàn lại.' : 'Xác nhận bạn đã nhận đủ sản phẩm trong đơn hàng?'}</Modal.Body><Modal.Footer><Button variant="outline-secondary" onClick={() => setConfirm('')}>Đóng</Button><Button variant="danger" onClick={handleAction}>Xác nhận</Button></Modal.Footer></Modal>
  </Container>;
}
