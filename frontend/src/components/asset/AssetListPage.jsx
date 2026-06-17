import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../config';
import AssetTable from './AssetTable';
import Pagination from './Pagination';
import DashboardLayout from '../layout/DashboardLayout';
import StatusModal from '../ui/StatusModal';
import AssetFormModal from './AssetFormModal';
import AssetDetailModal from './AssetDetailModal';
import PageHeader from '../ui/PageHeader';
import SearchBar from '../ui/SearchBar';
import FilterSelect from '../ui/FilterSelect';
import './AssetListPage.css';

// Mock data matching the mockup images exactly (default fallback)
const initialMockAssets = [
  {
    id: 'mock-1',
    name: 'Tong Sampah',
    asset_code: 'SMP-20240712-023',
    location: 'SMP - Ruang Kelas 7A',
    quantity: 5,
    condition: 'baik',
    source_of_funds: 'Dana Yayasan',
    price: 20000,
    image_path: 'https://images.unsplash.com/photo-1577705998148-6da4f3e46cf0?w=120&fit=crop'
  },
  {
    id: 'mock-2',
    name: 'Laptop ASUS',
    asset_code: 'SMA-20240811-023',
    location: 'SMA - Lab Komputer',
    quantity: 3,
    condition: 'baik',
    source_of_funds: 'Dana Yayasan',
    price: 4000000,
    image_path: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=120&fit=crop'
  },
  {
    id: 'mock-3',
    name: 'Tong Sampah',
    asset_code: 'SMP-20240712-023',
    location: 'SMP - Perpustakaan',
    quantity: 5,
    condition: 'baik',
    source_of_funds: 'Dana Yayasan',
    price: 20000,
    image_path: 'https://images.unsplash.com/photo-1577705998148-6da4f3e46cf0?w=120&fit=crop'
  },
  {
    id: 'mock-4',
    name: 'Tong Sampah',
    asset_code: 'SMP-20240712-023',
    location: 'SMP - Gudang Utama',
    quantity: 5,
    condition: 'baik',
    source_of_funds: 'Dana Yayasan',
    price: 20000,
    image_path: 'https://images.unsplash.com/photo-1577705998148-6da4f3e46cf0?w=120&fit=crop'
  },
  {
    id: 'mock-5',
    name: 'Tong Sampah',
    asset_code: 'SMP-20240712-023',
    location: 'SMP - Kantin Sekolah',
    quantity: 5,
    condition: 'baik',
    source_of_funds: 'Dana Yayasan',
    price: 20000,
    image_path: 'https://images.unsplash.com/photo-1577705998148-6da4f3e46cf0?w=120&fit=crop'
  }
];

