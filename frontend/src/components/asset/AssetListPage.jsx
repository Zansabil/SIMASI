import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../config';
import AssetTable from './AssetTable';
import Pagination from './Pagination';
import DashboardLayout from '../layout/DashboardLayout';
import StatusModal from '../ui/StatusModal';
import AssetFormModal from './AssetFormModal';
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

  // Modal display states (only used if hasWriteAccess is true)
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [assetToEdit, setAssetToEdit] = useState(null);

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

        const field = selectedFilterField === 'all' ? 'all' : (selectedFilterField === 'name' ? 'name' : (selectedFilterField === 'code' ? 'asset_code' : 'location'));
        const response = await axios.get(
          `${API_BASE_URL}/api/assets?search=${searchQuery}&search_field=${field}&page=${currentPage}&per_page=${itemsPerPage}`,
          config
        );

        if (response.data && response.data.data && response.data.data.length > 0) {
          setAssets(response.data.data);
          setTotalItems(response.data.total);
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
  }, [searchQuery, selectedFilterField, currentPage, itemsPerPage, allAssets]);

  // Actions handlers
  const handleView = (asset) => {
    alert(`Melihat detail aset:\nNama: ${asset.name}\nKode: ${asset.asset_code}\nLokasi: ${asset.location}`);
  };

  const handleEdit = (asset) => {
    setAssetToEdit(asset);
    setIsFormOpen(true);
  };

  const handleDelete = (asset) => {
    if (confirm(`Apakah Anda yakin ingin menghapus aset: ${asset.name} (${asset.asset_code})?`)) {
      setAllAssets(prev => prev.filter(item => item.id !== asset.id));
      alert('Aset berhasil dihapus');
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
        await axios.put(`${API_BASE_URL}/api/assets/${assetToEdit.id}`, {
          name: formData.name,
          quantity: Number(formData.quantity),
          condition: formData.condition,
          location: formData.location,
          purchase_date: resolvedDate,
          price: parsedPrice,
          source_of_funds: formData.source,
        }, config);

        setAllAssets(prev => prev.map(item => item.id === assetToEdit.id ? updatedAsset : item));
      } catch (err) {
        console.warn("Backend API error, updating asset locally.", err);
        setAllAssets(prev => prev.map(item => item.id === assetToEdit.id ? updatedAsset : item));
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
        const response = await axios.post(`${API_BASE_URL}/api/assets`, {
          name: formData.name,
          category: 'Umum',
          quantity: Number(formData.quantity),
          condition: formData.condition,
          location: formData.location,
          purchase_date: resolvedDate,
          price: parsedPrice,
          source_of_funds: formData.source,
        }, config);

        if (response.data && response.data.asset) {
          setAllAssets(prev => [response.data.asset, ...prev]);
        } else {
          setAllAssets(prev => [newAsset, ...prev]);
        }
      } catch (err) {
        console.warn("Backend API error, adding asset locally.", err);
        setAllAssets(prev => [newAsset, ...prev]);
      }
    }

    setIsFormOpen(false);
    setIsSuccessOpen(true);
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
          onDelete={handleDelete}
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

        <StatusModal
          isOpen={isSuccessOpen}
          type="success"
          title="Terima kasih"
          message={assetToEdit ? "Aset berhasil diperbarui" : "Aset berhasil ditambahkan"}
          onConfirm={() => setIsSuccessOpen(false)}
        />
      </main>
    </DashboardLayout>
  );
}
