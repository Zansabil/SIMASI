import React, { useState, useEffect } from 'react';
import './StatusModal.css';

// SVGs for Icons
const SuccessIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="16 9 11 14 8 11" />
  </svg>
);

const ErrorIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="15" y1="9" x2="9" y2="15" />
    <line x1="9" y1="9" x2="15" y2="15" />
  </svg>
);

const WarningIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const ConfirmIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

export default function StatusModal({
  isOpen,
  type = 'success', // 'success' | 'error' | 'warning' | 'confirm'
  title,
  message,
  confirmText,
  cancelText = 'Batal',
  requireReason = false,
  reasonLabel = 'Alasan Penghapusan',
  reasonPlaceholder = 'Masukkan alasan penghapusan...',
  onConfirm,
  onCancel
}) {
  const [reason, setReason] = useState('');
  const [reasonError, setReasonError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setReason('');
      setReasonError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Resolve defaults based on type
  const resolvedConfirmText = confirmText || (type === 'error' ? 'Coba Lagi' : 'OK');

  const handleConfirmClick = () => {
    if (requireReason) {
      const trimmed = reason.trim();
      if (!trimmed) {
        setReasonError('Alasan penghapusan wajib diisi sebelum menghapus.');
        return;
      }
      if (onConfirm) onConfirm(trimmed);
      return;
    }
    if (onConfirm) onConfirm();
  };
  
  const getIcon = () => {
    switch (type) {
      case 'error':
        return <ErrorIcon />;
      case 'warning':
        return <WarningIcon />;
      case 'confirm':
        return <ConfirmIcon />;
      case 'success':
      default:
        return <SuccessIcon />;
    }
  };

  return (
    <div className="status-modal-overlay">
      <div className={`status-modal-card ${requireReason ? 'with-reason' : ''}`}>
        <div className={`status-icon-wrapper ${type}`}>
          {getIcon()}
        </div>

        <h3 className="status-modal-title">{title}</h3>
        <p className="status-modal-message">{message}</p>

        {requireReason && (
          <div className="status-modal-reason-box">
            <label className="status-modal-reason-label">
              {reasonLabel} <span className="status-modal-req">*</span>
            </label>
            <textarea
              className={`status-modal-reason-textarea ${reasonError ? 'has-error' : ''}`}
              rows={3}
              placeholder={reasonPlaceholder}
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (reasonError) setReasonError('');
              }}
            />
            {reasonError && (
              <span className="status-modal-reason-error">{reasonError}</span>
            )}
          </div>
        )}

        {onCancel ? (
          <div className="status-modal-btn-group">
            <button className="status-modal-btn cancel" onClick={onCancel}>
              {cancelText}
            </button>
            <button className={`status-modal-btn ${type}`} onClick={handleConfirmClick}>
              {resolvedConfirmText}
            </button>
          </div>
        ) : (
          <button 
            className={`status-modal-btn ${type}`} 
            onClick={handleConfirmClick}
          >
            {resolvedConfirmText}
          </button>
        )}
      </div>
    </div>
  );
}
