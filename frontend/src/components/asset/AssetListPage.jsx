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
import { FiPlus, FiGrid, FiList } from 'react-icons/fi';
import GroupedAssetView from './GroupedAssetView';
import { mapLaravelListToReact, mapReactToLaravel, mapLaravelToReact } from '../../utils/assetMapper';
import { DEFAULT_ASSET_IMAGE } from '../../utils/imageHelper';
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
    image_path: DEFAULT_ASSET_IMAGE
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
    image_path: DEFAULT_ASSET_IMAGE
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
    image_path: DEFAULT_ASSET_IMAGE
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
    image_path: DEFAULT_ASSET_IMAGE
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
    image_path: DEFAULT_ASSET_IMAGE
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
  const [availableUnits, setAvailableUnits] = useState(['SD', 'SMP', 'SMA', 'MA', 'TK']); // Fallback
  const [availableCategories, setAvailableCategories] = useState(['Elektronik', 'Mebel / Furnitur', 'Alat Tulis Kantor / Perlengkapan', 'Umum']); // Fallback
  const [availableRooms, setAvailableRooms] = useState([]);
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'grouped'

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
          // Map backend fields to frontend model using reusable mapper
          const mapped = mapLaravelListToReact(response.data.data);
          setAllAssets(mapped);
          setAssets(mapped);
          setTotalItems(response.data.total || mapped.length);
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

    const fetchUnits = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const response = await axios.get(`${API_BASE_URL}/api/lokasi_unit`, config);
        if (response.data && response.data.success && response.data.data) {
          if (response.data.data.length > 0) {
            setAvailableUnits(response.data.data);
          }
        }
      } catch (err) {
        console.warn("Could not fetch units from API, using fallback.");
      }
    };

    const fetchCategories = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const response = await axios.get(`${API_BASE_URL}/api/kategori_aset`, config);
        if (response.data && response.data.success && response.data.data) {
          const catList = response.data.data.map(c => c.nama_kategori);
          if (catList.length > 0) {
            setAvailableCategories(catList);
          }
        }
      } catch (err) {
        console.warn("Could not fetch categories from API, using fallback.");
      }
    };

    const fetchRooms = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const response = await axios.get(`${API_BASE_URL}/api/ruangan`, config);
        if (response.data && response.data.success && response.data.data) {
          if (response.data.data.length > 0) setAvailableRooms(response.data.data);
        }
      } catch (err) {
        console.warn("Could not fetch rooms from API, using fallback.");
      }
    };

    fetchAssets();
    fetchUnits();
    fetchCategories();
    fetchRooms();
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
        const payload = mapReactToLaravel(formData, assetToEdit.asset_code);
        const response = await axios.put(`${API_BASE_URL}/api/aset/${assetToEdit.id}`, payload, config);

        // Map backend response to frontend format using mapLaravelToReact
        const updatedFromBackend = mapLaravelToReact(response.data.data);
        
        setAllAssets(prev => prev.map(item => item.id === assetToEdit.id ? updatedFromBackend : item));
        setRefreshTrigger(prev => prev + 1);
      } catch (err) {
        console.error("Backend API error, updating asset failed.", err);
        throw err;
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
        image_path: formData.image || DEFAULT_ASSET_IMAGE
      };

      try {
        const token = localStorage.getItem('auth_token');
        const config = {
          headers: { Authorization: `Bearer ${token}` }
        };
        const payload = mapReactToLaravel(formData);
        const response = await axios.post(`${API_BASE_URL}/api/aset`, payload, config);

        if (response.data && response.data.data) {
          const mappedNewAsset = mapLaravelToReact(response.data.data);
          setAllAssets(prev => [mappedNewAsset, ...prev]);
        } else {
          setAllAssets(prev => [newAsset, ...prev]);
        }
        setRefreshTrigger(prev => prev + 1);
      } catch (err) {
        console.error("Backend API error, adding asset failed.", err);
        throw err;
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


  return (
    <DashboardLayout role={role} currentPath={currentPath}>
      <main className="dashboard-body">
        {/* Top Header Section */}
        <PageHeader
          title="Daftar Aset"
          subtitle="Kelola dan pantau seluruh data aset sekolah"
          actionLabel={hasWriteAccess ? "Tambah Aset" : null}
          onActionClick={handleTambahAsetClick}
          actionIcon={FiPlus}
          actionClassName="btn-tambah-aset"
        >
          <div className="view-mode-row">
            <div className="view-mode-toggle">
              <button 
                className={`view-mode-btn ${viewMode === 'list' ? 'active' : ''}`} 
                onClick={() => setViewMode('list')}
                title="Tampilan Semua Aset"
              >
                <FiList /> Daftar Semua
              </button>
              <button 
                className={`view-mode-btn ${viewMode === 'grouped' ? 'active' : ''}`} 
                onClick={() => setViewMode('grouped')}
                title="Tampilan Dikelompokkan per Ruang"
              >
                <FiGrid /> Per Ruangan
              </button>
            </div>
          </div>

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

        {viewMode === 'list' ? (
          <>
            <AssetTable
              assets={assets}
              isLoading={isLoading}
              showActions={hasWriteAccess}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDeleteClick}
            />
            <Pagination
              currentPage={currentPage}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={setItemsPerPage}
              hasMore={assets.length >= itemsPerPage}
            />
          </>
        ) : (
          <GroupedAssetView
            assets={allAssets}
            isLoading={isLoading}
            showActions={hasWriteAccess}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDeleteClick}
          />
        )}

        {/* Footer copyright */}
        <footer className="footer-copyright-text">
          © {new Date().getFullYear()} SIMAS - Sistem Informasi Manajemen Aset
        </footer>

        {/* MODAL 1: TAMBAH / EDIT ASET FORM (Only for write access roles) */}
        {hasWriteAccess && (
          <AssetFormModal
            isOpen={isFormOpen}
            onClose={() => setIsFormOpen(false)}
            onSubmit={handleFormSubmit}
            assetToEdit={assetToEdit}
            availableUnits={availableUnits}
            availableRooms={availableRooms}
            availableCategories={availableCategories}
            existingSources={allAssets ? [...new Set(allAssets.map(a => a.source_of_funds).filter(Boolean))] : []}
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
