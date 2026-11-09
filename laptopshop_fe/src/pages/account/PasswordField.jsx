import React, { useState } from 'react';
import { Form } from 'react-bootstrap';
import { EyeIcon } from './EyeIcon';

export function PasswordField({
  controlId,
  label,
  name,
  value,
  placeholder,
  autoComplete = 'current-password',
  disabled = false,
  error = '',
  visibilityLabel = 'mật khẩu',
  onChange,
}) {
  const [visible, setVisible] = useState(false);

  return (
    <Form.Group className="auth-form-group" controlId={controlId}>
      {label && (
        <Form.Label className="auth-label">
          {label} <span className="required">*</span>
        </Form.Label>
      )}
      <div className="auth-password-wrap">
        <Form.Control
          type={visible ? 'text' : 'password'}
          name={name}
          autoComplete={autoComplete}
          placeholder={placeholder}
          value={value}
          disabled={disabled}
          isInvalid={!!error}
          onChange={onChange}
          className="auth-input auth-input-password"
        />
        <button
          type="button"
          className="auth-password-toggle"
          onClick={() => setVisible((prev) => !prev)}
          aria-label={visible ? `Ẩn ${visibilityLabel}` : `Hiện ${visibilityLabel}`}
        >
          <EyeIcon visible={visible} />
          <span>{visible ? 'Ẩn' : 'Hiện'}</span>
        </button>
      </div>
      {error && <div className="auth-field-error">{error}</div>}
    </Form.Group>
  );
}
