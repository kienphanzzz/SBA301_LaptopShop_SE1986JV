import React, { useEffect, useRef } from 'react';

// Toast icons theo variant
const ICONS = {
  success: '✓',
  danger: '✕',
  warning: '⚠',
  info: 'ℹ',
};

const BG = {
  success: '#16a34a',
  danger: '#d72336',
  warning: '#d97706',
  info: '#2563eb',
};

// Component 1 toast item
function ToastItem({ id, text, variant = 'success', onRemove }) {
  const timer = useRef(null);

  useEffect(() => {
    timer.current = setTimeout(() => onRemove(id), 3500);
    return () => clearTimeout(timer.current);
  }, [id, onRemove]);

  const bg = BG[variant] || BG.info;

  return (
    <div
      className="toast-item"
      style={{ '--toast-color': bg }}
      role="alert"
      aria-live="polite"
    >
      <span className="toast-icon">{ICONS[variant] || ICONS.info}</span>
      <span className="toast-text">{text}</span>
      <button className="toast-close" onClick={() => onRemove(id)} aria-label="Đóng thông báo">×</button>
    </div>
  );
}

// Container chứa tất cả toasts — đặt ở góc phải dưới
export function ToastContainer({ toasts, onRemove }) {
  if (!toasts || toasts.length === 0) return null;
  return (
    <div className="toast-container" aria-label="Thông báo">
      {toasts.map((t) => (
        <ToastItem key={t.id} {...t} onRemove={onRemove} />
      ))}
    </div>
  );
}
