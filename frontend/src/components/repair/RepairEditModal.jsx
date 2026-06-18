import React, { useState, useEffect } from 'react';
import { FiX, FiAlertCircle } from 'react-icons/fi';

export default function RepairEditModal({ isOpen, onClose, onSubmit, selectedItem }) {
  const [editStatus, setEditStatus] = useState('');
  const [editPriority, setEditPriority] = useState('');
  const [editHasil, setEditHasil] = useState('');
  const [editBiaya, setEditBiaya] = useState('');
  const [editAlasanTolak, setEditAlasanTolak] = useState('');
  const [editKeterangan, setEditKeterangan] = useState('');

  useEffect(() => {
    if (isOpen && selectedItem) {
      setEditStatus(selectedItem.status || '');
      setEditPriority(selectedItem.priority || '');
      setEditHasil('');
      setEditBiaya('');
      setEditAlasanTolak('');
      setEditKeterangan(selectedItem.keterangan || '');
    }
  }, [isOpen, selectedItem]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      status: editStatus,
      priority: editPriority,
      keterangan: editKeterangan,
      hasil: editStatus === 'completed' ? editHasil : '',
      biaya: editStatus === 'completed' ? editBiaya : 0,
      alasanTolak: editStatus === 'rejected' ? editAlasanTolak : ''
    });
  };

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
        <div className="detail-photos-grid" style={{ marginBottom: '10px' }}>
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

        <form onSubmit={handleSubmit}>
          <h4 className="tindak-lanjut-section-title">Tindak Lanjut</h4>
          <div className="tindak-lanjut-grid">
            <div>
              <div className="detail-field-label" style={{ marginBottom: '8px' }}>Prioritas Perbaikan</div>
              <select 
                className="modal-form-select"
                required
                value={editPriority}
                onChange={(e) => setEditPriority(e.target.value)}
              >
                <option value="" disabled hidden>Pilih Prioritas</option>
                <option value="high">Mendesak</option>
                <option value="medium">Sedang</option>
                <option value="low">Tidak Mendesak</option>
              </select>
            </div>

            <div>
              <div className="detail-field-label" style={{ marginBottom: '8px' }}>Status Perbaikan</div>
              <select 
                className="modal-form-select"
                required
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value)}
              >
                <option value="" disabled hidden>Pilih Status</option>
                <option value="pending">Menunggu</option>
                <option value="in_progress">Sedang Dikerjakan</option>
                <option value="completed">Selesai</option>
                <option value="rejected">Ditolak</option>
              </select>
            </div>
          </div>

          <div style={{ marginTop: '16px', background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <div className="detail-field-label" style={{ marginBottom: '8px', color: '#0f172a' }}>Keterangan Lapangan (Opsional)</div>
            <textarea 
              style={{ width: '100%', minHeight: '60px', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px', fontFamily: 'Inter' }}
              placeholder="Catatan dari petugas di lapangan mengenai perbaikan ini..."
              value={editKeterangan}
              onChange={(e) => setEditKeterangan(e.target.value)}
            />
          </div>

          {editStatus === 'completed' && (
            <div style={{ marginTop: '16px', background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div className="detail-field-label" style={{ marginBottom: '8px', color: '#0f172a' }}>Hasil Perbaikan (Wajib)</div>
              <textarea 
                required
                style={{ width: '100%', minHeight: '60px', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px', fontFamily: 'Inter' }}
                placeholder="Jelaskan tindakan perbaikan yang telah dilakukan..."
                value={editHasil}
                onChange={(e) => setEditHasil(e.target.value)}
              />

              <div className="detail-field-label" style={{ marginBottom: '8px', marginTop: '12px', color: '#0f172a' }}>Total Biaya (Opsional)</div>
              <input 
                type="number"
                style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px', fontFamily: 'Inter' }}
                placeholder="Contoh: 150000"
                value={editBiaya}
                onChange={(e) => setEditBiaya(e.target.value)}
              />
            </div>
          )}

          {editStatus === 'rejected' && (
            <div style={{ marginTop: '16px', background: '#fef2f2', padding: '12px', borderRadius: '8px', border: '1px solid #fecaca' }}>
              <div className="detail-field-label" style={{ marginBottom: '8px', color: '#991b1b' }}>Deskripsi Penolakan (Wajib)</div>
              <textarea 
                required
                style={{ width: '100%', minHeight: '60px', padding: '8px', border: '1px solid #fca5a5', borderRadius: '6px', fontSize: '14px', fontFamily: 'Inter' }}
                placeholder="Berikan alasan mengapa perbaikan ini ditolak..."
                value={editAlasanTolak}
                onChange={(e) => setEditAlasanTolak(e.target.value)}
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="edit-modal-action-row">
            <button type="button" className="edit-btn-cancel" onClick={onClose}>
              Batal
            </button>
            <button type="submit" className="edit-btn-save">
              Simpan Perubahan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
