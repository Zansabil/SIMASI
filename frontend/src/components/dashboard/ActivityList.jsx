import React, { useState } from 'react';
import { FiShoppingCart, FiTool, FiInbox } from 'react-icons/fi';
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
          <div
            className="no-activities-message"
            style={{
              padding: '48px 16px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              color: '#64748b',
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: '#f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#94a3b8',
                marginBottom: '4px',
              }}
            >
              <FiInbox size={24} />
            </div>
            <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#334155' }}>
              Tidak ada aktivitas terbaru
            </p>
            <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8' }}>
              Aktivitas pengadaan dan perbaikan akan muncul di sini saat tersedia.
            </p>
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
