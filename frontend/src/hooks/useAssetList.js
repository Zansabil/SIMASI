import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { DEFAULT_UNITS, DEFAULT_CATEGORIES } from '../config';
import { mapAssetListResponse, mapAssetForRequest, mapAssetResponse } from '../utils/assetMapper';
import * as assetService from '../services/assetService';
import { fetchRepairs } from '../services/repairService';

const FILTER_FIELD_MAP = {
  all: 'all',
  name: 'nama_aset',
  code: 'kode_inventaris',
  location: 'lokasi_aset'
};

export default function useAssetList() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [selectedFilterField, setSelectedFilterField] = useState('all'); // all, name, code, location
  const [selectedUnitFilter, setSelectedUnitFilter] = useState('all');
  const [selectedRoomFilter, setSelectedRoomFilter] = useState('all');
  const [adminUnit, setAdminUnit] = useState(null); // { id, nama_unit } jika login sebagai Admin Unit
  const [printingRoomKey, setPrintingRoomKey] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isLoading, setIsLoading] = useState(true);

  // Modal display states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [assetToEdit, setAssetToEdit] = useState(null);
  
  // Active repair codes (to prevent duplicate reporting)
  const [activeRepairCodes, setActiveRepairCodes] = useState([]);
  const [inProgressRepairCodes, setInProgressRepairCodes] = useState([]);
  
  // Detail Modal state
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [assetToView, setAssetToView] = useState(null);
  
  // Status & Confirm Modals
  const [statusModal, setStatusModal] = useState({ isOpen: false, type: 'success', title: '', message: '' });
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, asset: null });
  const [confirmSubAssetDelete, setConfirmSubAssetDelete] = useState({ isOpen: false, subAsset: null, parentAssetId: null });

  const [allAssets, setAllAssets] = useState([]);
  const [availableUnits, setAvailableUnits] = useState(DEFAULT_UNITS);
  const [availableCategories, setAvailableCategories] = useState(DEFAULT_CATEGORIES);
  const [categoryObjects, setCategoryObjects] = useState(
    DEFAULT_CATEGORIES.map((name, idx) => ({ id: idx + 1, nama_kategori: name }))
  );
  const [availableRooms, setAvailableRooms] = useState([]);
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'grouped'
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const refreshAssets = () => setRefreshTrigger(prev => prev + 1);

  // Debounce search query to prevent excessive API requests
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500); // 500ms delay

    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Fetch assets from Laravel API with AbortController using Service Layer
  useEffect(() => {
    const controller = new AbortController();

    const fetchAssets = async () => {
      setIsLoading(true);
      try {
        const field = FILTER_FIELD_MAP[selectedFilterField] || 'all';
        const responseData = await assetService.fetchAssets({
          search: debouncedSearchQuery,
          search_field: field
        }, controller.signal);

        if (responseData && Array.isArray(responseData.data)) {
          const mapped = mapAssetListResponse(responseData.data);
          setAllAssets(mapped);
          if (responseData.user_unit) {
            setAdminUnit(responseData.user_unit);
            localStorage.setItem('user_area', responseData.user_unit.nama_unit || '');
          } else {
            setAdminUnit(null);
          }
        } else {
          setAllAssets([]);
        }
      } catch (err) {
        if (axios.isCancel(err)) return; // Ignore cancelled requests
        console.error("Backend API not reachable.", err);
        setAllAssets([]);
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    fetchAssets();

    return () => {
      controller.abort();
    };
  }, [debouncedSearchQuery, selectedFilterField, refreshTrigger]);

  // Fetch static dropdown choices once on mount using Promise.all and Service Layer
  useEffect(() => {
    const fetchStaticData = async () => {
      try {
        const [unitsData, categoriesData, roomsData] = await Promise.all([
          assetService.fetchUnits(),
          assetService.fetchCategories(),
          assetService.fetchRooms()
        ]);

        if (unitsData && unitsData.success && unitsData.data) {
          if (unitsData.data.length > 0) {
            setAvailableUnits(unitsData.data);
          }
        }
        if (categoriesData && categoriesData.success && categoriesData.data) {
          const catList = categoriesData.data.map(c => c.nama_kategori);
          if (catList.length > 0) {
            setAvailableCategories(catList);
            setCategoryObjects(categoriesData.data);
          }
        }
        if (roomsData && roomsData.success && roomsData.data) {
          if (roomsData.data.length > 0) {
            setAvailableRooms(roomsData.data);
          }
        }
      } catch (err) {
        console.warn("Could not fetch static lookup data from API, using default fallbacks.", err);
      }
    };

    fetchStaticData();
  }, [refreshTrigger]);

  // Fetch active repairs to prevent duplicate reporting on the same sub-asset
  useEffect(() => {
    const loadActiveRepairs = async () => {
      try {
        const repairs = await fetchRepairs();
        // Hanya ambil laporan yang belum Selesai atau Ditolak
        const active = repairs.filter(r => r.status_kerusakan !== 'Selesai' && r.status_kerusakan !== 'Ditolak');
        
        const activeCodes = [];
        const inProgressCodes = [];
        
        active.forEach(r => {
          if (r.deskripsi) {
            const match = r.deskripsi.match(/\(Unit:\s*(.*?)\)/);
            if (match) {
              const code = match[1].trim();
              activeCodes.push(code);
              
              if (r.status_kerusakan === 'Diproses') {
                inProgressCodes.push(code);
              }
            }
          }
        });
        
        setActiveRepairCodes(activeCodes);
        setInProgressRepairCodes(inProgressCodes);
      } catch (err) {
        console.warn("Could not fetch active repairs for duplicate prevention.", err);
      }
    };
    
    loadActiveRepairs();
  }, [allAssets]); // Reload when asset list changes

  // Reset Halaman ke 1 saat melakukan pencarian atau mengganti kategori/unit/ruangan filter
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchQuery, selectedFilterField, selectedUnitFilter, selectedRoomFilter, refreshTrigger]);

  // Filter berdasarkan Unit Pendidikan & Ruangan
  const filteredAssets = allAssets.filter(asset => {
    if (selectedUnitFilter && selectedUnitFilter !== 'all') {
      const matchId = String(asset.unit_id || asset.id_unit) === String(selectedUnitFilter);
      const matchName = String(asset.unit || '').trim().toLowerCase() === String(selectedUnitFilter).trim().toLowerCase();
      if (!matchId && !matchName) return false;
    }
    if (selectedRoomFilter && selectedRoomFilter !== 'all') {
      const matchRoomId = String(asset.room_id || asset.id_ruangan) === String(selectedRoomFilter);
      const matchRoomName = String(asset.location || asset.room || '').trim().toLowerCase() === String(selectedRoomFilter).trim().toLowerCase();
      if (!matchRoomId && !matchRoomName) return false;
    }
    return true;
  });

  // Derived state for client-side pagination
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedAssets = filteredAssets.slice(startIndex, startIndex + itemsPerPage);
  const hasMore = filteredAssets.length > currentPage * itemsPerPage;

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

  const processDelete = async (alasan = '') => {
    const asset = confirmModal.asset;
    setConfirmModal({ isOpen: false, asset: null });
    if (!asset) return;

    try {
      await assetService.deleteAsset(asset.id, alasan);
      setAllAssets(prev => prev.filter(item => item.id !== asset.id));
      setStatusModal({ isOpen: true, type: 'success', title: 'Berhasil', message: 'Aset berhasil dihapus dan alasan penghapusan telah dicatat di Riwayat Aset.' });
    } catch (err) {
      console.error("Backend API error, deleting asset failed.", err);
      const errorMsg = err.response?.data?.message || 'Gagal menghapus aset dari server.';
      setStatusModal({ isOpen: true, type: 'error', title: 'Gagal', message: errorMsg });
    }
  };

  const handleTambahAsetClick = () => {
    setAssetToEdit(null);
    setIsFormOpen(true);
  };

  // Handler kelola kategori langsung dari form Daftar Aset (khusus Admin Unit)
  const handleAddCategory = async (namaKategori) => {
    const res = await assetService.createCategory(namaKategori);
    if (res && res.success && res.data) {
      const newCat = res.data;
      setCategoryObjects(prev => [...prev, newCat]);
      setAvailableCategories(prev =>
        prev.includes(newCat.nama_kategori) ? prev : [...prev, newCat.nama_kategori]
      );
      return newCat;
    }
    throw new Error(res?.message || 'Gagal menambahkan kategori.');
  };

  const handleUpdateCategory = async (id, namaBaru, namaLama) => {
    const res = await assetService.updateCategory(id, namaBaru);
    if (res && res.success && res.data) {
      const updated = res.data;
      setCategoryObjects(prev => prev.map(c => c.id === id ? updated : c));
      setAvailableCategories(prev => prev.map(name => name === namaLama ? updated.nama_kategori : name));
      setAllAssets(prev => prev.map(asset =>
        asset.category === namaLama
          ? { ...asset, category: updated.nama_kategori, jenis_aset: updated.nama_kategori }
          : asset
      ));
      return updated;
    }
    throw new Error(res?.message || 'Gagal memperbarui kategori.');
  };

  const handleDeleteCategory = async (id, namaKategori) => {
    const res = await assetService.deleteCategory(id);
    if (res && res.success) {
      setCategoryObjects(prev => prev.filter(c => c.id !== id));
      setAvailableCategories(prev => prev.filter(name => name !== namaKategori));
      return true;
    }
    throw new Error(res?.message || 'Gagal menghapus kategori.');
  };

  const handleFormSubmit = async (formData) => {
    if (assetToEdit) {
      // Mode Edit
      try {
        const payload = mapAssetForRequest(formData, assetToEdit.asset_code);
        const responseData = await assetService.updateAsset(assetToEdit.id, payload);

        // Map backend response to frontend format using mapAssetResponse
        const updatedFromBackend = mapAssetResponse(responseData.data);
        
        setAllAssets(prev => prev.map(item => item.id === assetToEdit.id ? updatedFromBackend : item));
      } catch (err) {
        console.error("Backend API error, updating asset failed.", err);
        setStatusModal({ 
          isOpen: true, 
          type: 'error', 
          title: 'Gagal', 
          message: 'Gagal memperbarui data aset di server.' 
        });
        return;
      }
    } else {
      // Mode Tambah
      try {
        const payload = mapAssetForRequest(formData);
        const responseData = await assetService.createAsset(payload);

        if (responseData && responseData.data) {
          const mappedNewAsset = mapAssetResponse(responseData.data);
          setAllAssets(prev => [mappedNewAsset, ...prev]);
        }
      } catch (err) {
        console.error("Backend API error, adding asset failed.", err);
        setStatusModal({ 
          isOpen: true, 
          type: 'error', 
          title: 'Gagal', 
          message: 'Gagal menambahkan aset ke server.' 
        });
        return;
      }
    }

    // Jika ada kategori baru yang tersimpan lewat form aset, sinkronkan daftar kategori
    if (formData.category && !availableCategories.includes(formData.category)) {
      try {
        const categoriesData = await assetService.fetchCategories();
        if (categoriesData && categoriesData.success && categoriesData.data) {
          setAvailableCategories(categoriesData.data.map(c => c.nama_kategori));
          setCategoryObjects(categoriesData.data);
        }
      } catch {
        setAvailableCategories(prev => [...prev, formData.category]);
      }
    }

    // Jika ada ruangan baru yang tersimpan lewat form aset, sinkronkan daftar ruangan
    if (formData.room) {
      const roomExists = availableRooms.some(
        r => String(r.nama_ruangan || r).toLowerCase() === String(formData.room).toLowerCase()
      );
      if (!roomExists) {
        try {
          const roomsData = await assetService.fetchRooms();
          if (roomsData?.success && roomsData?.data) {
            setAvailableRooms(roomsData.data);
          }
        } catch {
          // ignore
        }
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

  const handleNavigateToRepair = (subAsset, parentAsset) => {
    const role = localStorage.getItem('user_role') || 'admin';
    const repairPath = `/${role}/perbaikan`;
    const params = new URLSearchParams({
      prefill_asset_id: parentAsset.id,
      prefill_sub_asset: subAsset.kode_sub_aset,
      auto_open: 'true'
    });
    navigate(`${repairPath}?${params.toString()}`);
  };

  const handleDeleteSubAssetClick = (subAsset, parentAssetId) => {
    setConfirmSubAssetDelete({ isOpen: true, subAsset, parentAssetId });
  };

  const processDeleteSubAsset = async (alasan = '') => {
    const { subAsset, parentAssetId } = confirmSubAssetDelete;
    setConfirmSubAssetDelete({ isOpen: false, subAsset: null, parentAssetId: null });
    if (!subAsset) return;

    try {
      const response = await assetService.deleteSubAsset(subAsset.id, alasan);
      if (response && response.success) {
        setAllAssets(prevAssets => prevAssets.map(asset => {
          if (asset.id === parentAssetId) {
            const currentSubAssets = asset.sub_aset || asset.subAset || asset.sub_assets || [];
            return {
              ...asset,
              quantity: (asset.quantity || asset.jumlah_aset || 0) - 1,
              jumlah_aset: (asset.jumlah_aset || asset.quantity || 0) - 1,
              sub_aset: currentSubAssets.filter(sub => sub.id !== subAsset.id)
            };
          }
          return asset;
        }));
        setStatusModal({ isOpen: true, type: 'success', title: 'Berhasil', message: `Unit ${subAsset.kode_sub_aset} berhasil dihapus dan alasan penghapusan telah dicatat di Riwayat Aset.` });
      }
    } catch (err) {
      console.error("Gagal menghapus unit:", err);
      const errorMsg = err.response?.data?.message || 'Gagal menghapus unit dari server.';
      setStatusModal({ isOpen: true, type: 'error', title: 'Gagal', message: errorMsg });
    }
  };

  // Cetak PDF langsung untuk ruangan tertentu (dari tampilan Per Ruangan)
  const handlePrintRoom = async (unitName, roomName, groupKey) => {
    const key = groupKey || `${unitName || ''}-${roomName || ''}`;
    setPrintingRoomKey(key);
    try {
      const params = { periode: 'all' };
      if (unitName && unitName !== '-' && unitName !== 'Tidak Diketahui') {
        params.id_unit = unitName;
      }
      if (roomName && roomName !== '-' && roomName !== 'Tidak Diketahui') {
        params.id_ruangan = roomName;
      }
      const blobData = await assetService.exportAssetPDF(params);
      const safeUnit = (unitName || 'Unit').replace(/[^a-zA-Z0-9_-]/g, '_');
      const safeRoom = (roomName || 'Ruangan').replace(/[^a-zA-Z0-9_-]/g, '_');
      const timeStamp = new Date().toISOString().slice(0, 10);
      assetService.triggerBlobDownload(blobData, `Daftar_Aset_${safeUnit}_${safeRoom}_${timeStamp}.pdf`);
    } catch (err) {
      console.error('Gagal mencetak daftar aset ruangan:', err);
      const msg = err.response?.data?.message || 'Gagal mencetak PDF daftar aset ruangan.';
      setStatusModal({ isOpen: true, type: 'error', title: 'Gagal Mencetak', message: msg });
    } finally {
      setPrintingRoomKey(null);
    }
  };

  return {
    searchQuery,
    setSearchQuery,
    selectedFilterField,
    setSelectedFilterField,
    selectedUnitFilter,
    setSelectedUnitFilter,
    selectedRoomFilter,
    setSelectedRoomFilter,
    adminUnit,
    printingRoomKey,
    handlePrintRoom,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    isLoading,
    isFormOpen,
    setIsFormOpen,
    assetToEdit,
    isDetailOpen,
    setIsDetailOpen,
    assetToView,
    statusModal,
    setStatusModal,
    confirmModal,
    setConfirmModal,
    allAssets,
    filteredAssets,
    availableUnits,
    availableCategories,
    categoryObjects,
    availableRooms,
    handleAddCategory,
    handleUpdateCategory,
    handleDeleteCategory,
    viewMode,
    setViewMode,
    paginatedAssets,
    hasMore,
    handleView,
    handleEdit,
    handleDeleteClick,
    processDelete,
    handleTambahAsetClick,
    handleFormSubmit,
    handleNavigateToRepair,
    activeRepairCodes,
    inProgressRepairCodes,
    handleDeleteSubAssetClick,
    processDeleteSubAsset,
    confirmSubAssetDelete,
    setConfirmSubAssetDelete,
    refreshAssets
  };
}
