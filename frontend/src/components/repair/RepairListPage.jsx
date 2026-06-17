import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../layout/DashboardLayout';
import PageHeader from '../ui/PageHeader';
import SearchBar from '../ui/SearchBar';
import StatusFilter from '../ui/StatusFilter';
import StatusModal from '../ui/StatusModal';
import RepairTable from './RepairTable';
import RepairFormModal from './RepairFormModal';
import RepairDetailModal from './RepairDetailModal';
import RepairEditModal from './RepairEditModal';
import { FiPlus, FiLoader } from 'react-icons/fi';
import Pagination from '../asset/Pagination';
import './RepairListPage.css';
import { API_BASE_URL } from '../../config';

// Import service API
import { 
  fetchRepairs, 
  createRepair, 
  validateRepair, 
  rejectRepair, 
  completeRepair,
  deleteRepair
} from '../../services/repairService';

// Default mock fallbacks jika backend mati
const defaultMockRepairs = [
  {
    id: 'mock-1',
    reporter_name: 'Ahmad Rizki',
    unit: 'SMA',
    date: '02-10-2025',
    asset_name: 'Proyektor Ruang Kelas',
    location: 'Ruang 4A',
    description: 'Proyektor tidak bisa menyala ...',
    status: 'pending',
    priority: 'high',
    image_path: 'https://images.unsplash.com/photo-1535016120720-40c646be5580?w=120&fit=crop'
  }
];

