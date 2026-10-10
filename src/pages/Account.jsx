import React, { useState } from 'react';
import { Alert, Button, Card, Col, Container, Form, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { isValidEmail, isValidPhone } from '../data/helpers';
import { PageTitle } from '../components/Ui';

export function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  function submit(e) { e.preventDefault(); setError(onLogin(email, password)); }
  return <Container className="account-wrap"><div className="account-card"><div className="eyebrow">LAPTOPHUB ACCOUNT</div><h2>Chào mừng trở lại</h2><p>Đăng nhập để quản lý giỏ hàng và đơn mua laptop.</p>
    {error && <Alert variant="danger">{error}</Alert>}
    <Form onSubmit={submit}><Form.Group className="mb-3"><Form.Label>Email</Form.Label><Form.Control type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="Nhập email"/></Form.Group>
    <Form.Group className="mb-4"><Form.Label>Mật khẩu</Form.Label><Form.Control type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="Nhập mật khẩu"/></Form.Group>
    <Button className="w-100" variant="danger" type="submit">Đăng nhập</Button></Form>
    <div className="demo-accounts"><strong>Tài khoản thử nghiệm nhanh</strong><button type="button" onClick={() => { setEmail('khach@laptophub.demo'); setPassword('123456'); }}>Customer · Điền tài khoản</button><button type="button" onClick={() => { setEmail('admin@laptophub.demo'); setPassword('123456'); }}>Admin · Điền tài khoản</button><small>Mật khẩu dùng chung: 123456</small></div>
    <p className="account-bottom">Chưa có tài khoản? <Link to="/register">Đăng ký Customer</Link></p>
  </div></Container>;
}

export function Register({ onRegister }) {
  const [form, setForm] = useState({ fullName: '', email: '', password: '', phone: '' });
  const [error, setError] = useState('');
  function change(e) { setForm({ ...form, [e.target.name]: e.target.value }); }
  function submit(e) {
    e.preventDefault();
    if (!form.fullName.trim() || !isValidEmail(form.email) || !isValidPhone(form.phone) || form.password.length < 6) { setError('Vui lòng nhập họ tên, email hợp lệ, SĐT 9–11 chữ số và mật khẩu ít nhất 6 ký tự.'); return; }
    setError(onRegister(form));
  }
  return <Container className="account-wrap"><div className="account-card"><div className="eyebrow">TẠO TÀI KHOẢN</div><h2>Đăng ký Customer</h2><p>Đăng ký tài khoản để bắt đầu mua sắm tại LaptopHub.</p>
    {error && <Alert variant="danger">{error}</Alert>}
    <Form onSubmit={submit}>{[{name:'fullName',label:'Họ và tên',type:'text'},{name:'email',label:'Email',type:'email'},{name:'phone',label:'Số điện thoại',type:'tel'},{name:'password',label:'Mật khẩu',type:'password'}].map((field) => <Form.Group key={field.name} className="mb-3"><Form.Label>{field.label}</Form.Label><Form.Control name={field.name} type={field.type} value={form[field.name]} onChange={change} required/></Form.Group>)}
    <Button type="submit" variant="danger" className="w-100">Đăng ký tài khoản</Button></Form>
    <p className="account-bottom">Đã có tài khoản? <Link to="/login">Đăng nhập</Link></p>
  </div></Container>;
}

export function Profile({ user, onSave }) {
  const [form, setForm] = useState({ fullName: user.fullName, phone: user.phone || '', address: user.address || '' });
  const [error, setError] = useState('');
  function change(e) { setForm({ ...form, [e.target.name]: e.target.value }); }
  function submit(e) { e.preventDefault(); if (!form.fullName.trim() || !isValidPhone(form.phone)) { setError('Tên không được trống và điện thoại phải có 9–11 chữ số.'); return; } setError(''); onSave(form); }
  return <Container className="py-4"><PageTitle title="Hồ sơ của tôi" description="Cập nhật thông tin liên hệ và địa chỉ nhận hàng."/><Row><Col lg={7}><Card className="panel-card"><Card.Body className="p-4">{error && <Alert variant="danger">{error}</Alert>}
    <Form onSubmit={submit}><Form.Group className="mb-3"><Form.Label>Họ tên</Form.Label><Form.Control name="fullName" value={form.fullName} onChange={change} required/></Form.Group><Form.Group className="mb-3"><Form.Label>Email (không chỉnh sửa)</Form.Label><Form.Control value={user.email} readOnly disabled/></Form.Group><Form.Group className="mb-3"><Form.Label>Số điện thoại</Form.Label><Form.Control name="phone" value={form.phone} onChange={change} required/></Form.Group><Form.Group className="mb-3"><Form.Label>Địa chỉ nhận hàng</Form.Label><Form.Control as="textarea" rows={3} name="address" value={form.address} onChange={change}/></Form.Group><Button type="submit" variant="danger">Lưu thay đổi</Button></Form>
  </Card.Body></Card></Col></Row></Container>;
}
