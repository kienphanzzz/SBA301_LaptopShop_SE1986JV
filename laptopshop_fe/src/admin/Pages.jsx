import React, { useEffect, useState } from 'react';
import { Alert, Badge, Button, Col, Container, Form, Modal, Row, Spinner, Table } from 'react-bootstrap';
import { Link, useParams } from 'react-router-dom';
import { EmptyState, StatusBadge } from '../components/Ui';
import { brandName, money, nextOrderStatus, orderLabels } from '../data/helpers';
import { adminApi } from '../api/adminApi';
import { getApiErrorMessage } from '../api/catalogApi';

function AdminSection({ title, description, children }) {
  return <Container className="admin-page pb-5"><div className="admin-page-title"><h3>{title}</h3>{description && <p>{description}</p>}</div>{children}</Container>;
}

export function AdminDashboard({ data }) {
  const finished = data.orders.filter((item) => item.status === 'COMPLETED');
  const revenue = finished.reduce((sum, order) => sum + order.totalAmount, 0);
  const stats = [['Laptop đang kinh doanh', data.products.filter((item) => item.status === 'ACTIVE').length, '/admin/laptops'], ['Đơn hàng', data.orders.length, '/admin/orders'], ['Đơn chờ xác nhận', data.orders.filter((item) => item.status === 'PENDING').length, '/admin/orders'], ['Doanh thu đã hoàn tất', money(revenue), '/admin/reports']];
  return <AdminSection title="Tổng quan cửa hàng" description="Nhìn nhanh các chỉ số cơ bản của hệ thống cửa hàng.">
    <Row className="g-3">{stats.map(([title, value, path]) => <Col md={6} xl={3} key={title}><Link className="stat-card" to={path}><span>{title}</span><strong>{value}</strong><span className="stat-more">Xem chi tiết →</span></Link></Col>)}</Row>
    <div className="white-panel mt-4"><h4>Chức năng quản lý</h4><Row className="g-3 mt-1">{[['Sản phẩm & giá','/admin/laptops','Thêm / sửa / ngừng kinh doanh'],['Kho hàng','/admin/inventory','Kiểm tra & điều chỉnh tồn kho'],['Đơn hàng','/admin/orders','Xử lý PENDING → SHIPPING'],['Báo cáo','/admin/reports','Chỉ tính đơn COMPLETED']].map(([title,path,desc]) => <Col md={6} key={path}><Link to={path} className="quick-link"><strong>{title}</strong><small>{desc}</small><span>→</span></Link></Col>)}</Row></div>
  </AdminSection>;
}

const emptyForm = { sku:'', name:'', brandId:'1', categoryId:'1', price:'', oldPrice:'', stockQuantity:'0', status:'ACTIVE', image:'/assets/laptop-silver.svg', specs:'', description:'' };

