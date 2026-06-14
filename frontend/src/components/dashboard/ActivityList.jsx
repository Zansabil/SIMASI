import React from 'react';
import { FiShoppingCart, FiTool } from 'react-icons/fi';
import { getStatusConfig } from '../../utils/statusConfig';

/**
 * Komponen daftar aktivitas terbaru pada halaman dashboard.
 * Merender setiap baris aktivitas beserta ikon tipe, judul, tanggal,
 * dan badge status.
 *
 * @param {object}  props
 * @param {Array}   props.activities - Array data aktivitas dari useDashboardData
 */
export default function ActivityList({ activities }) {
  return (
    <section className="activities-section">
      <h3 className="activities-header-text">Aktivitas Terbaru</h3>

      <div className="activities-list">
        {activities.map((activity) => {
          const { label, className } = getStatusConfig(activity.status);
          return (
            <div className="activity-row" key={activity.id}>
              <div className="activity-row-left">
                <div className="activity-icon-container">
                  {activity.type === 'Pengadaan'
                    ? <FiShoppingCart size={20} />
                    : <FiTool size={20} />}
                </div>
                <div className="activity-info">
                  <span className="activity-title">{activity.title}</span>
                  <span className="activity-meta">{activity.date}</span>
                </div>
              </div>
              <span className={`status-badge ${className}`}>{label}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