export default function AssetListPage({ role, hasWriteAccess, currentPath }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilterField, setSelectedFilterField] = useState('all'); // all, name, code, location
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(5);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Modal display states (only used if hasWriteAccess is true)
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [assetToEdit, setAssetToEdit] = useState(null);
  
  // Detail Modal state
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [assetToView, setAssetToView] = useState(null);
  
  // Status & Confirm Modals
  const [statusModal, setStatusModal] = useState({ isOpen: false, type: 'success', title: '', message: '' });
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, asset: null });

  const [allAssets, setAllAssets] = useState(initialMockAssets);
  const [assets, setAssets] = useState(initialMockAssets);
  // Local filtering helper for offline demo
  const filterMockData = () => {
    let filtered = [...allAssets];

    if (searchQuery) {
      if (selectedFilterField === 'all') {
        filtered = filtered.filter(asset =>
          asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          asset.asset_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
          asset.location.toLowerCase().includes(searchQuery.toLowerCase())
        );
      } else if (selectedFilterField === 'name') {
        filtered = filtered.filter(asset => asset.name.toLowerCase().includes(searchQuery.toLowerCase()));
      } else if (selectedFilterField === 'code') {
        filtered = filtered.filter(asset => asset.asset_code.toLowerCase().includes(searchQuery.toLowerCase()));
      } else if (selectedFilterField === 'location') {
        filtered = filtered.filter(asset => asset.location.toLowerCase().includes(searchQuery.toLowerCase()));
      }
    }

    setAssets(filtered);
    setTotalItems(filtered.length);
  };

  // Fetch assets from Laravel API
  useEffect(() => {
    const fetchAssets = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('auth_token');
        const config = {
          headers: {
            Authorization: `Bearer ${token}`
          }
        };

        const field = selectedFilterField === 'all' ? 'all' : (selectedFilterField === 'name' ? 'nama_aset' : (selectedFilterField === 'code' ? 'kode_inventaris' : 'lokasi_aset'));
        const response = await axios.get(
          `${API_BASE_URL}/api/aset?search=${searchQuery}&search_field=${field}&page=${currentPage}&per_page=${itemsPerPage}`,
          config
        );

        if (response.data && Array.isArray(response.data.data)) {
          // Map backend format to frontend format for consistency
          const mappedAssets = response.data.data.map(item => ({
            id: item.id,
            name: item.nama_aset,
            asset_code: item.kode_inventaris,
            location: item.lokasi_aset,
            quantity: item.jumlah_aset,
            condition: item.kondisi_aset,
            purchase_date: item.tgl_diperoleh,
            source_of_funds: item.sumber_dana || 'Dana Yayasan',
            price: item.harga_aset || 0,
            image_path: item.foto || null
          }));
          setAllAssets(mappedAssets);
          setAssets(mappedAssets);
          setTotalItems(mappedAssets.length); // Fallback to array length since pagination wasn't fully supported in API index
        } else {
          filterMockData();
        }
      } catch (err) {
        console.warn("Backend API not reachable. Using locally filtered mock data for presentation.", err);
        filterMockData();
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssets();
  }, [searchQuery, selectedFilterField, currentPage, itemsPerPage, refreshTrigger]);

  // Actions handlers
  const handleView = (asset) => {
    setAssetToView(asset);
    setIsDetailOpen(true);
  };

  const handleEdit = (asset) => {
    setAssetToEdit(asset);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (asset) => {
    setConfirmModal({ isOpen: true, asset });
  };

  const processDelete = async () => {
    const asset = confirmModal.asset;
    setConfirmModal({ isOpen: false, asset: null });
    if (!asset) return;

    try {
      const token = localStorage.getItem('auth_token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };
      await axios.delete(`${API_BASE_URL}/api/aset/${asset.id}`, config);
      setAllAssets(prev => prev.filter(item => item.id !== asset.id));
      setRefreshTrigger(prev => prev + 1);
      setStatusModal({ isOpen: true, type: 'success', title: 'Berhasil', message: 'Aset berhasil dihapus.' });
    } catch (err) {
      console.warn("Backend API error, deleting asset locally.", err);
      setAllAssets(prev => prev.filter(item => item.id !== asset.id));
      setRefreshTrigger(prev => prev + 1);
      setStatusModal({ isOpen: true, type: 'success', title: 'Berhasil (Offline)', message: 'Aset berhasil dihapus.' });
    }
  };

  const handleTambahAsetClick = () => {
    setAssetToEdit(null);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    const parsedPrice = typeof formData.price === 'string' ? Number(formData.price.replace(/\D/g, '')) : Number(formData.price);
    const resolvedDate = formData.purchaseDate || new Date().toISOString().split('T')[0];

    if (assetToEdit) {
      // Mode Edit
      const updatedAsset = {
        ...assetToEdit,
        name: formData.name,
        location: formData.location,
        quantity: Number(formData.quantity) || 1,
        condition: formData.condition,
        source_of_funds: formData.source,
        price: parsedPrice,
        purchase_date: resolvedDate,
        image_path: formData.image
      };

      try {
        const token = localStorage.getItem('auth_token');
        const config = {
          headers: { Authorization: `Bearer ${token}` }
        };
        const response = await axios.put(`${API_BASE_URL}/api/aset/${assetToEdit.id}`, {
          nama_aset: formData.name,
          kode_inventaris: formData.code,
          jenis_aset: 'Umum',
          jumlah_aset: Number(formData.quantity),
          kondisi_aset: formData.condition,
          lokasi_aset: formData.location,
          tgl_diperoleh: resolvedDate,
          harga_aset: parsedPrice,
          sumber_dana: formData.source,
          foto: formData.image
        }, config);

        // Map backend response to frontend format
        const updatedFromBackend = {
          ...updatedAsset,
          id: response.data.data.id,
          name: response.data.data.nama_aset,
          asset_code: response.data.data.kode_inventaris,
          location: response.data.data.lokasi_aset,
          quantity: response.data.data.jumlah_aset,
          condition: response.data.data.kondisi_aset,
          purchase_date: response.data.data.tgl_diperoleh
        };
        
        setAllAssets(prev => prev.map(item => item.id === assetToEdit.id ? updatedFromBackend : item));
        setRefreshTrigger(prev => prev + 1);
      } catch (err) {
        console.error("Backend API error, updating asset failed.", err);
        const errorMsg = err.response?.data?.message || err.message || 'Gagal memperbarui aset.';
        setStatusModal({ isOpen: true, type: 'error', title: 'Gagal', message: errorMsg });
        setIsFormOpen(false);
        return;
      }
    } else {
      // Mode Tambah
      const newAsset = {
        id: 'local-' + Date.now(),
        name: formData.name,
        asset_code: formData.code,
        location: formData.location,
        quantity: Number(formData.quantity) || 1,
        condition: formData.condition,
        source_of_funds: formData.source,
        price: parsedPrice,
        purchase_date: resolvedDate,
        image_path: formData.image || 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=120&fit=crop'
      };

      try {
        const token = localStorage.getItem('auth_token');
        const config = {
          headers: { Authorization: `Bearer ${token}` }
        };
        const response = await axios.post(`${API_BASE_URL}/api/aset`, {
          nama_aset: formData.name,
          kode_inventaris: formData.code,
          jenis_aset: 'Umum',
          jumlah_aset: Number(formData.quantity),
          kondisi_aset: formData.condition,
          lokasi_aset: formData.location,
          tgl_diperoleh: resolvedDate,
          harga_aset: parsedPrice,
          sumber_dana: formData.source,
          foto: formData.image
        }, config);

        if (response.data && response.data.data) {
          const createdBackendAsset = {
            ...newAsset,
            id: response.data.data.id,
            name: response.data.data.nama_aset,
            asset_code: response.data.data.kode_inventaris,
            location: response.data.data.lokasi_aset,
            quantity: response.data.data.jumlah_aset,
            condition: response.data.data.kondisi_aset,
            purchase_date: response.data.data.tgl_diperoleh
          };
          setAllAssets(prev => [createdBackendAsset, ...prev]);
        } else {
          setAllAssets(prev => [newAsset, ...prev]);
        }
        setRefreshTrigger(prev => prev + 1);
      } catch (err) {
        console.error("Backend API error, adding asset failed.", err);
        const errorMsg = err.response?.data?.message || err.message || 'Gagal menambahkan aset.';
        setStatusModal({ isOpen: true, type: 'error', title: 'Gagal', message: errorMsg });
        setIsFormOpen(false);
        return;
      }
    }

    setIsFormOpen(false);
    setStatusModal({ 
      isOpen: true, 
      type: 'success', 
      title: 'Terima Kasih', 
      message: assetToEdit ? "Aset berhasil diperbarui" : "Aset berhasil ditambahkan" 
    });
  };

  // SVGs for icons
  const SearchIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );

  const PlusIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M12 5v14" />
    </svg>
  );

  const ChevronDownIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m6 9 6 6 6-6" />
    </svg>
  );

  const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );

  const UploadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );


  return (
    <DashboardLayout role={role} currentPath={currentPath}>
      <main className="dashboard-body">
        {/* Top Header Section */}
        <PageHeader
          title="Daftar Aset"
          subtitle="Kelola dan pantau seluruh data aset sekolah"
          actionLabel={hasWriteAccess ? "Tambah Aset" : null}
          onActionClick={handleTambahAsetClick}
          actionIcon={PlusIcon}
          actionClassName="btn-tambah-aset"
        >
          {/* Filter Row: Search & Dropdown Filter Fields */}
          <div className="filter-row">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Cari Barang..."
            />

            <FilterSelect
              value={selectedFilterField}
              onChange={setSelectedFilterField}
              options={[
                { value: 'all', label: 'Semua Kategori' },
                { value: 'name', label: 'Nama Barang' },
                { value: 'code', label: 'Kode Barang' },
                { value: 'location', label: 'Lokasi Barang' }
              ]}
            />
          </div>
        </PageHeader>

        {/* Reusable Asset Table Component */}
        <AssetTable
          assets={assets}
          isLoading={isLoading}
          showActions={hasWriteAccess}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDeleteClick}
        />

        {/* Pagination Controls Footer */}
        <Pagination
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={setItemsPerPage}
          hasMore={assets.length >= itemsPerPage}
        />

        {/* Footer copyright */}
        <footer className="footer-copyright-text">
          © 2025 SIMAS - Sistem Informasi Manajemen Aset
        </footer>

        {/* MODAL 1: TAMBAH / EDIT ASET FORM (Only for write access roles) */}
        {hasWriteAccess && (
          <AssetFormModal
            isOpen={isFormOpen}
            onClose={() => setIsFormOpen(false)}
            onSubmit={handleFormSubmit}
            assetToEdit={assetToEdit}
            allAssets={allAssets}
          />
        )}

        <AssetDetailModal 
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          asset={assetToView}
        />

        <StatusModal
          isOpen={statusModal.isOpen}
          type={statusModal.type}
          title={statusModal.title}
          message={statusModal.message}
          onConfirm={() => setStatusModal({ ...statusModal, isOpen: false })}
        />

        <StatusModal
          isOpen={confirmModal.isOpen}
          type="confirm"
          title="Konfirmasi Hapus"
          message={`Apakah Anda yakin ingin menghapus aset "${confirmModal.asset?.name}" secara permanen? Data yang dihapus tidak dapat dikembalikan.`}
          confirmText="Ya, Hapus"
          cancelText="Batal"
          onConfirm={processDelete}
          onCancel={() => setConfirmModal({ isOpen: false, asset: null })}
        />
      </main>
    </DashboardLayout>
  );
}
