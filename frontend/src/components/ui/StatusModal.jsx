import React from 'react';
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

export default function StatusModal({
  isOpen,
  type = 'success', // 'success' | 'error' | 'warning'
  title,
  message,
  confirmText,
  onConfirm
}) {
  if (!isOpen) return null;

  // Resolve defaults based on type
  const resolvedConfirmText = confirmText || (type === 'error' ? 'Coba Lagi' : 'OK');
  
  const getIcon = () => {
    switch (type) {
      case 'error':
        return <ErrorIcon />;
      case 'warning':
        return <WarningIcon />;
      case 'success':
      default:
        return <SuccessIcon />;
    }
  };

  return (
    <div className="status-modal-overlay">
      <div className="status-modal-card">
        <div className={`status-icon-wrapper ${type}`}>
          {getIcon()}
        </div>

        <h3 className="status-modal-title">{title}</h3>
        <p className="status-modal-message">{message}</p>

        <button 
          className={`status-modal-btn ${type}`} 
          onClick={onConfirm}
        >
          {resolvedConfirmText}
        </button>
      </div>
    </div>
  );
}
