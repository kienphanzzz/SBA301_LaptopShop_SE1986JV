import React, { useEffect, useState } from 'react';
import { Alert, Button, Container, Form, Spinner } from 'react-bootstrap';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { authApi } from '../../api/authApi';
import { isValidEmail } from '../../data/helpers';
import { PasswordField } from './PasswordField';

export function Login({ user, onLoginSuccess }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState(location.state?.registeredEmail || '');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [infoBanner, setInfoBanner] = useState(location.state?.registeredMessage || '');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      navigate(user.role === 'ADMIN' ? '/admin' : '/', { replace: true });
    }
  }, [user, navigate]);

  async function handleSubmit(event) {
    event.preventDefault();
    if (submitting) return;

    setServerError('');
    setInfoBanner('');
    const nextErrors = {};
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      nextErrors.email = 'Vui lòng nhập địa chỉ email.';
    } else if (!isValidEmail(trimmedEmail)) {
      nextErrors.email = 'Định dạng email không hợp lệ.';
    }

    if (!password) {
      nextErrors.password = 'Vui lòng nhập mật khẩu.';
    }

    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      const profile = await authApi.login({
        email: trimmedEmail,
        password,
      });
      onLoginSuccess(profile);
    } catch (err) {
      const data = err.response?.data;
      if (data?.fieldErrors) {
        setFieldErrors(data.fieldErrors);
      }
      setServerError(
        data?.message ||
          'Không thể đăng nhập lúc này. Vui lòng kiểm tra lại thông tin hoặc kết nối mạng.'
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-page-shell">
      <Container>
        <div className="auth-card-wrapper">
          <div className="auth-card">
            <div className="auth-card-header">
              <span className="auth-eyebrow">TÀI KHOẢN LAPTOPHUB</span>
              <h1 className="auth-title">Đăng nhập</h1>
              <p className="auth-subtitle">
                Đăng nhập để quản lý giỏ hàng và theo dõi đơn hàng của bạn.
              </p>
            </div>

            {infoBanner && (
              <Alert variant="success" className="auth-alert">
                {infoBanner}
              </Alert>
            )}

            {serverError && (
              <Alert variant="danger" className="auth-alert" role="alert">
                {serverError}
              </Alert>
            )}

            <Form noValidate onSubmit={handleSubmit} className="auth-form">
              <Form.Group className="auth-form-group" controlId="loginEmail">
                <Form.Label className="auth-label">
                  Địa chỉ email <span className="required">*</span>
                </Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  autoComplete="email"
                  placeholder="Nhập địa chỉ email"
                  value={email}
                  disabled={submitting}
                  isInvalid={!!fieldErrors.email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: '' }));
                  }}
                  className="auth-input"
                />
                {fieldErrors.email && (
                  <div className="auth-field-error">{fieldErrors.email}</div>
                )}
              </Form.Group>

              <PasswordField
                controlId="loginPassword"
                label="Mật khẩu"
                name="password"
                autoComplete="current-password"
                placeholder="Nhập mật khẩu"
                value={password}
                disabled={submitting}
                error={fieldErrors.password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: '' }));
                }}
              />

              <Button
                type="submit"
                variant="danger"
                className="auth-submit-btn w-100"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Đang đăng nhập...
                  </>
                ) : (
                  'Đăng nhập'
                )}
              </Button>
            </Form>

            <div className="auth-footer-switch">
              <span>Chưa có tài khoản?</span>
              <Link to="/register" className="auth-switch-link">
                Đăng ký ngay
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
