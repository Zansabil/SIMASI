import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DashboardLayout from '../layout/DashboardLayout';
import PageHeader from '../ui/PageHeader';
import SearchBar from '../ui/SearchBar';
import StatusModal from '../ui/StatusModal';
import RepairTable from './RepairTable';
import RepairFormModal from './RepairFormModal';
import RepairDetailModal from './RepairDetailModal';
import RepairEditModal from './RepairEditModal';
import { FiPlus } from 'react-icons/fi';
import './RepairListPage.css';

// Mock data matching the mockup images exactly (default fallback)
const initialMockRepairs = [
  {
    id: 'mock-1',
    reporter_name: 'Ahmad Rizki',
    unit: 'SMA',
    date: '02-10-2025',
    asset_name: 'Proyektor Ruang Kelas',
    location: 'Ruang 4A',
    description: 'Proyektor tidak bisa menyala ...',
    status: 'pending', // Menunggu
    priority: 'high',  // Mendesak
    image_path: 'https://images.unsplash.com/photo-1535016120720-40c646be5580?w=120&fit=crop'
  },
  {
    id: 'mock-2',
    reporter_name: 'Siti Maesaroh',
    unit: 'SMA',
    date: '12-10-2025',
    asset_name: 'AC Ruang Guru',
    location: 'Ruang Guru Lantai 2',
    description: 'AC mengeluarkan bau tidak sedap ...',
    status: 'in_progress', // Sedang di Kerjakan
    priority: 'low',  // Tidak Mendesak
    image_path: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=120&fit=crop'
  },
  {
    id: 'mock-3',
    reporter_name: 'M. Fahri Saputra',
    unit: 'MA',
    date: '14-10-2025',
    asset_name: 'Kursi Belajar',
    location: 'Kelas XI IPA 1',
    description: 'Salah satu kaki kursi patah ...',
    status: 'in_progress', // Sedang di Kerjakan
    priority: 'high',  // Mendesak
    image_path: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=120&fit=crop'
  },
  {
    id: 'mock-4',
    reporter_name: 'Dewi Anggraini',
    unit: 'TK',
    date: '18-10-2025',
    asset_name: 'Speaker Aktif',
    location: 'Ruang Kegiatan Anak',
    description: 'Speaker mengeluarkan suara pecah ...',
    status: 'completed', // Selesai
    priority: 'medium',  // Sedang
    image_path: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=120&fit=crop'
  },
  {
    id: 'mock-5',
    reporter_name: 'Lestari',
    unit: 'SD',
    date: '16-10-2025',
    asset_name: 'Meja Guru',
    location: 'Ruang 1A',
    description: 'Meja berlubang di bagian atas ...',
    status: 'completed', // Selesai
    priority: 'medium',  // Sedang
    image_path: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=120&fit=crop'
  }
];

