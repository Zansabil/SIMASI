import { useState, useEffect } from 'react';
import axios from 'axios';
import { DEFAULT_UNITS, DEFAULT_CATEGORIES } from '../config';
import { mapAssetListResponse, mapAssetForRequest, mapAssetResponse } from '../utils/assetMapper';
import * as assetService from '../services/assetService';

const FILTER_FIELD_MAP = {
  all: 'all',
  name: 'nama_aset',
  code: 'kode_inventaris',
  location: 'lokasi_aset'
};

export default function useAssetList() {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [selectedFilterField, setSelectedFilterField] = useState('all'); // all, name, code, location
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isLoading, setIsLoading] = useState(true);

  // Modal display states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [assetToEdit, setAssetToEdit] = useState(null);
  
  // Detail Modal state
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [assetToView, setAssetToView] = useState(null);
  
  // Status & Confirm Modals
  const [statusModal, setStatusModal] = useState({ isOpen: false, type: 'success', title: '', message: '' });
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, asset: null });

  const [allAssets, setAllAssets] = useState([]);
  const [availableUnits, setAvailableUnits] = useState(DEFAULT_UNITS);
  const [availableCategories, setAvailableCategories] = useState(DEFAULT_CATEGORIES);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'grouped'

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
  }, [debouncedSearchQuery, selectedFilterField]);

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
  }, []);

  // Reset Halaman ke 1 saat melakukan pencarian atau mengganti kategori filter
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchQuery, selectedFilterField]);

  // Derived state for client-side pagination
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedAssets = allAssets.slice(startIndex, startIndex + itemsPerPage);
  const hasMore = allAssets.length > currentPage * itemsPerPage;

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
      await assetService.deleteAsset(asset.id);
      setAllAssets(prev => prev.filter(item => item.id !== asset.id));
      setStatusModal({ isOpen: true, type: 'success', title: 'Berhasil', message: 'Aset berhasil dihapus.' });
    } catch (err) {
      console.error("Backend API error, deleting asset failed.", err);
      setStatusModal({ isOpen: true, type: 'error', title: 'Gagal', message: 'Gagal menghapus aset dari server.' });
    }
  };

  const handleTambahAsetClick = () => {
    setAssetToEdit(null);
    setIsFormOpen(true);
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

    setIsFormOpen(false);
    setStatusModal({ 
      isOpen: true, 
      type: 'success', 
      title: 'Terima Kasih', 
      message: assetToEdit ? "Aset berhasil diperbarui" : "Aset berhasil ditambahkan" 
    });
  };

  return {
    searchQuery,
    setSearchQuery,
    selectedFilterField,
    setSelectedFilterField,
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
    availableUnits,
    availableCategories,
    availableRooms,
    viewMode,
    setViewMode,
    paginatedAssets,
    hasMore,
    handleView,
    handleEdit,
    handleDeleteClick,
    processDelete,
    handleTambahAsetClick,
    handleFormSubmit
  };
}
