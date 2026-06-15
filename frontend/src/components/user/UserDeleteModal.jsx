import React from 'react';

export default function UserDeleteModal({ isOpen, onClose, onConfirm, user }) {
  if (!isOpen || !user) return null;

  return (
    <div className="modal-overlay-bg" onClick={onClose}>
      <div className="modal-delete-confirm-card" onClick={(e) => e.stopPropagation()}>
        <h3 className="delete-confirm-title">Konfirmasi Hapus Akun</h3>
        <p className="delete-confirm-body">
          Apakah Anda yakin ingin menghapus akun{' '}
          <strong className="delete-confirm-name">{user.name}</strong>?
        </p>
        <div className="delete-confirm-actions">
          <button
            className="delete-btn-batal"
            onClick={onClose}
          >
            Batal
          </button>
          <button
            className="delete-btn-hapus"
            onClick={onConfirm}
          >
            Hapus
          </button>
        </div>
      </div>
    </div>
  );
}
