import React from 'react';
import { FiX } from 'react-icons/fi';
import ProcurementStatusBadge from './ProcurementStatusBadge';

const formatRupiah = (number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(number);
};

export default function ProcurementDetailModal({ isOpen, onClose, selectedItem }) {
  if (!isOpen || !selectedItem) return null;

  return (
    <div className="modal-overlay-bg">
      <div className="detail-modal-container" style={{ maxWidth: '640px' }}>
        <button className="detail-modal-close-x" onClick={onClose} aria-label="Tutup">
          <FiX size={20} />
        </button>

        <h3 className="detail-modal-title">Detail Pengajuan Pengadaan</h3>
        <p className="detail-modal-subtitle">Informasi lengkap rincian barang yang telah diajukan.</p>

        <div className="detail-grid" style={{ marginBottom: '24px' }}>
          <div>
            <div className="detail-field-label">Nomor Surat</div>
            <div className="detail-field-value">{selectedItem.letter_number}</div>
          </div>
          <div>
            <div className="detail-field-label">Tanggal Pengajuan</div>
            <div className="detail-field-value">{selectedItem.date}</div>
          </div>
          <div>
            <div className="detail-field-label">Nama Pengaju</div>
            <div className="detail-field-value">{selectedItem.reporter_name}</div>
          </div>
          <div>
            <div className="detail-field-label">Jabatan Pengaju</div>
            <div className="detail-field-value">{selectedItem.reporter_role}</div>
          </div>
          <div className="detail-full-width">
            <div className="detail-field-label">Lembaga</div>
            <div className="detail-field-value">Yayasan Amir Ash-Shiddiiqi</div>
          </div>
        </div>

        <div className="detail-desc-header" style={{ marginBottom: '12px', fontWeight: 'bold' }}>
          Daftar Barang Yang Diajukan
        </div>
        
        <div style={{ overflowX: 'auto', marginBottom: '24px', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13.5px', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '10px', width: '40px', textAlign: 'center' }}>No</th>
                <th style={{ padding: '10px' }}>Nama Barang</th>
                <th style={{ padding: '10px' }}>Lokasi</th>
                <th style={{ padding: '10px', width: '70px', textAlign: 'center' }}>Qty</th>
                <th style={{ padding: '10px', textAlign: 'right' }}>Harga</th>
                <th style={{ padding: '10px', textAlign: 'right' }}>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {selectedItem.items.map((it, index) => (
                <tr key={index} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '10px', textAlign: 'center' }}>{index + 1}</td>
                  <td style={{ padding: '10px', fontWeight: '600' }}>{it.name}</td>
                  <td style={{ padding: '10px' }}>{it.location}</td>
                  <td style={{ padding: '10px', textAlign: 'center' }}>{it.qty}</td>
                  <td style={{ padding: '10px', textAlign: 'right' }}>{formatRupiah(it.price)}</td>
                  <td style={{ padding: '10px', textAlign: 'right', fontWeight: 'bold' }}>
                    {formatRupiah(it.qty * it.price)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <span style={{ fontSize: '13.5px', color: '#64748b', fontWeight: '600' }}>Status Approval:</span>
          <ProcurementStatusBadge status={selectedItem.status} />
        </div>

        <div className="edit-modal-action-row">
          <button className="edit-btn-save" onClick={onClose}>
            Tutup Detail
          </button>
        </div>
      </div>
    </div>
  );
}
