import React from 'react';

export const Loader = () => (
  <div className="loader-center"><div className="spinner" /></div>
);

export const Alert = ({ type = 'info', children, onClose }) => (
  <div className={`alert alert-${type}`}>
    <span style={{ flex: 1 }}>{children}</span>
    {onClose && (
      <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontSize: 16 }}>✕</button>
    )}
  </div>
);

export const Badge = ({ children, type = 'blue' }) => (
  <span className={`badge badge-${type}`}>{children}</span>
);

export const EmptyState = ({ icon = '◈', title, subtitle, action }) => (
  <div className="empty-state">
    <div className="empty-state-icon">{icon}</div>
    <div className="empty-state-text">{title}</div>
    {subtitle && <div className="empty-state-sub">{subtitle}</div>}
    {action && <div style={{ marginTop: 20 }}>{action}</div>}
  </div>
);

export const Modal = ({ isOpen, onClose, title, children, maxWidth = 680 }) => {
  if (!isOpen) return null;
  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth }}>
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
          <button onClick={onClose} className="btn btn-ghost btn-sm">✕</button>
        </div>
        {children}
      </div>
    </div>
  );
};

export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(amount);
}

export function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}
