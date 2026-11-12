import React from 'react';
import { FiX, FiCalendar, FiBox, FiUser, FiInfo, FiTag } from 'react-icons/fi';

const formatDateTime = (dateStr) => {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    return d.toLocaleString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  } catch {
    return dateStr;
  }
};

const getBadgeClass = (aksi) => {
  const lower = (aksi || '').toLowerCase();
  if (lower.includes('tambah') || lower.includes('nambah')) return 'tambah';
  if (lower.includes('ubah')) return 'ubah';
  if (lower.includes('pindah') || lower.includes('mindah')) return 'pindah';
  if (lower.includes('hapus')) return 'hapus';
  return 'default';
};

export default function AssetHistoryDetailModal({ isOpen, onClose, item }) {
  if (!isOpen || !item) return null;

  const aset = item.aset;
  const user = item.pengguna;
  const badgeClass = getBadgeClass(item.aksi);
  const alasanMatch = typeof item.keterangan === 'string'
    ? item.keterangan.match(/Alasan penghapusan:\s*(.+)$/i)
    : null;
  const extractedAlasan = alasanMatch ? alasanMatch[1].trim() : null;

  const isBulkImport = typeof item.keterangan === 'string' && item.keterangan.startsWith('Impor Excel Massal');
  const bulkLines = isBulkImport
    ? item.keterangan
        .split('\n')
        .slice(1)
        .map(line => line.replace(/^\s*-\s*/, '').trim())
        .filter(Boolean)
    : [];

  return (
    <div className="history-modal-overlay" onClick={onClose}>
      <div className="history-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="history-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h3 className="history-modal-title">Detail Riwayat Aset</h3>
            <span className={`history-badge ${badgeClass}`}>
              {item.aksi}
            </span>
          </div>
          <button className="history-modal-close" onClick={onClose} aria-label="Tutup">
            <FiX size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="history-modal-body">
          {/* Waktu & Ringkasan */}
          <div className="history-detail-section">
            <div className="history-detail-section-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FiCalendar size={14} /> Waktu Kejadian
            </div>
            <div className="history-detail-val" style={{ fontSize: '14px', color: '#0f172a' }}>
              {formatDateTime(item.waktu)}
            </div>
          </div>

          {/* Info Aset */}
          <div className="history-detail-section">
            <div className="history-detail-section-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FiBox size={14} /> {isBulkImport ? `Daftar Aset Hasil Impor Excel (${bulkLines.length} Jenis Aset)` : 'Informasi Aset'}
            </div>
            {isBulkImport && bulkLines.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '200px', overflowY: 'auto' }}>
                {bulkLines.map((rowText, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '8px 10px',
                      backgroundColor: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '12.5px',
                      color: '#1e293b',
                      fontWeight: 500
                    }}
                  >
                    <strong style={{ color: '#059669', marginRight: '6px' }}>{idx + 1}.</strong>
                    {rowText}
                  </div>
                ))}
              </div>
            ) : (
              <div className="history-detail-grid">
                <div className="history-detail-item">
                  <span className="history-detail-label">Nama Aset</span>
                  <span className="history-detail-val">
                    {aset?.nama_aset || <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Aset telah dihapus</span>}
                  </span>
                </div>
                <div className="history-detail-item">
                  <span className="history-detail-label">Kode Inventaris</span>
                  <span className="history-detail-val" style={{ fontFamily: 'monospace' }}>
                    {aset?.kode_inventaris || '-'}
                  </span>
                </div>
                <div className="history-detail-item">
                  <span className="history-detail-label">Unit Kerja</span>
                  <span className="history-detail-val">
                    {aset?.lokasi_unit?.nama_unit || '-'}
                  </span>
                </div>
                <div className="history-detail-item">
                  <span className="history-detail-label">Ruangan</span>
                  <span className="history-detail-val">
                    {aset?.ruangan?.nama_ruangan || '-'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Info Pelaku / User */}
          <div className="history-detail-section">
            <div className="history-detail-section-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FiUser size={14} /> Pelaku Aktivitas (Pengguna)
            </div>
            <div className="history-detail-grid">
              <div className="history-detail-item">
                <span className="history-detail-label">Nama Pengguna</span>
                <span className="history-detail-val">
                  {user?.nama || 'Sistem / Pengguna Telah Dihapus'}
                </span>
              </div>
              <div className="history-detail-item">
                <span className="history-detail-label">Username</span>
                <span className="history-detail-val">
                  {user?.nama_pengguna ? `@${user.nama_pengguna}` : '-'}
                </span>
              </div>
              <div className="history-detail-item">
                <span className="history-detail-label">Jabatan</span>
                <span className="history-detail-val">
                  {user?.jabatan || user?.peran?.nama || '-'}
                </span>
              </div>
              <div className="history-detail-item">
                <span className="history-detail-label">Peran</span>
                <span className="history-detail-val">
                  {user?.peran?.nama || '-'}
                </span>
              </div>
              <div className="history-detail-item">
                <span className="history-detail-label">Area / Unit Kerja</span>
                <span className="history-detail-val">
                  {user?.area || 'Global / Yayasan'}
                </span>
              </div>
            </div>
          </div>

          {/* Alasan Penghapusan (Jika Aksi Penghapusan) */}
          {extractedAlasan && (
            <div className="history-detail-section">
              <div className="history-detail-section-title" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#dc2626' }}>
                <FiTag size={14} /> Alasan Penghapusan
              </div>
              <div
                className="history-desc-box"
                style={{
                  backgroundColor: '#fef2f2',
                  borderColor: '#fecaca',
                  color: '#991b1b',
                  fontWeight: 600
                }}
              >
                {extractedAlasan}
              </div>
            </div>
          )}

          {/* Keterangan Detail */}
          <div className="history-detail-section">
            <div className="history-detail-section-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FiInfo size={14} /> Keterangan Detail Aktivitas
            </div>
            <div className="history-desc-box">
              {item.keterangan || '-'}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="history-modal-footer">
          <button className="history-btn-close" onClick={onClose}>
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
