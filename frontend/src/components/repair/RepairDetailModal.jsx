import React from 'react';
import { FiX, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import { DEFAULT_ASSET_IMAGE } from '../../utils/imageHelper';

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

export default function RepairDetailModal({ isOpen, onClose, selectedItem, onPreviewPhoto }) {
  if (!isOpen || !selectedItem) return null;

  const handleImageClick = (url, title) => {
    if (onPreviewPhoto && url) {
      onPreviewPhoto(url, title);
    }
  };

  const damageImg = selectedItem.damage_image || selectedItem.image_path || DEFAULT_ASSET_IMAGE;
  const assetImg = selectedItem.asset_image && selectedItem.asset_image !== damageImg ? selectedItem.asset_image : null;
  const repairImg = selectedItem.foto_perbaikan;

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

        {selectedItem.keterangan && (
          <>
            <div className="detail-desc-header" style={{ marginTop: '16px', color: '#0f172a' }}>
              <FiAlertCircle size={16} /> Keterangan Lapangan (Petugas)
            </div>
            <div className="detail-desc-box" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
              {selectedItem.keterangan}
            </div>
          </>
        )}

        {selectedItem.hasil && (
          <>
            <div className="detail-desc-header" style={{ marginTop: '16px', color: '#059669', fontWeight: 600 }}>
              <FiCheckCircle size={16} /> Hasil Tindakan Perbaikan
            </div>
            <div className="detail-desc-box" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534' }}>
              <div>{selectedItem.hasil}</div>
              {selectedItem.biaya > 0 && (
                <div style={{ marginTop: '8px', fontSize: '13px', fontWeight: 600, color: '#047857' }}>
                  Total Biaya: Rp {Number(selectedItem.biaya).toLocaleString('id-ID')}
                </div>
              )}
            </div>
          </>
        )}

        <div className="detail-photos-label">Foto Kerusakan & Bukti Perbaikan</div>
        <div className="detail-photos-grid">
          {/* Foto Kerusakan */}
          <div 
            className="detail-photo-card"
            style={{ cursor: onPreviewPhoto ? 'pointer' : 'default', display: 'flex', flexDirection: 'column' }}
            onClick={() => handleImageClick(damageImg, `Foto Kerusakan - ${selectedItem.asset_name}`)}
            title={onPreviewPhoto ? "Klik untuk memperbesar" : ""}
          >
            <img 
              src={damageImg} 
              alt="foto-kerusakan" 
              className="detail-photo-img" 
              style={{ flex: 1, minHeight: 0, width: '100%', objectFit: 'cover' }}
            />
            <div style={{ textAlign: 'center', fontSize: '11.5px', color: '#64748b', padding: '6px 4px', fontWeight: 600, background: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
              Foto Kerusakan
            </div>
          </div>

          {/* Foto Aset Katalog */}
          {assetImg && (
            <div 
              className="detail-photo-card"
              style={{ cursor: onPreviewPhoto ? 'pointer' : 'default', display: 'flex', flexDirection: 'column' }}
              onClick={() => handleImageClick(assetImg, `Foto Aset - ${selectedItem.asset_name}`)}
              title={onPreviewPhoto ? "Klik untuk memperbesar" : ""}
            >
              <img 
                src={assetImg} 
                alt="foto-aset" 
                className="detail-photo-img" 
                style={{ flex: 1, minHeight: 0, width: '100%', objectFit: 'cover' }}
              />
              <div style={{ textAlign: 'center', fontSize: '11.5px', color: '#64748b', padding: '6px 4px', fontWeight: 600, background: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
                Foto Aset (Katalog)
              </div>
            </div>
          )}

          {/* Foto Hasil Perbaikan */}
          {repairImg && (
            <div 
              className="detail-photo-card"
              style={{ cursor: onPreviewPhoto ? 'pointer' : 'default', display: 'flex', flexDirection: 'column', border: '2px solid #10b981', boxShadow: '0 2px 8px rgba(16, 185, 129, 0.15)' }}
              onClick={() => handleImageClick(repairImg, `Foto Hasil Perbaikan - ${selectedItem.asset_name}`)}
              title={onPreviewPhoto ? "Klik untuk memperbesar" : ""}
            >
              <img 
                src={repairImg} 
                alt="foto-hasil-perbaikan" 
                className="detail-photo-img" 
                style={{ flex: 1, minHeight: 0, width: '100%', objectFit: 'cover' }}
              />
              <div style={{ textAlign: 'center', fontSize: '11.5px', color: '#047857', padding: '6px 4px', fontWeight: 700, background: '#ecfdf5', borderTop: '1px solid #a7f3d0' }}>
                ✓ Hasil Perbaikan
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
