import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../config';
import DashboardLayout from '../layout/DashboardLayout';
import PageHeader from '../ui/PageHeader';
import SearchBar from '../ui/SearchBar';
import FilterSelect from '../ui/FilterSelect';
import Pagination from '../asset/Pagination';
import StatusModal from '../ui/StatusModal';
import AssetHistoryDetailModal from './AssetHistoryDetailModal';
import { 
  FiClock, 
  FiPlusCircle, 
  FiEdit, 
  FiTrash2, 
  FiRefreshCw, 
  FiEye, 
  FiInbox,
  FiMapPin
} from 'react-icons/fi';
import './AssetHistoryPage.css';

const ACTION_OPTIONS = [
  { value: 'semua', label: 'Semua Jenis Aksi' },
  { value: 'Penambahan', label: 'Penambahan' },
  { value: 'Perubahan', label: 'Perubahan' },
  { value: 'Pemindahan', label: 'Pemindahan' },
  { value: 'Penghapusan', label: 'Penghapusan' }
];

export default function AssetHistoryPage({ role, currentPath }) {
  const isSuperAdmin = role === 'super-admin';

  // Data states
  const [historyItems, setHistoryItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [availableUnits, setAvailableUnits] = useState([{ value: 'semua', label: 'Semua Unit Kerja' }]);
  
  // Filters & Pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAction, setSelectedAction] = useState('semua');
  const [selectedUnit, setSelectedUnit] = useState('semua');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    penambahan: 0,
    perubahan: 0,
    penghapusan: 0
  });

  // Modals
  const [detailItem, setDetailItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const [statusModal, setStatusModal] = useState({
    isOpen: false,
    type: 'success',
    title: '',
    message: ''
  });

  // Fetch Lokasi Unit untuk Filter
  useEffect(() => {
    const fetchUnits = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const res = await axios.get(`${API_BASE_URL}/api/lokasi_unit`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        if (res.data?.success && Array.isArray(res.data.data)) {
          const unitOpts = res.data.data.map(u => ({
            value: u.nama_unit,
            label: u.nama_unit
          }));
          setAvailableUnits([{ value: 'semua', label: 'Semua Unit Kerja' }, ...unitOpts]);
        }
      } catch (err) {
        console.error('Gagal mengambil data unit:', err);
      }
    };
    fetchUnits();
  }, []);

  // Fetch Riwayat Data
  const fetchHistory = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const params = {
        page: currentPage,
        per_page: itemsPerPage
      };
      if (searchQuery.trim()) params.search = searchQuery.trim();
      if (selectedAction !== 'semua') params.aksi = selectedAction;
      if (selectedUnit !== 'semua') params.unit = selectedUnit;

      const res = await axios.get(`${API_BASE_URL}/api/riwayat_aset`, {
        headers: { Authorization: `Bearer ${token}` },
        params
      });

      if (res.data?.success) {
        const pagedData = res.data.data;
        const items = pagedData.data || [];
        setHistoryItems(items);
        setTotalItems(pagedData.total || items.length);
        setTotalPages(pagedData.last_page || Math.ceil((pagedData.total || items.length) / itemsPerPage));

        // Hitung ringkasan statistik
        let countTambah = 0;
        let countUbah = 0;
        let countHapus = 0;
        items.forEach(it => {
          const a = (it.aksi || '').toLowerCase();
          if (a.includes('tambah')) countTambah++;
          else if (a.includes('ubah') || a.includes('pindah')) countUbah++;
          else if (a.includes('hapus')) countHapus++;
        });
        setStats({
          total: pagedData.total || items.length,
          penambahan: countTambah,
          perubahan: countUbah,
          penghapusan: countHapus
        });
      }
    } catch (err) {
      console.error('Gagal mengambil riwayat aset:', err);
      setStatusModal({
        isOpen: true,
        type: 'error',
        title: 'Gagal Memuat Data',
        message: err.response?.data?.message || 'Terjadi kesalahan saat memuat data riwayat aset.'
      });
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, itemsPerPage, searchQuery, selectedAction, selectedUnit]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // Handle Search Input Change
  const handleSearchChange = (val) => {
    setSearchQuery(val);
    setCurrentPage(1);
  };

  // Handle Filter Action Change
  const handleActionChange = (val) => {
    setSelectedAction(val);
    setCurrentPage(1);
  };

  // Handle Filter Unit Change
  const handleUnitChange = (val) => {
    setSelectedUnit(val);
    setCurrentPage(1);
  };

  // Format Helper
  const formatTime = (timeStr) => {
    if (!timeStr) return { date: '-', time: '' };
    try {
      const d = new Date(timeStr);
      return {
        date: d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }),
        time: d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
      };
    } catch {
      return { date: timeStr, time: '' };
    }
  };

  const getActionBadgeClass = (aksi) => {
    const lower = (aksi || '').toLowerCase();
    if (lower.includes('tambah')) return 'tambah';
    if (lower.includes('ubah')) return 'ubah';
    if (lower.includes('pindah')) return 'pindah';
    if (lower.includes('hapus')) return 'hapus';
    return 'default';
  };

  // Delete Action (Super Admin only)
  const handleConfirmDelete = async () => {
    if (!deleteItem) return;
    try {
      const token = localStorage.getItem('auth_token');
      await axios.delete(`${API_BASE_URL}/api/riwayat_aset/${deleteItem.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDeleteItem(null);
      setStatusModal({
        isOpen: true,
        type: 'success',
        title: 'Berhasil',
        message: 'Data riwayat aset berhasil dihapus.'
      });
      fetchHistory();
    } catch (err) {
      setDeleteItem(null);
      setStatusModal({
        isOpen: true,
        type: 'error',
        title: 'Gagal Menghapus',
        message: err.response?.data?.message || 'Gagal menghapus data riwayat aset.'
      });
    }
  };

  return (
    <DashboardLayout role={role} currentPath={currentPath}>
      <main className="dashboard-body history-page-container">
        {/* Header Section */}
        <PageHeader
          title="Riwayat Aset"
          subtitle="Log jejak audit & riwayat seluruh aktivitas aset dalam sistem"
          actionLabel="Segarkan Data"
          onActionClick={fetchHistory}
          actionIcon={FiRefreshCw}
          actionClassName="btn-history-detail"
        >
          {/* Filters Bar */}
          <div className="history-filter-bar">
            <div className="history-search-wrapper">
              <SearchBar
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Cari aset, kode inventaris, nama user, atau keterangan..."
              />
            </div>

            <div className="history-filter-select-group">
              <FilterSelect
                value={selectedAction}
                onChange={handleActionChange}
                options={ACTION_OPTIONS}
              />

              <FilterSelect
                value={selectedUnit}
                onChange={handleUnitChange}
                options={availableUnits}
              />
            </div>
          </div>
        </PageHeader>

        {/* Ringkasan Statistik */}
        <div className="history-stats-grid">
          <div className="history-stat-card">
            <div className="history-stat-icon total">
              <FiClock />
            </div>
            <div className="history-stat-content">
              <span className="history-stat-value">{stats.total}</span>
              <span className="history-stat-label">Total Log Aktivitas</span>
            </div>
          </div>

          <div className="history-stat-card">
            <div className="history-stat-icon add">
              <FiPlusCircle />
            </div>
            <div className="history-stat-content">
              <span className="history-stat-value">{stats.penambahan}</span>
              <span className="history-stat-label">Penambahan Aset</span>
            </div>
          </div>

          <div className="history-stat-card">
            <div className="history-stat-icon edit">
              <FiEdit />
            </div>
            <div className="history-stat-content">
              <span className="history-stat-value">{stats.perubahan}</span>
              <span className="history-stat-label">Perubahan & Pindah</span>
            </div>
          </div>

          <div className="history-stat-card">
            <div className="history-stat-icon delete">
              <FiTrash2 />
            </div>
            <div className="history-stat-content">
              <span className="history-stat-value">{stats.penghapusan}</span>
              <span className="history-stat-label">Penghapusan</span>
            </div>
          </div>
        </div>

        {/* Table Card */}
        <div className="history-table-card">
          <div className="history-table-wrapper">
            <table className="history-table">
              <thead>
                <tr>
                  <th style={{ width: '50px', textAlign: 'center' }}>No</th>
                  <th style={{ width: '150px' }}>Waktu</th>
                  <th style={{ width: '220px' }}>Aset</th>
                  <th style={{ width: '160px' }}>Lokasi</th>
                  <th style={{ width: '120px' }}>Jenis Aksi</th>
                  <th style={{ width: '180px' }}>Pelaku</th>
                  <th>Keterangan</th>
                  <th style={{ width: '110px', textAlign: 'center' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
                      Memuat data riwayat aset...
                    </td>
                  </tr>
                ) : historyItems.length === 0 ? (
                  <tr>
                    <td colSpan="8">
                      <div className="history-empty-state">
                        <div className="history-empty-icon">
                          <FiInbox />
                        </div>
                        <div className="history-empty-title">Tidak Ada Riwayat Aset</div>
                        <div className="history-empty-desc">
                          {searchQuery || selectedAction !== 'semua' || selectedUnit !== 'semua'
                            ? 'Tidak ada log aktivitas yang cocok dengan filter pencarian.'
                            : 'Belum ada aktivitas transaksi atau perubahan aset yang tercatat.'}
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  historyItems.map((item, index) => {
                    const rowNum = (currentPage - 1) * itemsPerPage + index + 1;
                    const { date, time } = formatTime(item.waktu);
                    const aset = item.aset;
                    const user = item.pengguna;
                    const badgeClass = getActionBadgeClass(item.aksi);

                    return (
                      <tr key={item.id}>
                        {/* No */}
                        <td style={{ textAlign: 'center', color: '#64748b', fontWeight: '500' }}>
                          {rowNum}
                        </td>

                        {/* Waktu */}
                        <td>
                          <div className="history-time-cell">
                            <span className="history-time-date">{date}</span>
                            <span className="history-time-hour">{time} WIB</span>
                          </div>
                        </td>

                        {/* Aset */}
                        <td>
                          <div className="history-asset-cell">
                            {aset?.nama_aset ? (
                              <>
                                <span className="history-asset-name">{aset.nama_aset}</span>
                                <span className="history-asset-code">{aset.kode_inventaris || '-'}</span>
                              </>
                            ) : (
                              <span className="history-asset-deleted">
                                Aset telah dihapus permanen
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Lokasi */}
                        <td>
                          {aset?.lokasi_unit?.nama_unit ? (
                            <div>
                              <span className="history-location-tag">
                                <FiMapPin size={11} /> {aset.lokasi_unit.nama_unit}
                              </span>
                              {aset.ruangan?.nama_ruangan && (
                                <div className="history-room-text">
                                  {aset.ruangan.nama_ruangan}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span style={{ color: '#94a3b8' }}>-</span>
                          )}
                        </td>

                        {/* Aksi */}
                        <td>
                          <span className={`history-badge ${badgeClass}`}>
                            {item.aksi}
                          </span>
                        </td>

                        {/* Pelaku */}
                        <td>
                          <div className="history-user-cell">
                            <div className="history-user-avatar">
                              {user?.nama ? user.nama.charAt(0).toUpperCase() : 'S'}
                            </div>
                            <div className="history-user-info">
                              <span className="history-user-name">
                                {user?.nama || 'Sistem / Dihapus'}
                              </span>
                              <span className="history-user-role">
                                {user?.peran?.nama || user?.jabatan || '-'}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Keterangan */}
                        <td>
                          <div className="history-desc-cell" title={item.keterangan}>
                            {item.keterangan || '-'}
                          </div>
                        </td>

                        {/* Action Buttons */}
                        <td>
                          <div className="history-actions" style={{ justifyContent: 'center' }}>
                            <button
                              type="button"
                              className="btn-history-detail"
                              onClick={() => setDetailItem(item)}
                              title="Lihat Detail Riwayat"
                            >
                              <FiEye size={13} /> Detail
                            </button>

                            {isSuperAdmin && (
                              <button
                                type="button"
                                className="btn-history-delete"
                                onClick={() => setDeleteItem(item)}
                                title="Hapus Log Riwayat (Super Admin)"
                                aria-label="Hapus Log Riwayat"
                              >
                                <FiTrash2 size={13} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="history-table-footer">
            <span>
              Menampilkan {historyItems.length} dari {totalItems} total riwayat
            </span>
          </div>
        </div>

        {/* Pagination */}
        {!isLoading && totalItems > 0 && (
          <Pagination
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={(val) => {
              setItemsPerPage(val);
              setCurrentPage(1);
            }}
            hasMore={currentPage * itemsPerPage < totalItems}
            totalPages={totalPages}
            totalItems={totalItems}
          />
        )}

        {/* Detail Modal */}
        <AssetHistoryDetailModal
          isOpen={!!detailItem}
          onClose={() => setDetailItem(null)}
          item={detailItem}
        />

        {/* Delete Confirmation Modal (Super Admin only) */}
        {isSuperAdmin && (
          <StatusModal
            isOpen={!!deleteItem}
            type="confirm"
            title="Konfirmasi Hapus Riwayat"
            message={`Apakah Anda yakin ingin menghapus data riwayat log #${deleteItem?.id} untuk aksi "${deleteItem?.aksi}"? Tindakan ini tidak dapat dibatalkan.`}
            confirmText="Ya, Hapus"
            cancelText="Batal"
            onConfirm={handleConfirmDelete}
            onCancel={() => setDeleteItem(null)}
          />
        )}

        {/* General Alert Modal */}
        <StatusModal
          isOpen={statusModal.isOpen}
          type={statusModal.type}
          title={statusModal.title}
          message={statusModal.message}
          onConfirm={() => setStatusModal(prev => ({ ...prev, isOpen: false }))}
          confirmText={statusModal.type === 'error' ? 'Tutup' : 'OK'}
        />
      </main>
    </DashboardLayout>
  );
}