export default function RepairListPage({ role, hasWriteAccess, hasStaffAccess, currentPath }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // all, pending, in_progress, completed
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isUsingBackend, setIsUsingBackend] = useState(false);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeTab]);

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);

  const [repairs, setRepairs] = useState([]);

  // Fetch data dari API Backend
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchRepairs(searchQuery, activeTab);
      
      // Mapping respons backend ke format Frontend
      const mapped = data.map(item => {
        let status = 'pending';
        if (item.status_kerusakan === 'Diproses') status = 'in_progress';
        if (item.status_kerusakan === 'Selesai') status = 'completed';
        if (item.status_kerusakan === 'Ditolak') status = 'rejected';

        return {
          id: item.id,
          reporter_name: item.pelapor ? item.pelapor.nama : 'Unknown',
          unit: item.aset ? item.aset.lokasi_penempatan : 'Unit', // Menggunakan lokasi karena tidak ada unit di model lama
          date: item.tgl_dibuat ? new Date(item.tgl_dibuat).toLocaleDateString('id-ID') : '-',
          asset_name: item.aset ? item.aset.nama_barang : 'Aset',
          location: item.aset ? item.aset.lokasi_penempatan : '-',
          description: item.deskripsi,
          status: status,
          priority: 'medium', // Prototype (tidak ada field priority di DB)
          image_path: item.lampiran 
            ? `${API_BASE_URL}/storage/${item.lampiran}` 
            : 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=100&fit=crop'
        };
      });

      setRepairs(mapped);
      setIsUsingBackend(true);
    } catch (err) {
      console.warn("Backend API not reachable. Using local dummy data.", err);
      // Fallback lokal
      const stored = localStorage.getItem('simas_repairs');
      if (stored) {
        let filtered = JSON.parse(stored);
        if (activeTab !== 'all') {
          filtered = filtered.filter(item => item.status === activeTab);
        }
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          filtered = filtered.filter(item => 
            item.asset_name.toLowerCase().includes(query) || 
            item.reporter_name.toLowerCase().includes(query)
          );
        }
        setRepairs(filtered);
      } else {
        localStorage.setItem('simas_repairs', JSON.stringify(defaultMockRepairs));
        setRepairs(defaultMockRepairs);
      }
      setIsUsingBackend(false);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, activeTab]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handlers for Staff (Petugas Perbaikan)
  const handleOpenView = (item) => {
    setSelectedItem(item);
    setIsViewOpen(true);
  };

  const handleOpenEdit = (item) => {
    setSelectedItem(item);
    setIsEditOpen(true);
  };

  const handleEditSubmit = async (editData) => {
    // editData contains { status, priority }
    if (!selectedItem) return;

    if (isUsingBackend) {
      try {
        if (editData.status === 'in_progress') {
          // Tandai sedang dikerjakan (Diproses) via validasi
          await validateRepair(selectedItem.id);
        } else if (editData.status === 'rejected') {
          await rejectRepair(selectedItem.id, editData.alasanTolak || 'Ditolak oleh petugas.');
        } else if (editData.status === 'completed') {
          // Tandai selesai dan buat history di perbaikan_aset
          // Ambil ID Petugas asli dari localStorage (disimpan saat login)
          const idPetugas = localStorage.getItem('user_id') || 4; 
          await completeRepair(selectedItem.id, idPetugas, editData.hasil, editData.biaya);
        }

        // Refresh list
        await loadData();
        setIsEditOpen(false);
        setSuccessMessage('Status laporan perbaikan berhasil diperbarui di sistem.');
        setIsSuccessOpen(true);
      } catch (err) {
        console.error("Gagal update status", err);
        alert("Gagal mengupdate status: " + (err.response?.data?.message || err.message));
      }
    } else {
      // Offline fallback
      const stored = JSON.parse(localStorage.getItem('simas_repairs') || '[]');
      const updatedRepairs = stored.map(item => {
        if (item.id === selectedItem.id) {
          return { ...item, status: editData.status, priority: editData.priority };
        }
        return item;
      });
      localStorage.setItem('simas_repairs', JSON.stringify(updatedRepairs));
      await loadData();
      setIsEditOpen(false);
      setSuccessMessage('Status laporan perbaikan berhasil diperbarui (Offline).');
      setIsSuccessOpen(true);
    }
  };

  const handleDelete = async (item) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus laporan kerusakan untuk aset "${item.asset_name}" secara permanen? Data yang dihapus tidak dapat dikembalikan.`)) {
      if (isUsingBackend) {
        try {
          await deleteRepair(item.id);
          await loadData();
          setSuccessMessage('Data laporan kerusakan berhasil dihapus dari database.');
          setIsSuccessOpen(true);
        } catch (err) {
          console.error("Gagal menghapus data", err);
          alert("Gagal menghapus data: " + (err.response?.data?.message || err.message));
        }
      } else {
        const stored = JSON.parse(localStorage.getItem('simas_repairs') || '[]');
        const updatedRepairs = stored.filter(r => r.id !== item.id);
        localStorage.setItem('simas_repairs', JSON.stringify(updatedRepairs));
        await loadData();
        setSuccessMessage('Data berhasil dihapus (Offline).');
        setIsSuccessOpen(true);
      }
    }
  };

  // Handlers for Writing (Admin / Guru)
  const handleTambahLaporanClick = () => {
    setSelectedItem(null);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    if (isUsingBackend) {
      try {
        const formDataObj = new FormData();
        // Menggunakan id_aset yang dipilih dari dropdown
        formDataObj.append('id_aset', formData.asset_id); 
        formDataObj.append('kategori_aset', 'Lainnya');
        // Gabungkan nama & lokasi aset ke dalam deskripsi agar info tidak hilang
        const fullDesc = `Nama Aset: ${formData.asset_name}\nLokasi: ${formData.location}\nDeskripsi: ${formData.description}`;
        formDataObj.append('deskripsi', fullDesc);
        
        if (formData.image_file) {
          formDataObj.append('lampiran', formData.image_file);
        }

        await createRepair(formDataObj);
        await loadData();
        
        setIsFormOpen(false);
        setSuccessMessage('Laporan kerusakan berhasil dikirim ke sistem.');
        setIsSuccessOpen(true);
      } catch (err) {
        console.error("Gagal buat laporan", err);
        alert("Gagal membuat laporan: " + (err.response?.data?.message || err.message));
      }
    } else {
      // Offline fallback
      const stored = JSON.parse(localStorage.getItem('simas_repairs') || '[]');
      const newRepair = {
        id: 'local-' + Date.now(),
        reporter_name: formData.reporter_name,
        unit: formData.unit,
        date: formData.date,
        asset_name: formData.asset_name,
        location: formData.location,
        description: formData.description,
        status: 'pending',
        priority: 'medium',
        image_path: formData.image_path || 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=100&fit=crop'
      };
      
      const updated = [newRepair, ...stored];
      localStorage.setItem('simas_repairs', JSON.stringify(updated));
      await loadData();
      
      setIsFormOpen(false);
      setSuccessMessage('Laporan kerusakan berhasil disimpan (Offline).');
      setIsSuccessOpen(true);
    }
  };

  return (
    <DashboardLayout role={role} currentPath={currentPath}>
      <main className="dashboard-body">
        {/* Top Header Section */}
        <PageHeader
          title={hasStaffAccess ? "Perbaikan Aset" : "Pelaporan Kerusakan Aset"}
          subtitle={hasStaffAccess ? "Tinjau dan kelola seluruh antrean laporan perbaikan kerusakan aset" : "Laporkan kerusakan aset sekolah untuk segera ditindaklanjuti"}
          actionLabel={hasWriteAccess ? "Laporkan Kerusakan" : null}
          onActionClick={handleTambahLaporanClick}
          actionIcon={FiPlus}
          actionClassName="btn-laporkan-kerusakan"
        >
          {/* Filter and Search Row */}
          <div className="repair-filter-row">
            {/* Search bar input */}
            <div className="repair-search-container">
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Cari berdasarkan nama aset atau pelapor"
              />
            </div>

            <StatusFilter
              value={activeTab}
              onChange={setActiveTab}
              options={[
                { value: 'all', label: 'Semua' },
                { value: 'pending', label: 'Menunggu' },
                { value: 'in_progress', label: 'Sedang di Kerjakan' },
                { value: 'completed', label: 'Selesai' }
              ]}
            />
          </div>
        </PageHeader>

        {isLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 0', gap: '16px' }}>
            <FiLoader size={32} className="spin-animation" style={{ color: '#6366f1' }} />
            <p style={{ color: '#64748b', fontSize: '14px' }}>Memuat data perbaikan aset...</p>
          </div>
        ) : (
          <>
            <RepairTable
              repairs={repairs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)}
              isLoading={isLoading}
              hasStaffAccess={hasStaffAccess}
              onOpenView={handleOpenView}
              onOpenEdit={handleOpenEdit}
              onDelete={handleDelete}
            />

            <Pagination
              currentPage={currentPage}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={setItemsPerPage}
              hasMore={(currentPage * itemsPerPage) < repairs.length}
            />
          </>
        )}

        {/* Footer copyright */}
        <footer className="footer-copyright-text">
          © 2025 SIMAS - Sistem Informasi Manajemen Aset
        </footer>

        {/* Form Modal for Admin / Guru */}
        {hasWriteAccess && (
          <RepairFormModal
            isOpen={isFormOpen}
            onClose={() => setIsFormOpen(false)}
            onSubmit={handleFormSubmit}
          />
        )}

        {/* Detail Modal for Petugas */}
        {hasStaffAccess && (
          <RepairDetailModal
            isOpen={isViewOpen}
            onClose={() => setIsViewOpen(false)}
            selectedItem={selectedItem}
          />
        )}

        {/* Edit Modal for Petugas */}
        {hasStaffAccess && (
          <RepairEditModal
            isOpen={isEditOpen}
            onClose={() => setIsEditOpen(false)}
            onSubmit={handleEditSubmit}
            selectedItem={selectedItem}
          />
        )}

        {/* Status Alert Modal */}
        <StatusModal
          isOpen={isSuccessOpen}
          type="success"
          title="Berhasil"
          message={successMessage}
          onConfirm={() => setIsSuccessOpen(false)}
        />
      </main>
    </DashboardLayout>
  );
}