export function AdminProducts({ data, onSave }) {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  function change(e) { setForm({ ...form, [e.target.name]: e.target.value }); }
  function create() { setEditingId(null); setForm(emptyForm); setError(''); setOpen(true); }
  function edit(item) { setEditingId(item.id); setForm({ ...item, brandId:String(item.brandId), categoryId:String(item.categoryId), price:String(item.price), oldPrice:item.oldPrice == null ? '' : String(item.oldPrice), stockQuantity:String(item.stockQuantity) }); setError(''); setOpen(true); }
  async function save(e) { e.preventDefault(); if (!Number.isInteger(Number(form.stockQuantity))) { setError('Tồn kho phải là số nguyên.'); return; } const message = await onSave(form, editingId); setError(message); if (!message) setOpen(false); }
  return <AdminSection title="Quản lý laptop" description="UC-13: Tạo, cập nhật và ngừng kinh doanh sản phẩm. Không xóa cứng.">
    <div className="white-panel"><div className="table-heading"><h4>Danh sách laptop ({data.products.length})</h4><Button variant="danger" onClick={create}>+ Thêm laptop</Button></div><div className="table-responsive"><Table hover className="align-middle admin-table"><thead><tr><th>Ảnh</th><th>SKU / Tên</th><th>Thương hiệu</th><th>Giá</th><th>Kho</th><th>Trạng thái</th><th></th></tr></thead><tbody>{data.products.map((item) => <tr key={item.id}><td><img className="table-laptop-img" src={item.image} alt=""/></td><td><strong>{item.name}</strong><div className="text-muted small">{item.sku}</div></td><td>{brandName(data.brands, item.brandId)}</td><td className="fw-semibold">{money(item.price)}</td><td>{item.stockQuantity}</td><td><Badge bg={item.status === 'ACTIVE' ? 'success' : 'secondary'}>{item.status}</Badge></td><td><Button variant="outline-danger" size="sm" onClick={() => edit(item)}>Chỉnh sửa</Button></td></tr>)}</tbody></Table></div></div>
    <Modal show={open} onHide={() => setOpen(false)} size="lg" centered><Form onSubmit={save}><Modal.Header closeButton><Modal.Title>{editingId ? 'Sửa thông tin laptop' : 'Thêm laptop mới'}</Modal.Title></Modal.Header><Modal.Body>
      {error && <Alert variant="danger">{error}</Alert>}
      <Row className="g-3"><Col md={5}><Form.Label>Mã SKU *</Form.Label><Form.Control required name="sku" value={form.sku} onChange={change}/></Col><Col md={7}><Form.Label>Tên laptop *</Form.Label><Form.Control required name="name" value={form.name} onChange={change}/></Col>
      <Col md={6}><Form.Label>Thương hiệu *</Form.Label><Form.Select name="brandId" value={form.brandId} onChange={change}>{data.brands.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</Form.Select></Col>
      <Col md={6}><Form.Label>Danh mục *</Form.Label><Form.Select name="categoryId" value={form.categoryId} onChange={change}>{data.categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</Form.Select></Col>
      <Col md={4}><Form.Label>Giá bán (VND) *</Form.Label><Form.Control required type="number" min="1" name="price" value={form.price} onChange={change}/></Col><Col md={4}><Form.Label>Giá gốc (VND)</Form.Label><Form.Control type="number" min="0" name="oldPrice" value={form.oldPrice} onChange={change}/></Col><Col md={4}><Form.Label>Tồn kho *</Form.Label><Form.Control required type="number" min="0" name="stockQuantity" value={form.stockQuantity} onChange={change}/></Col>
      <Col md={6}><Form.Label>Trạng thái</Form.Label><Form.Select name="status" value={form.status} onChange={change}><option value="ACTIVE">ACTIVE</option><option value="INACTIVE">INACTIVE</option></Form.Select></Col>
      <Col md={6}><Form.Label>Hình ảnh sản phẩm</Form.Label><Form.Select name="image" value={form.image} onChange={change}><option value="/assets/laptop-silver.svg">Laptop bạc</option><option value="/assets/laptop-blue.svg">Laptop xanh</option><option value="/assets/laptop-dark.svg">Laptop gaming đen</option><option value="/assets/laptop-rose.svg">Laptop hồng bạc</option></Form.Select></Col>
      <Col xs={12}><Form.Label>Cấu hình</Form.Label><Form.Control name="specs" value={form.specs} onChange={change} placeholder="CPU, RAM, SSD, màn hình..."/></Col><Col xs={12}><Form.Label>Mô tả</Form.Label><Form.Control name="description" as="textarea" rows={3} value={form.description} onChange={change}/></Col></Row>
    </Modal.Body><Modal.Footer><Button variant="outline-secondary" onClick={() => setOpen(false)}>Đóng</Button><Button variant="danger" type="submit">Lưu laptop</Button></Modal.Footer></Form></Modal>
  </AdminSection>;
}

export function AdminTaxonomy({ data, type, onSave }) {
  const [name, setName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const title = type === 'brands' ? 'Thương hiệu' : 'Danh mục';
  const rows = data[type];
  async function submit(e) { e.preventDefault(); const result = await onSave(type, name, editingId); setError(result); if (!result) { setName(''); setEditingId(null); } }
  function edit(item) { setName(item.name); setEditingId(item.id); setError(''); }
  return <AdminSection title={'Quản lý ' + title.toLowerCase()} description="UC-14: Tạo mới / cập nhật dữ liệu phục vụ quản lý laptop."><Row className="g-4"><Col lg={7}><div className="white-panel"><h4>Danh sách {title.toLowerCase()}</h4><Table hover className="align-middle"><thead><tr><th>ID</th><th>Tên</th><th>Trạng thái</th><th></th></tr></thead><tbody>{rows.map((item) => <tr key={item.id}><td>{item.id}</td><td className="fw-semibold">{item.name}</td><td><Badge bg="success">{item.status}</Badge></td><td><Button variant="outline-danger" size="sm" onClick={() => edit(item)}>Sửa</Button></td></tr>)}</tbody></Table></div></Col><Col lg={5}><div className="white-panel"><h4>{editingId ? 'Cập nhật ' + title.toLowerCase() : 'Thêm ' + title.toLowerCase()}</h4>{error && <Alert variant="danger">{error}</Alert>}<Form onSubmit={submit}><Form.Label>Tên {title.toLowerCase()}</Form.Label><Form.Control value={name} onChange={(e) => setName(e.target.value)} required/><div className="d-flex gap-2 mt-3"><Button variant="danger" type="submit">{editingId ? 'Lưu thay đổi' : 'Thêm mới'}</Button>{editingId && <Button variant="outline-secondary" onClick={() => { setEditingId(null); setName(''); setError(''); }}>Hủy sửa</Button>}</div></Form><p className="small text-muted mt-3 mb-0">Không có nút xóa cứng Brand/Category đang được sản phẩm sử dụng.</p></div></Col></Row></AdminSection>;
}

export function AdminInventory({ data, onUpdate }) {
  const [stocks, setStocks] = useState(() => Object.fromEntries(data.products.map((p) => [p.id, String(p.stockQuantity)])));
  const [error, setError] = useState('');
  async function save(id) { setError(await onUpdate(id, stocks[id])); }
  return <AdminSection title="Quản lý tồn kho" description="UC-15: Admin cập nhật StockQuantity. Không chấp nhận số âm."><div className="white-panel"><div className="table-responsive"><Table hover className="align-middle"><thead><tr><th>SKU</th><th>Tên laptop</th><th>Tồn hiện tại</th><th>Tồn mới</th><th>Thao tác</th></tr></thead><tbody>{data.products.map((item) => <tr key={item.id}><td>{item.sku}</td><td className="fw-semibold">{item.name}</td><td><Badge bg={item.stockQuantity === 0 ? 'danger' : 'success'}>{item.stockQuantity}</Badge></td><td><Form.Control type="number" min="0" className="stock-input" value={stocks[item.id] ?? item.stockQuantity} onChange={(e) => setStocks({ ...stocks, [item.id]: e.target.value })}/></td><td><Button size="sm" variant="outline-danger" onClick={() => save(item.id)}>Cập nhật</Button></td></tr>)}</tbody></Table></div>{error && <Alert variant="danger">{error}</Alert>}</div></AdminSection>;
}

export function AdminOrders({ data }) {
  const [status, setStatus] = useState('');
  const [keyword, setKeyword] = useState('');
  const orders = data.orders.filter((item) => (!status || item.status === status) && (!keyword.trim() || String(item.id).includes(keyword.trim()) || (item.userEmail || '').toLowerCase().includes(keyword.toLowerCase()))).sort((a,b) => b.id - a.id);
  return <AdminSection title="Quản lý đơn hàng" description="UC-16: Xem toàn bộ đơn và tìm theo trạng thái, mã đơn hoặc email."><div className="white-panel"><Row className="g-3 mb-3"><Col md={7}><Form.Control value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="Tìm mã đơn hoặc email khách hàng"/></Col><Col md={5}><Form.Select value={status} onChange={(e) => setStatus(e.target.value)}><option value="">Tất cả trạng thái</option>{Object.entries(orderLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</Form.Select></Col></Row><div className="table-responsive"><Table hover className="align-middle"><thead><tr><th>Mã đơn</th><th>Khách hàng</th><th>Ngày</th><th>Tổng tiền</th><th>Trạng thái</th><th></th></tr></thead><tbody>{orders.map((item) => <tr key={item.id}><td className="fw-bold">#{item.id}</td><td>{data.users.find((user) => user.id === item.userId)?.email || 'Không rõ'}</td><td>{item.orderDate}</td><td>{money(item.totalAmount)}</td><td><StatusBadge status={item.status}/></td><td><Button as={Link} to={'/admin/orders/' + item.id} variant="outline-danger" size="sm">Xử lý / Xem</Button></td></tr>)}</tbody></Table></div>{orders.length === 0 && <EmptyState title="Không có đơn hàng phù hợp"/>}</div></AdminSection>;
}

export function AdminOrderDetails({ onAdvance }) {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    setLoading(true);
    adminApi.getOrder(id)
      .then((result) => { if (active) setOrder(result); })
      .catch((requestError) => {
        if (active) setError(getApiErrorMessage(requestError, 'Không thể tải đơn hàng.'));
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id]);
  if (loading) return <AdminSection title="Đang tải đơn hàng"><div className="text-center"><Spinner animation="border" variant="danger" /></div></AdminSection>;
  if (!order) return <AdminSection title="Không tìm thấy đơn hàng"><Alert variant="danger">{error}</Alert></AdminSection>;
  const next = nextOrderStatus[order.status];
  return <AdminSection title={'Xử lý đơn #' + order.id} description="UC-17: Chuyển trạng thái theo đúng thứ tự, không chuyển ngược.">
    <div className="white-panel"><div className="d-flex justify-content-between gap-2 flex-wrap mb-3"><h4>Thông tin đơn hàng</h4><StatusBadge status={order.status}/></div><p><b>Người nhận:</b> {order.receiverName} · {order.phone}</p><p><b>Ngày đặt:</b> {order.orderDate}</p><p><b>Địa chỉ:</b> {order.address}</p><p><b>Hình thức thanh toán:</b> {order.paymentMethod}</p><Table className="align-middle"><thead><tr><th>Laptop (snapshot)</th><th>Giá lúc đặt</th><th>SL</th><th>Thành tiền</th></tr></thead><tbody>{order.items.map((item, i) => <tr key={i}><td>{item.productName}</td><td>{money(item.unitPrice)}</td><td>{item.quantity}</td><td>{money(item.unitPrice * item.quantity)}</td></tr>)}</tbody></Table><h4 className="text-end text-danger">Tổng: {money(order.totalAmount)}</h4>{error && <Alert variant="danger">{error}</Alert>}
      <div className="d-flex flex-wrap gap-2 mt-4"><Button as={Link} variant="outline-secondary" to="/admin/orders">← Danh sách đơn</Button>{next && <Button variant="danger" onClick={async () => { const message = await onAdvance(order.id, next); setError(message); if (!message) setOrder((current) => ({ ...current, status: next })); }}>Chuyển sang {orderLabels[next]} →</Button>}{(order.status === 'COMPLETED' || order.status === 'CANCELLED') && <Badge bg="secondary" className="align-self-center p-2">Đơn đã kết thúc, không thể xử lý tiếp</Badge>}{order.status === 'SHIPPING' && <span className="small align-self-center text-muted">Chờ Customer xác nhận đã nhận hàng.</span>}</div></div>
  </AdminSection>;
}

export function AdminReports() {
  const today = new Date().toISOString().slice(0, 10);
  const [fromDate, setFromDate] = useState(today.slice(0, 4) + '-01-01');
  const [toDate, setToDate] = useState(today);
  const [report, setReport] = useState({ orders: [], completedOrderCount: 0, totalRevenue: 0 });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    adminApi.getSalesReport(fromDate, toDate)
      .then((result) => { if (active) setReport(result); })
      .catch((requestError) => {
        if (active) setError(getApiErrorMessage(requestError, 'Không thể tải báo cáo doanh số.'));
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [fromDate, toDate]);
  const orders = report.orders;
  const total = report.totalRevenue;
  return <AdminSection title="Báo cáo doanh số" description="UC-18: Chỉ tính đơn hàng COMPLETED theo khoảng thời gian đã chọn.">
    <div className="white-panel"><Row className="g-3 mb-4"><Col sm={6} md={4}><Form.Label>Từ ngày</Form.Label><Form.Control type="date" value={fromDate} max={toDate} onChange={(e) => setFromDate(e.target.value)}/></Col><Col sm={6} md={4}><Form.Label>Đến ngày</Form.Label><Form.Control type="date" value={toDate} min={fromDate} onChange={(e) => setToDate(e.target.value)}/></Col></Row>
      {error && <Alert variant="danger">{error}</Alert>}{loading ? <div className="text-center py-3"><Spinner animation="border" variant="danger" /></div> : <><Row className="g-3 mb-4"><Col md={6}><div className="report-stat"><span>Số đơn COMPLETED</span><strong>{report.completedOrderCount}</strong></div></Col><Col md={6}><div className="report-stat"><span>Doanh thu hoàn tất</span><strong>{money(total)}</strong></div></Col></Row>
      <h4>Đơn đóng góp doanh thu</h4>{orders.length === 0 ? <EmptyState title="Chưa có đơn hoàn tất trong kỳ" text="Doanh thu trong kỳ bằng 0." /> : <div className="table-responsive"><Table className="align-middle"><thead><tr><th>Mã đơn</th><th>Ngày đặt</th><th>Trạng thái</th><th>Tổng tiền</th></tr></thead><tbody>{orders.map((item) => <tr key={item.id}><td>#{item.id}</td><td>{item.orderDate}</td><td><StatusBadge status={item.status}/></td><td>{money(item.totalAmount)}</td></tr>)}</tbody></Table></div>}</>}
    </div></AdminSection>;
}
