import React from 'react';
import { formatNumber } from '../../utils/statusConfig';

/**
 * Komponen kartu statistik tunggal untuk dashboard.
 *
 * @param {object}   props
 * @param {string}   props.label       - Judul kartu (e.g. "Total Aset")
 * @param {number}   props.value       - Nilai angka yang ditampilkan
 * @param {React.ElementType} props.icon       - Komponen ikon dari react-icons
 * @param {string}   props.colorClass  - Class CSS warna ikon (e.g. "stat-total")
 */
export default function StatCard({ label, value, icon: Icon, colorClass }) {
  return (
    <div className="stat-card">
      <div className="stat-card-left">
        <span className="stat-card-label">{label}</span>
        <span className="stat-card-value">{formatNumber(value)}</span>
      </div>
      <div className={`stat-card-icon-box ${colorClass}`}>
        <Icon size={22} />
      </div>
    </div>
  );
}
