import React, { useEffect, useState } from 'react';
import { Alert, Button, Col, Container, Form, Row, Spinner } from 'react-bootstrap';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { authApi } from '../api/authApi';
import { isValidEmail, isValidPhone } from '../data/helpers';

function EyeIcon({ visible }) {
  if (visible) {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
        <line x1="1" y1="1" x2="23" y2="23" />
      </svg>
    );
  }
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function getInitials(name) {
  if (!name) return 'LH';
  const parts = String(name).trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function formatJoinDate(dateStr) {
  if (!dateStr) return '—';
  try {
    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) return '—';
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return '—';
  }
}

export function Login({ user, onLoginSuccess }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState(location.state?.registeredEmail || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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

              <Form.Group className="auth-form-group" controlId="loginPassword">
                <Form.Label className="auth-label">
                  Mật khẩu <span className="required">*</span>
                </Form.Label>
                <div className="auth-password-wrap">
                  <Form.Control
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    autoComplete="current-password"
                    placeholder="Nhập mật khẩu"
                    value={password}
                    disabled={submitting}
                    isInvalid={!!fieldErrors.password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: '' }));
                    }}
                    className="auth-input auth-input-password"
                  />
                  <button
                    type="button"
                    className="auth-password-toggle"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                    tabIndex={-1}
                  >
                    <EyeIcon visible={showPassword} />
                    <span>{showPassword ? 'Ẩn' : 'Hiện'}</span>
                  </button>
                </div>
                {fieldErrors.password && (
                  <div className="auth-field-error">{fieldErrors.password}</div>
                )}
              </Form.Group>

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

