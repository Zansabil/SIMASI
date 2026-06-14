import React from 'react';
import { FiX, FiAlertCircle } from 'react-icons/fi';

// Status mapping helper
const renderStatusBadge = (status) => {
  switch (status) {
    case 'pending':
    case 'approved':
      return <span className="repair-status-badge status-waiting">Menunggu</span>;
    case 'in_progress':
      return <span className="repair-status-badge status-process">Sedang di Kerjakan</span>;
    case 'completed':
      return <span className="repair-status-badge status-done">Selesai</span>;
    case 'rejected':
      return <span className="repair-status-badge status-rejected">Ditolak</span>;
    default:
      return <span className="repair-status-badge">{status}</span>;
  }
};

// Priority mapping helper
const renderPriorityBadge = (priority) => {
  switch (priority) {
    case 'high':
      return <span className="repair-priority-badge priority-high">Mendesak</span>;
    case 'medium':
      return <span className="repair-priority-badge priority-medium">Sedang</span>;
    case 'low':
      return <span className="repair-priority-badge priority-low">Tidak Mendesak</span>;
    default:
      return <span className="repair-priority-badge">{priority || 'Sedang'}</span>;
  }
};

export default function RepairDetailModal({ isOpen, onClose, selectedItem }) {
  if (!isOpen || !selectedItem) return null;

  return (
    <div className="modal-overlay-bg">
      <div className="detail-modal-container">
        <button 
          className="detail-modal-close-x" 
          onClick={onClose} 
          aria-label="Tutup"
        >
          <FiX size={20} />
        </button>

        <h3 className="detail-modal-title">Detail Laporan Kerusakan Aset</h3>
        <p className="detail-modal-subtitle">
          Informasi lengkap mengenai laporan kerusakan aset yang telah dilaporkan.
        </p>

        <div className="detail-badges-row">
          {renderStatusBadge(selectedItem.status)}
          {renderPriorityBadge(selectedItem.priority)}
        </div>

        <div className="detail-grid">
          <div>
            <div className="detail-field-label">Nama Pelapor</div>
            <div className="detail-field-value">{selectedItem.reporter_name}</div>
          </div>
          <div>
            <div className="detail-field-label">Unit Usaha</div>
            <div className="detail-field-value">{selectedItem.unit}</div>
          </div>

          <div>
            <div className="detail-field-label">Tanggal Pengaduan</div>
            <div className="detail-field-value">{selectedItem.date}</div>
          </div>
          <div>
            <div className="detail-field-label">Nama Aset</div>
            <div className="detail-field-value">{selectedItem.asset_name}</div>
          </div>

          <div className="detail-full-width">
            <div className="detail-field-label">Lokasi Aset</div>
            <div className="detail-field-value">{selectedItem.location}</div>
          </div>
        </div>

        <div className="detail-desc-header">
          <FiAlertCircle size={16} /> Deskripsi Kerusakan
        </div>
        <div className="detail-desc-box">
          {selectedItem.description}
        </div>

        <div className="detail-photos-label">Foto Kerusakan</div>
        <div className="detail-photos-grid">
          <div className="detail-photo-card">
            <img 
              src={
                selectedItem.image_path ||
                'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=200&fit=crop'
              } 
              alt="lampiran-1" 
              className="detail-photo-img" 
            />
          </div>
          <div className="detail-photo-card">
            <img 
              src={
                selectedItem.image_path ||
                'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=200&fit=crop'
              } 
              alt="lampiran-2" 
              className="detail-photo-img" 
            />
          </div>
        </div>
      </div>
    </div>
  );
}
