// ═══════════════════════════════════════════
// ConfirmModal Component
// ═══════════════════════════════════════════

import { useEffect } from 'react';

export default function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', cancelText = 'Cancel', loading = false }) {
  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose} id="confirm-modal-overlay">
      <div
        className="modal-content"
        style={{ maxWidth: '400px' }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
      >
        <div className="modal-header" style={{ marginBottom: 'var(--space-3)' }}>
          <h2 className="modal-title" id="confirm-modal-title">
            {title}
          </h2>
          <button
            className="btn btn-ghost btn-icon"
            onClick={onClose}
            aria-label="Close dialog"
          >
            ✕
          </button>
        </div>

        <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-6)', lineHeight: 1.5 }}>
          {message}
        </div>

        <div className="confirm-modal-buttons">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            disabled={loading}
          >
            {cancelText}
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={onConfirm}
            disabled={loading}
            style={{ minWidth: '80px' }}
          >
            {loading && <span className="spinner" style={{ marginRight: '6px' }} />}
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