export default function RepairListPage({ role, hasWriteAccess, hasStaffAccess, currentPath }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // all, pending, in_progress, completed
  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const [allRepairs, setAllRepairs] = useState([]);
  const [repairs, setRepairs] = useState([]);

  // Load repairs from localStorage or initial mock data (shared across roles for prototype consistency)
  useEffect(() => {
    const stored = localStorage.getItem('simas_repairs');
    if (stored) {
      setAllRepairs(JSON.parse(stored));
    } else {
      localStorage.setItem('simas_repairs', JSON.stringify(initialMockRepairs));
      setAllRepairs(initialMockRepairs);
    }
  }, []);

  // Local filtering helper for offline demo
  const filterMockData = () => {
    let filtered = [...allRepairs];

    // 1. Filter by Active Tab Status
    if (activeTab !== 'all') {
      filtered = filtered.filter(item => item.status === activeTab);
    }

    // 2. Filter by Search Query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        item =>
          item.asset_name.toLowerCase().includes(query) ||
          item.reporter_name.toLowerCase().includes(query)
      );
    }

    setRepairs(filtered);
  };

  // Fetch repair reports from Laravel API / fallback to filtered mock data
  useEffect(() => {
    const fetchRepairs = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('auth_token');
        const config = {
          headers: {
            Authorization: `Bearer ${token}`
          }
        };

        const statusParam = activeTab !== 'all' ? `&status=${activeTab}` : '';
        const response = await axios.get(
          `http://localhost:8000/api/repairs?search=${searchQuery}${statusParam}`,
          config
        );

        if (response.data && response.data.data && response.data.data.length > 0) {
          const mapped = response.data.data.map(item => ({
            id: item.id,
            reporter_name: item.reporter ? item.reporter.name : 'Unknown',
            unit: item.asset ? item.asset.location : 'Yayasan',
            date: item.created_at ? new Date(item.created_at).toLocaleDateString('id-ID') : '-',
            asset_name: item.asset ? item.asset.name : 'Aset',
            location: item.asset ? item.asset.location : '-',
            description: item.description,
            status: item.status,
            priority: item.priority || 'medium',
            image_path: item.asset && item.asset.image_path ? `http://localhost:8000/storage/${item.asset.image_path}` : 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=100&fit=crop'
          }));
          setRepairs(mapped);
        } else {
          filterMockData();
        }
      } catch (err) {
        // Backend API offline, fallback to locally filtered data
        filterMockData();
      } finally {
        setIsLoading(false);
      }
    };

    if (allRepairs.length > 0) {
      fetchRepairs();
    } else {
      setRepairs([]);
      setIsLoading(false);
    }
  }, [searchQuery, activeTab, allRepairs]);

  // Handlers for Staff (Petugas Perbaikan)
  const handleOpenView = (item) => {
    setSelectedItem(item);
    setIsViewOpen(true);
  };

  const handleOpenEdit = (item) => {
    setSelectedItem(item);
    setIsEditOpen(true);
  };

  const handleEditSubmit = (editData) => {
    const updatedRepairs = allRepairs.map(item => {
      if (item.id === selectedItem.id) {
        return {
          ...item,
          status: editData.status,
          priority: editData.priority
        };
      }
      return item;
    });

    localStorage.setItem('simas_repairs', JSON.stringify(updatedRepairs));
    setAllRepairs(updatedRepairs);
    setIsEditOpen(false);
    setIsSuccessOpen(true);

    // Dispatch update event for potential dashboard updates
    window.dispatchEvent(new Event('repairs-updated'));
  };

  // Handlers for Writing (Admin / Guru)
  const handleTambahLaporanClick = () => {
    setSelectedItem(null);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    // Format date YYYY-MM-DD -> DD-MM-YYYY
    const parts = formData.date.split('-');
    const formattedDate = parts.length === 3 ? `${parts[2]}-${parts[1]}-${parts[0]}` : formData.date;

    const newRepair = {
      id: 'local-' + Date.now(),
      reporter_name: formData.reporter_name,
      unit: formData.unit,
      date: formattedDate,
      asset_name: formData.asset_name,
      location: formData.location,
      description: formData.description,
      status: 'pending', // Menunggu
      priority: 'medium', // Default priority
      image_path: formData.image_path || 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=100&fit=crop'
    };

    try {
      const token = localStorage.getItem('auth_token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };

      // Real backend API call
      await axios.post('http://localhost:8000/api/repairs', {
        asset_id: 1, // Default mockup asset
        description: `${formData.asset_name} (${formData.location}): ${formData.description}`,
      }, config);

      const updatedRepairs = [newRepair, ...allRepairs];
      localStorage.setItem('simas_repairs', JSON.stringify(updatedRepairs));
      setAllRepairs(updatedRepairs);
    } catch (err) {
      console.warn("Backend API error, adding repair report locally.", err);
      const updatedRepairs = [newRepair, ...allRepairs];
      localStorage.setItem('simas_repairs', JSON.stringify(updatedRepairs));
      setAllRepairs(updatedRepairs);
    }

    setIsFormOpen(false);
    setIsSuccessOpen(true);
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
            {/* Status Tabs */}
            <div className="status-tabs-group">
              <button 
                className={`status-tab-btn ${activeTab === 'all' ? 'active' : ''}`}
                onClick={() => setActiveTab('all')}
              >
                Semua
              </button>
              <button 
                className={`status-tab-btn ${activeTab === 'pending' ? 'active' : ''}`}
                onClick={() => setActiveTab('pending')}
              >
                Menunggu
              </button>
              <button 
                className={`status-tab-btn ${activeTab === 'in_progress' ? 'active' : ''}`}
                onClick={() => setActiveTab('in_progress')}
              >
                Sedang di Kerjakan
              </button>
              <button 
                className={`status-tab-btn ${activeTab === 'completed' ? 'active' : ''}`}
                onClick={() => setActiveTab('completed')}
              >
                Selesai
              </button>
            </div>

            {/* Search bar input */}
            <div className="repair-search-container">
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Cari berdasarkan nama aset atau pelapor"
              />
            </div>
          </div>
        </PageHeader>

        {/* Reusable Repair Table */}
        <RepairTable
          repairs={repairs}
          isLoading={isLoading}
          hasStaffAccess={hasStaffAccess}
          onOpenView={handleOpenView}
          onOpenEdit={handleOpenEdit}
        />

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
          message={hasStaffAccess ? "Status laporan perbaikan berhasil diperbarui" : "Laporan kerusakan berhasil dikirim"}
          onConfirm={() => setIsSuccessOpen(false)}
        />
      </main>
    </DashboardLayout>
  );
}
