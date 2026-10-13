import React, { useState } from 'react';
import { FiShoppingCart, FiTool } from 'react-icons/fi';
import { getStatusConfig } from '../../utils/statusConfig';
import Pagination from '../asset/Pagination';

/**
 * Komponen daftar aktivitas terbaru pada halaman dashboard.
 * Merender setiap baris aktivitas beserta ikon tipe, judul, tanggal,
 * dan badge status.
 *
 * @param {object}  props
 * @param {Array}   props.activities - Array data aktivitas dari useDashboardData
 */
export default function ActivityList({ activities }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // Tampilkan seluruh aktivitas terbaru dari API (sudah terurut dari yang terbaru)
  const displayActivities = activities || [];

  // Pagination slicing
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = currentPage * itemsPerPage;
  const paginatedActivities = displayActivities.slice(startIndex, endIndex);

  const hasMore = displayActivities.length > endIndex;

  return (
    <section className="activities-section">
      <h3 className="activities-header-text">Aktivitas Terbaru</h3>

      <div className="activities-list">
        {paginatedActivities.length > 0 ? (
          paginatedActivities.map((activity) => {
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
          })
        ) : (
          <div className="no-activities-message" style={{ padding: '32px 16px', textAlign: 'center', color: '#64748b', fontSize: '14px' }}>
            Belum ada aktivitas terbaru yang tercatat.
          </div>
        )}
      </div>

      {displayActivities.length > 0 && (
        <Pagination
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={(val) => {
            setItemsPerPage(val);
            setCurrentPage(1);
          }}
          hasMore={hasMore}
          totalPages={Math.ceil(displayActivities.length / itemsPerPage)}
          totalItems={displayActivities.length}
        />
      )}
    </section>
  );
}
