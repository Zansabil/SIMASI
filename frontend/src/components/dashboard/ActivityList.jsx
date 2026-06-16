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

  const getTodayDateString = () => {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const todayStr = getTodayDateString();

  // Filter aktivitas agar hanya menampilkan yang dilakukan hari ini
  const filteredActivities = (activities || []).filter(
    (activity) => activity.date === todayStr
  );

  // Pagination slicing
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = currentPage * itemsPerPage;
  const paginatedActivities = filteredActivities.slice(startIndex, endIndex);

  const hasMore = filteredActivities.length > endIndex;

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
          <div className="no-activities-message" style={{ padding: '24px', textAlign: 'center', color: '#64748b', fontSize: '14px' }}>
            Tidak ada aktivitas hari ini.
          </div>
        )}
      </div>

      {filteredActivities.length > 0 && (
        <Pagination
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={(val) => {
            setItemsPerPage(val);
            setCurrentPage(1);
          }}
          hasMore={hasMore}
        />
      )}
    </section>
  );
}
