import React from 'react';
import { FiEye, FiPrinter } from 'react-icons/fi';
import ProcurementStatusBadge from './ProcurementStatusBadge';

const formatRupiah = (number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(number);
};

export default function ProcurementTable({ procurements, onViewDetail, onPreviewLetter }) {
  return (
    <div className="procurement-table-wrapper">
      <table className="procurement-table-el">
        <thead>
          <tr>
            <th style={{ width: '50px', textAlign: 'center' }}>No.</th>
            <th>No. Surat</th>
            <th>Tanggal</th>
            <th>Nama Pengaju</th>
            <th>Jabatan</th>
            <th style={{ textAlign: 'center' }}>Jumlah Item</th>
            <th style={{ textAlign: 'right' }}>Total Biaya</th>
            <th style={{ textAlign: 'center' }}>Status</th>
            <th style={{ width: '130px', textAlign: 'center' }}>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {procurements.length === 0 ? (
            <tr>
              <td colSpan="9" style={{ textAlign: 'center', padding: '32px' }}>
                Tidak ada data pengajuan pengadaan aset.
              </td>
            </tr>
          ) : (
            procurements.map((item, idx) => (
              <tr key={item.id}>
                <td style={{ textAlign: 'center' }}>{idx + 1}.</td>
                <td style={{ fontWeight: 600 }}>{item.letter_number}</td>
                <td>{item.date}</td>
                <td>{item.reporter_name}</td>
                <td>{item.reporter_role}</td>
                <td style={{ textAlign: 'center' }}>
                  {item.items.reduce((acc, i) => acc + i.qty, 0)}
                </td>
                <td style={{ textAlign: 'right', fontWeight: 'bold', color: '#1e293b' }}>
                  {formatRupiah(item.total_cost)}
                </td>
                <td style={{ textAlign: 'center' }}>
                  <ProcurementStatusBadge status={item.status} />
                </td>
                <td style={{ textAlign: 'center' }}>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                    <button 
                      className="action-icon-btn view-btn" 
                      title="Detail Pengajuan"
                      onClick={() => onViewDetail(item)}
                    >
                      <FiEye size={16} />
                    </button>
                    <button 
                      className="action-icon-btn edit-btn" 
                      title="Pratinjau / Cetak Surat"
                      onClick={() => onPreviewLetter(item)}
                    >
                      <FiPrinter size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
