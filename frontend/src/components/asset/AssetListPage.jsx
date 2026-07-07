import React from 'react';
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
import useAssetList from '../../hooks/useAssetList';
import './AssetListPage.css';

export default function AssetListPage({ role, hasWriteAccess, currentPath }) {
  const {
    // 🔍 Pencarian & Kategori Filter
    searchQuery, setSearchQuery,
    selectedFilterField, setSelectedFilterField,

    // 📄 Halaman (Pagination) & Mode Tampilan
    currentPage, setCurrentPage,
    itemsPerPage, setItemsPerPage,
    viewMode, setViewMode,
    isLoading, hasMore,

    // 📦 Data Aset & Pilihan Dropdown
    allAssets, paginatedAssets,
    availableUnits, availableCategories, availableRooms,

    // 📝 Popup Modal Form & Aksi Simpan
    isFormOpen, setIsFormOpen, assetToEdit, handleFormSubmit,
    isDetailOpen, setIsDetailOpen, assetToView,

    // ⚠️ Modal Notifikasi & Konfirmasi Hapus
    statusModal, setStatusModal,
    confirmModal, setConfirmModal,

    // ⚡ Tombol Aksi Tambah, Detail, Edit, Hapus
    handleView, handleEdit, handleDeleteClick, processDelete, handleTambahAsetClick
  } = useAssetList();

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
              assets={paginatedAssets}
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
              hasMore={hasMore}
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
