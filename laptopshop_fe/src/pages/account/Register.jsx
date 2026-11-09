import React, { useEffect, useState } from 'react';
import { Alert, Button, Col, Container, Form, Row, Spinner } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../../api/authApi';
import { isValidEmail, isValidPhone } from '../../data/helpers';
import { PasswordField } from './PasswordField';

export function Register({ user, onRegisterSuccess }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      navigate(user.role === 'ADMIN' ? '/admin' : '/', { replace: true });
    }
  }, [user, navigate]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
  }

  function validateForm() {
    const nextErrors = {};
    if (!form.fullName.trim()) {
      nextErrors.fullName = 'Họ và tên không được để trống.';
    } else if (form.fullName.trim().length > 150) {
      nextErrors.fullName = 'Họ và tên không vượt quá 150 ký tự.';
    }

    if (!form.email.trim()) {
      nextErrors.email = 'Email không được để trống.';
    } else if (!isValidEmail(form.email.trim())) {
      nextErrors.email = 'Định dạng email không hợp lệ.';
    }

    if (!form.phone.trim()) {
      nextErrors.phone = 'Số điện thoại không được để trống.';
    } else if (!isValidPhone(form.phone.trim())) {
      nextErrors.phone = 'Số điện thoại phải bắt đầu bằng số 0 và gồm 9 đến 11 chữ số.';
    }

    if (!form.password) {
      nextErrors.password = 'Mật khẩu không được để trống.';
    } else if (form.password.length < 6) {
      nextErrors.password = 'Mật khẩu phải có tối thiểu 6 ký tự.';
    }

    if (!form.confirmPassword) {
      nextErrors.confirmPassword = 'Vui lòng nhập lại mật khẩu xác nhận.';
    } else if (form.password !== form.confirmPassword) {
      nextErrors.confirmPassword = 'Mật khẩu xác nhận không khớp.';
    }

    return nextErrors;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (submitting) return;

    setServerError('');
    const nextErrors = validateForm();
    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      const created = await authApi.register({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        password: form.password,
        confirmPassword: form.confirmPassword,
      });

      if (onRegisterSuccess) {
        onRegisterSuccess(created);
      }

      navigate('/login', {
        replace: true,
        state: {
          registeredEmail: created.email,
          registeredMessage: 'Đăng ký tài khoản thành công. Vui lòng đăng nhập để tiếp tục.',
        },
      });
    } catch (err) {
      const data = err.response?.data;
      if (data?.fieldErrors) {
        setFieldErrors((prev) => ({ ...prev, ...data.fieldErrors }));
      }
      setServerError(
        data?.message || 'Đăng ký tài khoản không thành công. Vui lòng kiểm tra lại thông tin.'
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-page-shell">
      <Container>
        <div className="auth-card-wrapper auth-card-wrapper-wide">
          <div className="auth-card">
            <div className="auth-card-header">
              <span className="auth-eyebrow">ĐĂNG KÝ THÀNH VIÊN</span>
              <h1 className="auth-title">Tạo tài khoản mới</h1>
              <p className="auth-subtitle">
                Điền thông tin bên dưới để tạo tài khoản mua sắm tại LaptopHub.
              </p>
            </div>

            {serverError && (
              <Alert variant="danger" className="auth-alert" role="alert">
                {serverError}
              </Alert>
            )}

            <Form noValidate onSubmit={handleSubmit} className="auth-form">
              <Form.Group className="auth-form-group" controlId="registerFullName">
                <Form.Label className="auth-label">
                  Họ và tên <span className="required">*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  name="fullName"
                  autoComplete="name"
                  placeholder="Nhập họ và tên đầy đủ"
                  value={form.fullName}
                  disabled={submitting}
                  isInvalid={!!fieldErrors.fullName}
                  onChange={handleChange}
                  className="auth-input"
                />
                {fieldErrors.fullName && (
                  <div className="auth-field-error">{fieldErrors.fullName}</div>
                )}
              </Form.Group>

              <Row className="g-3">
                <Col md={7}>
                  <Form.Group className="auth-form-group" controlId="registerEmail">
                    <Form.Label className="auth-label">
                      Địa chỉ email <span className="required">*</span>
                    </Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      autoComplete="email"
                      placeholder="name@example.com"
                      value={form.email}
                      disabled={submitting}
                      isInvalid={!!fieldErrors.email}
                      onChange={handleChange}
                      className="auth-input"
                    />
                    {fieldErrors.email && (
                      <div className="auth-field-error">{fieldErrors.email}</div>
                    )}
                  </Form.Group>
                </Col>

                <Col md={5}>
                  <Form.Group className="auth-form-group" controlId="registerPhone">
                    <Form.Label className="auth-label">
                      Số điện thoại <span className="required">*</span>
                    </Form.Label>
                    <Form.Control
                      type="tel"
                      name="phone"
                      autoComplete="tel"
                      placeholder="0912345678"
                      value={form.phone}
                      disabled={submitting}
                      isInvalid={!!fieldErrors.phone}
                      onChange={handleChange}
                      className="auth-input"
                    />
                    {fieldErrors.phone && (
                      <div className="auth-field-error">{fieldErrors.phone}</div>
                    )}
                  </Form.Group>
                </Col>
              </Row>

              <Row className="g-3">
                <Col md={6}>
                  <PasswordField
                    controlId="registerPassword"
                    label="Mật khẩu"
                    name="password"
                    autoComplete="new-password"
                    placeholder="Tối thiểu 6 ký tự"
                    value={form.password}
                    disabled={submitting}
                    error={fieldErrors.password}
                    onChange={handleChange}
                  />
                </Col>

                <Col md={6}>
                  <PasswordField
                    controlId="registerConfirmPassword"
                    label="Xác nhận mật khẩu"
                    name="confirmPassword"
                    autoComplete="new-password"
                    placeholder="Nhập lại mật khẩu"
                    value={form.confirmPassword}
                    disabled={submitting}
                    error={fieldErrors.confirmPassword}
                    visibilityLabel="mật khẩu xác nhận"
                    onChange={handleChange}
                  />
                </Col>
              </Row>

              <Button
                type="submit"
                variant="danger"
                className="auth-submit-btn w-100 mt-1"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Đang đăng ký...
                  </>
                ) : (
                  'Đăng ký tài khoản'
                )}
              </Button>
            </Form>

            <div className="auth-footer-switch">
              <span>Đã có tài khoản?</span>
              <Link to="/login" className="auth-switch-link">
                Đăng nhập
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
