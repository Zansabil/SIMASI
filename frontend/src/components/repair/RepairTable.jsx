import React from 'react';
import { FiEye, FiEdit2 } from 'react-icons/fi';
import RepairStatusBadge from './RepairStatusBadge';
import PriorityBadge from './PriorityBadge';

export default function RepairTable({ repairs, isLoading, hasStaffAccess, onOpenView, onOpenEdit }) {
  return (
    <div className="repair-table-wrapper">
      <table className="repair-table-el">
        <thead>
          <tr>
            <th className="col-no">No.</th>
            <th className="col-reporter">Nama Pelapor</th>
            <th className="col-unit">Unit Usaha</th>
            <th className="col-date">Tanggal Pengaduan</th>
            <th className="col-asset">Nama Aset</th>
            <th className="col-location">Lokasi Aset</th>
            <th className="col-desc">Deskripsi Perbaikan</th>
            <th className="col-status">Status</th>
            {hasStaffAccess && <th className="col-priority">Prioritas</th>}
            <th className="col-photo">Foto</th>
            {hasStaffAccess && <th className="col-action">Aksi</th>}
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan={hasStaffAccess ? 11 : 9} className="text-center py-8">
                Memuat data perbaikan...
              </td>
            </tr>
          ) : repairs.length === 0 ? (
            <tr>
              <td colSpan={hasStaffAccess ? 11 : 9} className="text-center py-8">
                Tidak ada laporan perbaikan yang ditemukan.
              </td>
            </tr>
          ) : (
            repairs.map((item, index) => (
              <tr key={item.id || index}>
                <td className="col-no text-center">{index + 1}.</td>
                <td className="col-reporter font-semibold">{item.reporter_name}</td>
                <td className="col-unit text-center">{item.unit}</td>
                <td className="col-date text-center">{item.date}</td>
                <td className="col-asset font-semibold">{item.asset_name}</td>
                <td className="col-location">{item.location}</td>
                <td className="col-desc">{item.description}</td>
                <td className="col-status"><RepairStatusBadge status={item.status} /></td>
                {hasStaffAccess && (
                  <td className="col-priority">
                    <PriorityBadge priority={item.priority} />
                  </td>
                )}
                <td className="col-photo">
                  <div className="repair-thumbnail-container">
                    <img
                      src={
                        item.image_path ||
                        'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=100&fit=crop'
                      }
                      alt={item.asset_name}
                      className="repair-thumbnail-img"
                    />
                  </div>
                </td>
                {hasStaffAccess && (
                  <td className="col-action">
                    <div className="action-buttons-cell">
                      <button
                        className="action-icon-btn view-btn"
                        title="Detail"
                        onClick={() => onOpenView(item)}
                        aria-label="Detail Perbaikan"
                      >
                        <FiEye size={18} />
                      </button>
                      <button
                        className="action-icon-btn edit-btn"
                        title="Edit"
                        onClick={() => onOpenEdit(item)}
                        aria-label="Edit Perbaikan"
                      >
                        <FiEdit2 size={18} />
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
