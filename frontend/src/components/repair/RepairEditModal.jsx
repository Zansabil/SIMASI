import React, { useState, useEffect, useRef } from 'react';
import { FiX, FiAlertCircle, FiUpload, FiTrash2, FiCheckCircle } from 'react-icons/fi';
import { DEFAULT_ASSET_IMAGE } from '../../utils/imageHelper';

export default function RepairEditModal({ isOpen, onClose, onSubmit, selectedItem }) {
  const [editStatus, setEditStatus] = useState('');
  const [editPriority, setEditPriority] = useState('');
  const [editHasil, setEditHasil] = useState('');
  const [editBiaya, setEditBiaya] = useState('');
  const [editAlasanTolak, setEditAlasanTolak] = useState('');
  const [editKeterangan, setEditKeterangan] = useState('');
  const [editFotoFile, setEditFotoFile] = useState(null);
  const [fotoPreview, setFotoPreview] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isOpen && selectedItem) {
      setEditStatus(selectedItem.status || '');
      setEditPriority(selectedItem.priority || '');
      setEditHasil(selectedItem.hasil || '');
      setEditBiaya(selectedItem.biaya || '');
      setEditAlasanTolak('');
      setEditKeterangan(selectedItem.keterangan || '');
      setEditFotoFile(null);
      setFotoPreview(selectedItem.foto_perbaikan || null);
    }
  }, [isOpen, selectedItem]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        alert('Format file tidak didukung. Harap gunakan format PNG, JPG, JPEG, atau WEBP.');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert('Ukuran file maksimal adalah 5MB.');
        return;
      }
      setEditFotoFile(file);
      const previewUrl = URL.createObjectURL(file);
      setFotoPreview(previewUrl);
    }
  };

  const handleRemoveFoto = () => {
    setEditFotoFile(null);
    setFotoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      status: editStatus,
      priority: editPriority,
      keterangan: editKeterangan,
      hasil: editStatus === 'completed' ? editHasil : '',
      biaya: editStatus === 'completed' ? editBiaya : 0,
      alasanTolak: editStatus === 'rejected' ? editAlasanTolak : '',
      foto_perbaikan: editStatus === 'completed' ? editFotoFile : null
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

        <div className="detail-photos-label">Foto Kerusakan & Aset</div>
        <div className="detail-photos-grid" style={{ marginBottom: '10px' }}>
          <div className="detail-photo-card" style={{ display: 'flex', flexDirection: 'column' }}>
            <img 
              src={
                selectedItem.damage_image ||
                selectedItem.image_path ||
                DEFAULT_ASSET_IMAGE
              } 
              alt="foto-kerusakan" 
              className="detail-photo-img" 
              style={{ flex: 1, minHeight: 0, width: '100%', objectFit: 'cover' }}
            />
            <div style={{ textAlign: 'center', fontSize: '11.5px', color: '#64748b', padding: '6px 4px', fontWeight: 600, background: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
              Foto Kerusakan
            </div>
          </div>
          {selectedItem.asset_image && selectedItem.asset_image !== (selectedItem.damage_image || selectedItem.image_path) && (
            <div className="detail-photo-card" style={{ display: 'flex', flexDirection: 'column' }}>
              <img 
                src={selectedItem.asset_image} 
                alt="foto-aset" 
                className="detail-photo-img" 
                style={{ flex: 1, minHeight: 0, width: '100%', objectFit: 'cover' }}
              />
              <div style={{ textAlign: 'center', fontSize: '11.5px', color: '#64748b', padding: '6px 4px', fontWeight: 600, background: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
                Foto Aset (Katalog)
              </div>
            </div>
          )}
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
              style={{ width: '100%', minHeight: '60px', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px', fontFamily: 'Inter', boxSizing: 'border-box' }}
              placeholder="Catatan dari petugas di lapangan mengenai perbaikan ini..."
              value={editKeterangan}
              onChange={(e) => setEditKeterangan(e.target.value)}
            />
          </div>

          {editStatus === 'completed' && (
            <div style={{ marginTop: '16px', background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div className="detail-field-label" style={{ marginBottom: '8px', color: '#0f172a', fontWeight: 600 }}>
                Hasil Perbaikan <span style={{ color: '#ef4444' }}>*</span>
              </div>
              <textarea 
                required
                style={{ width: '100%', minHeight: '64px', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px', fontFamily: 'Inter', boxSizing: 'border-box' }}
                placeholder="Jelaskan tindakan perbaikan yang telah dilakukan..."
                value={editHasil}
                onChange={(e) => setEditHasil(e.target.value)}
              />

              {/* Upload Foto Hasil Perbaikan */}
              <div className="detail-field-label" style={{ marginBottom: '6px', marginTop: '16px', color: '#0f172a', fontWeight: 600 }}>
                Foto Aset Setelah Diperbaiki (Akan Dikirim ke Email Pelapor)
              </div>
              <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 10px 0' }}>
                Unggah foto bukti hasil perbaikan aset. Foto ini akan otomatis terkirim langsung ke email pengguna yang melaporkan kerusakan.
              </p>

              {fotoPreview ? (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  background: '#ffffff',
                  border: '1.5px solid #10b981',
                  borderRadius: '8px',
                  padding: '10px 12px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                }}>
                  <img 
                    src={fotoPreview} 
                    alt="Preview Hasil Perbaikan" 
                    style={{ width: '70px', height: '70px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #e2e8f0' }} 
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {editFotoFile ? editFotoFile.name : 'Foto Hasil Perbaikan (Tersimpan)'}
                    </div>
                    <div style={{ fontSize: '12px', color: '#059669', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '3px' }}>
                      <FiCheckCircle size={14} /> Foto siap dikirim ke email pelapor & ditampilkan di sistem
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveFoto}
                    style={{
                      background: '#fee2e2',
                      border: 'none',
                      color: '#dc2626',
                      padding: '7px 10px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                    title="Hapus foto"
                  >
                    <FiTrash2 size={14} /> Hapus
                  </button>
                </div>
              ) : (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    border: '2px dashed #93c5fd',
                    borderRadius: '8px',
                    padding: '18px 16px',
                    textAlign: 'center',
                    background: '#eff6ff',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#3b82f6'; e.currentTarget.style.background = '#dbeafe'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#93c5fd'; e.currentTarget.style.background = '#eff6ff'; }}
                >
                  <input 
                    ref={fileInputRef}
                    type="file" 
                    accept="image/png, image/jpeg, image/jpg, image/webp"
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                  />
                  <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb', boxShadow: '0 1px 2px rgba(0,0,0,0.06)' }}>
                    <FiUpload size={18} />
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#1d4ed8' }}>
                    Klik untuk upload foto aset hasil perbaikan
                  </span>
                  <span style={{ fontSize: '11.5px', color: '#64748b' }}>
                    Format: PNG, JPG, JPEG, WEBP (Maksimal 5MB)
                  </span>
                </div>
              )}

              <div className="detail-field-label" style={{ marginBottom: '8px', marginTop: '16px', color: '#0f172a', fontWeight: 600 }}>Total Biaya (Opsional)</div>
              <input 
                type="number"
                style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px', fontFamily: 'Inter', boxSizing: 'border-box' }}
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
                style={{ width: '100%', minHeight: '60px', padding: '8px', border: '1px solid #fca5a5', borderRadius: '6px', fontSize: '14px', fontFamily: 'Inter', boxSizing: 'border-box' }}
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
