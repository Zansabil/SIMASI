import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
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
import { parseLocation } from '../../utils/locationHelper';

// Import service API
import { 
  fetchRepairs, 
  createRepair, 
  validateRepair, 
  rejectRepair, 
  completeRepair,
  deleteRepair,
  updateRepairProgress
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
  const [selectedItem, setSelectedItem] = useState(null);
  
  const [statusModal, setStatusModal] = useState({ isOpen: false, type: 'success', title: '', message: '' });
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, item: null });

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

        let parsedAssetName = item.aset ? item.aset.nama_aset : 'Aset';
        let parsedLocation = item.aset ? item.aset.lokasi_aset : '-';
        let parsedDesc = item.deskripsi;
        let parsedUnit = 'Unit';

        // Extract information from description if it follows the pattern (useful when asset is deleted or properties are missing)
        if (item.deskripsi && item.deskripsi.includes('Nama Aset:')) {
          const match = item.deskripsi.match(/Nama Aset:\s*(.*?)\s*Lokasi:\s*(.*?)\s*Deskripsi:\s*(.*)/is);
          if (match) {
            parsedAssetName = item.aset ? item.aset.nama_aset : match[1].trim();
            parsedLocation = item.aset ? item.aset.lokasi_aset : match[2].trim();
            parsedDesc = match[3].trim();
          }
        }

        if (parsedLocation && parsedLocation !== '-') {
          const { unit } = parseLocation(parsedLocation);
          parsedUnit = unit || 'Unit';
        }

        let imagePath = 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=100&fit=crop';
        
        // Prioritaskan foto dari data aset master jika ada
        if (item.aset && item.aset.foto) {
          if (item.aset.foto.startsWith('http') || item.aset.foto.startsWith('data:')) {
            imagePath = item.aset.foto;
          } else {
            imagePath = `${API_BASE_URL}/storage/${item.aset.foto}`;
          }
        } else if (item.lampiran) {
          // Fallback ke lampiran laporan kerusakan jika foto master tidak ada
          imagePath = `${API_BASE_URL}/storage/${item.lampiran}`;
        }

        return {
          id: item.id,
          reporter_name: item.pelapor ? item.pelapor.nama : 'Unknown',
          unit: parsedUnit,
          date: item.tgl_dibuat ? new Date(item.tgl_dibuat).toLocaleDateString('id-ID') : '-',
          asset_name: parsedAssetName,
          location: parsedLocation,
          description: parsedDesc,
          keterangan: item.keterangan_perbaikan || '',
          status: status,
          priority: 'medium', // Prototype (tidak ada field priority di DB)
          image_path: imagePath
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
    // editData contains { status, priority, keterangan, hasil, biaya, alasanTolak }
    if (!selectedItem) return;

    if (isUsingBackend) {
      try {
        const backendStatusMap = {
          'pending': 'Menunggu',
          'in_progress': 'Diproses',
          'completed': 'Selesai',
          'rejected': 'Ditolak'
        };
        const backendStatus = backendStatusMap[editData.status] || 'Menunggu';

        // 1. Selalu update progress & keterangan lapangan
        await updateRepairProgress(selectedItem.id, backendStatus, editData.keterangan);

        // 2. Jalankan logika spesifik berdasarkan status
        if (editData.status === 'rejected') {
          await rejectRepair(selectedItem.id, editData.alasanTolak || 'Ditolak oleh petugas.');
        } else if (editData.status === 'completed') {
          // Tandai selesai dan buat history di perbaikan_aset
          const idPetugas = localStorage.getItem('user_id'); 
          if (!idPetugas) throw new Error("Sesi tidak valid. Harap login kembali.");
          await completeRepair(selectedItem.id, idPetugas, editData.hasil, editData.biaya);
        }

        // Refresh list
        await loadData();
        setIsEditOpen(false);
        setStatusModal({ isOpen: true, type: 'success', title: 'Berhasil', message: 'Status laporan perbaikan berhasil diperbarui di sistem.' });
      } catch (err) {
        console.error("Gagal update status", err);
        setStatusModal({ isOpen: true, type: 'error', title: 'Gagal', message: "Gagal mengupdate status: " + (err.response?.data?.message || err.message) });
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
      setStatusModal({ isOpen: true, type: 'success', title: 'Berhasil', message: 'Status laporan perbaikan berhasil diperbarui (Offline).' });
    }
  };

  const handleDeleteClick = (item) => {
    setConfirmModal({ isOpen: true, item });
  };

  const processDelete = async () => {
    const item = confirmModal.item;
    setConfirmModal({ isOpen: false, item: null });
    if (!item) return;

    if (isUsingBackend) {
      try {
        await deleteRepair(item.id);
        await loadData();
        setStatusModal({ isOpen: true, type: 'success', title: 'Berhasil', message: 'Data laporan kerusakan berhasil dihapus dari database.' });
      } catch (err) {
        console.error("Gagal menghapus data", err);
        setStatusModal({ isOpen: true, type: 'error', title: 'Gagal', message: "Gagal menghapus data: " + (err.response?.data?.message || err.message) });
      }
    } else {
      const stored = JSON.parse(localStorage.getItem('simas_repairs') || '[]');
      const updatedRepairs = stored.filter(r => r.id !== item.id);
      localStorage.setItem('simas_repairs', JSON.stringify(updatedRepairs));
      await loadData();
      setStatusModal({ isOpen: true, type: 'success', title: 'Berhasil', message: 'Data berhasil dihapus (Offline).' });
    }
  };

  // Handlers for Writing (Admin / Guru)
  const handleTambahLaporanClick = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await axios.get(`${API_BASE_URL}/api/aset`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Jika respons sukses tapi data aset kosong
      if (response.data && Array.isArray(response.data.data) && response.data.data.length === 0) {
        setStatusModal({ 
          isOpen: true, 
          type: 'warning', 
          title: 'Data Aset Kosong', 
          message: "Saat ini tidak ada aset yang dapat dipilih. Silakan daftarkan aset terlebih dahulu di menu Daftar Aset sebelum melaporkan kerusakan." 
        });
        return;
      }
    } catch (error) {
      console.warn("Gagal mengecek data aset:", error);
      // Lanjutkan buka form jika offline/error agar fallback offline di form tetap jalan jika diperlukan
    }

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
        setStatusModal({ isOpen: true, type: 'success', title: 'Berhasil', message: 'Laporan kerusakan berhasil dikirim ke sistem.' });
      } catch (err) {
        console.error("Gagal buat laporan", err);
        throw err;
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
      setStatusModal({ isOpen: true, type: 'success', title: 'Berhasil', message: 'Laporan kerusakan berhasil disimpan (Offline).' });
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
                { value: 'completed', label: 'Selesai' },
                { value: 'rejected', label: 'Ditolak' }
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
              onDelete={handleDeleteClick}
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

        {/* Status & Confirm Modals */}
        <StatusModal
          isOpen={statusModal.isOpen}
          type={statusModal.type}
          title={statusModal.title}
          message={statusModal.message}
          onConfirm={() => setStatusModal({ ...statusModal, isOpen: false })}
          confirmText={statusModal.type === 'error' || statusModal.type === 'warning' ? 'Tutup' : 'OK'}
        />

        <StatusModal
          isOpen={confirmModal.isOpen}
          type="confirm"
          title="Konfirmasi Hapus"
          message={`Apakah Anda yakin ingin menghapus laporan kerusakan untuk aset "${confirmModal.item?.asset_name}" secara permanen? Data yang dihapus tidak dapat dikembalikan.`}
          confirmText="Ya, Hapus"
          cancelText="Batal"
          onConfirm={processDelete}
          onCancel={() => setConfirmModal({ isOpen: false, item: null })}
        />
      </main>
    </DashboardLayout>
  );
}