export function Register({ user, onRegisterSuccess }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
                  <Form.Group className="auth-form-group" controlId="registerPassword">
                    <Form.Label className="auth-label">
                      Mật khẩu <span className="required">*</span>
                    </Form.Label>
                    <div className="auth-password-wrap">
                      <Form.Control
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        autoComplete="new-password"
                        placeholder="Tối thiểu 6 ký tự"
                        value={form.password}
                        disabled={submitting}
                        isInvalid={!!fieldErrors.password}
                        onChange={handleChange}
                        className="auth-input auth-input-password"
                      />
                      <button
                        type="button"
                        className="auth-password-toggle"
                        onClick={() => setShowPassword((prev) => !prev)}
                        aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                        tabIndex={-1}
                      >
                        <EyeIcon visible={showPassword} />
                        <span>{showPassword ? 'Ẩn' : 'Hiện'}</span>
                      </button>
                    </div>
                    {fieldErrors.password && (
                      <div className="auth-field-error">{fieldErrors.password}</div>
                    )}
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group className="auth-form-group" controlId="registerConfirmPassword">
                    <Form.Label className="auth-label">
                      Xác nhận mật khẩu <span className="required">*</span>
                    </Form.Label>
                    <div className="auth-password-wrap">
                      <Form.Control
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        autoComplete="new-password"
                        placeholder="Nhập lại mật khẩu"
                        value={form.confirmPassword}
                        disabled={submitting}
                        isInvalid={!!fieldErrors.confirmPassword}
                        onChange={handleChange}
                        className="auth-input auth-input-password"
                      />
                      <button
                        type="button"
                        className="auth-password-toggle"
                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                        aria-label={showConfirmPassword ? 'Ẩn mật khẩu xác nhận' : 'Hiện mật khẩu xác nhận'}
                        tabIndex={-1}
                      >
                        <EyeIcon visible={showConfirmPassword} />
                        <span>{showConfirmPassword ? 'Ẩn' : 'Hiện'}</span>
                      </button>
                    </div>
                    {fieldErrors.confirmPassword && (
                      <div className="auth-field-error">{fieldErrors.confirmPassword}</div>
                    )}
                  </Form.Group>
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

export function Profile({ user, onProfileUpdated, onSessionExpired }) {
  const [profileData, setProfileData] = useState(user);
  const [form, setForm] = useState({
    fullName: user?.fullName || '',
    phone: user?.phone || '',
    address: user?.address || '',
  });
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');

  useEffect(() => {
    let active = true;
    async function fetchLatestProfile() {
      setLoadingProfile(true);
      try {
        const fresh = await authApi.getProfile();
        if (!active) return;
        setProfileData(fresh);
        setForm({
          fullName: fresh.fullName || '',
          phone: fresh.phone || '',
          address: fresh.address || '',
        });
        if (onProfileUpdated) {
          onProfileUpdated(fresh, false);
        }
      } catch (err) {
        if (!active) return;
        if (err.response?.status === 401 || err.response?.status === 403) {
          if (onSessionExpired) onSessionExpired();
          return;
        }
        setServerError('Không thể tải dữ liệu hồ sơ từ máy chủ.');
      } finally {
        if (active) setLoadingProfile(false);
      }
    }

    fetchLatestProfile();
    return () => {
      active = false;
    };
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (saveSuccess) {
      setSaveSuccess('');
    }
  }

  function handleReset() {
    setForm({
      fullName: profileData?.fullName || '',
      phone: profileData?.phone || '',
      address: profileData?.address || '',
    });
    setFieldErrors({});
    setServerError('');
    setSaveSuccess('');
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (saving) return;

    setServerError('');
    setSaveSuccess('');
    const nextErrors = {};

    if (!form.fullName.trim()) {
      nextErrors.fullName = 'Họ và tên không được để trống.';
    } else if (form.fullName.trim().length > 150) {
      nextErrors.fullName = 'Họ và tên không vượt quá 150 ký tự.';
    }

    if (!form.phone.trim()) {
      nextErrors.phone = 'Số điện thoại không được để trống.';
    } else if (!isValidPhone(form.phone.trim())) {
      nextErrors.phone = 'Số điện thoại phải bắt đầu bằng số 0 và gồm 9 đến 11 chữ số.';
    }

    if (form.address && form.address.trim().length > 500) {
      nextErrors.address = 'Địa chỉ nhận hàng không vượt quá 500 ký tự.';
    }

    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSaving(true);
    try {
      const updated = await authApi.updateProfile({
        fullName: form.fullName.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
      });
      setProfileData(updated);
      setForm({
        fullName: updated.fullName || '',
        phone: updated.phone || '',
        address: updated.address || '',
      });
      setSaveSuccess('Đã lưu thay đổi thông tin cá nhân.');
      if (onProfileUpdated) {
        onProfileUpdated(updated, true);
      }
    } catch (err) {
      if (err.response?.status === 401) {
        if (onSessionExpired) onSessionExpired();
        return;
      }
      const data = err.response?.data;
      if (data?.fieldErrors) {
        setFieldErrors(data.fieldErrors);
      }
      setServerError(
        data?.message || 'Không thể cập nhật hồ sơ lúc này. Vui lòng thử lại.'
      );
    } finally {
      setSaving(false);
    }
  }

  const hasChanges =
    form.fullName.trim() !== (profileData?.fullName || '') ||
    form.phone.trim() !== (profileData?.phone || '') ||
    form.address.trim() !== (profileData?.address || '');

  return (
    <div className="profile-page-shell py-4">
      <Container>
        <div className="profile-page-head mb-4">
          <div>
            <span className="auth-eyebrow">TÀI KHOẢN CỦA TÔI</span>
            <h1 className="profile-main-title">Hồ sơ cá nhân</h1>
            <p className="profile-main-subtitle mb-0">
              Quản lý thông tin liên hệ và địa chỉ giao hàng của bạn.
            </p>
          </div>
          {loadingProfile && (
            <div className="profile-sync-text">
              <Spinner animation="border" size="sm" />
              <span>Đang tải...</span>
            </div>
          )}
        </div>

        <Row className="g-4 align-items-start">
          <Col lg={4}>
            <div className="profile-summary-card">
              <div className="profile-avatar-block">
                <div className="profile-avatar-circle">
                  {getInitials(profileData?.fullName)}
                </div>
                <div className="profile-identity-text">
                  <h2 className="profile-identity-name">{profileData?.fullName}</h2>
                  <p className="profile-identity-email">{profileData?.email}</p>
                </div>
              </div>

              <div className="profile-meta-list">
                <div className="profile-meta-row">
                  <span className="profile-meta-label">Loại tài khoản</span>
                  <strong className="profile-meta-value">
                    {profileData?.role === 'ADMIN' ? 'Quản trị viên' : 'Khách hàng'}
                  </strong>
                </div>
                <div className="profile-meta-row">
                  <span className="profile-meta-label">Số điện thoại</span>
                  <strong className="profile-meta-value">
                    {profileData?.phone || 'Chưa cập nhật'}
                  </strong>
                </div>
                <div className="profile-meta-row">
                  <span className="profile-meta-label">Ngày tham gia</span>
                  <strong className="profile-meta-value">
                    {formatJoinDate(profileData?.createdAt)}
                  </strong>
                </div>
              </div>
            </div>
          </Col>

          <Col lg={8}>
            <div className="profile-form-card">
              <div className="profile-form-card-head">
                <h2 className="profile-section-title">Cập nhật thông tin</h2>
                <p className="profile-section-desc mb-0">
                  Thông tin này được tự động điền khi bạn đặt mua sản phẩm.
                </p>
              </div>

              {saveSuccess && (
                <Alert variant="success" className="auth-alert" role="status">
                  {saveSuccess}
                </Alert>
              )}

              {serverError && (
                <Alert variant="danger" className="auth-alert" role="alert">
                  {serverError}
                </Alert>
              )}

              <Form noValidate onSubmit={handleSubmit}>
                <Row className="g-3">
                  <Col md={6}>
                    <Form.Group className="auth-form-group mb-0" controlId="profileFullName">
                      <Form.Label className="auth-label">
                        Họ và tên <span className="required">*</span>
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="fullName"
                        value={form.fullName}
                        disabled={saving}
                        isInvalid={!!fieldErrors.fullName}
                        onChange={handleChange}
                        placeholder="Nhập họ và tên của bạn"
                        className="auth-input"
                      />
                      {fieldErrors.fullName && (
                        <div className="auth-field-error">{fieldErrors.fullName}</div>
                      )}
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="auth-form-group mb-0" controlId="profilePhone">
                      <Form.Label className="auth-label">
                        Số điện thoại <span className="required">*</span>
                      </Form.Label>
                      <Form.Control
                        type="tel"
                        name="phone"
                        value={form.phone}
                        disabled={saving}
                        isInvalid={!!fieldErrors.phone}
                        onChange={handleChange}
                        placeholder="0912345678"
                        className="auth-input"
                      />
                      {fieldErrors.phone && (
                        <div className="auth-field-error">{fieldErrors.phone}</div>
                      )}
                    </Form.Group>
                  </Col>

                  <Col xs={12}>
                    <Form.Group className="auth-form-group mb-0" controlId="profileEmailReadonly">
                      <div className="d-flex justify-content-between align-items-center flex-wrap gap-1">
                        <Form.Label className="auth-label mb-1">
                          Địa chỉ email
                        </Form.Label>
                        <span className="profile-readonly-tag">Không thể thay đổi</span>
                      </div>
                      <Form.Control
                        type="email"
                        value={profileData?.email || ''}
                        readOnly
                        disabled
                        className="auth-input profile-input-readonly"
                      />
                    </Form.Group>
                  </Col>

                  <Col xs={12}>
                    <Form.Group className="auth-form-group mb-0" controlId="profileAddress">
                      <Form.Label className="auth-label">
                        Địa chỉ nhận hàng
                      </Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        name="address"
                        value={form.address}
                        disabled={saving}
                        isInvalid={!!fieldErrors.address}
                        onChange={handleChange}
                        placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố..."
                        className="auth-input"
                      />
                      {fieldErrors.address && (
                        <div className="auth-field-error">{fieldErrors.address}</div>
                      )}
                    </Form.Group>
                  </Col>
                </Row>

                <div className="profile-form-actions">
                  <Button
                    type="submit"
                    variant="danger"
                    className="auth-submit-btn px-4"
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        Đang lưu...
                      </>
                    ) : (
                      'Lưu thay đổi'
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline-secondary"
                    className="profile-reset-btn"
                    disabled={saving || !hasChanges}
                    onClick={handleReset}
                  >
                    Đặt lại
                  </Button>
                </div>
              </Form>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
