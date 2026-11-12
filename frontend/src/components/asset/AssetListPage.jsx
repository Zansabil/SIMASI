import React, { useState } from 'react';
import AssetTable from './AssetTable';
import Pagination from './Pagination';
import DashboardLayout from '../layout/DashboardLayout';
import StatusModal from '../ui/StatusModal';
import AssetFormModal from './AssetFormModal';
import AssetDetailModal from './AssetDetailModal';
import ExportPdfModal from './ExportPdfModal';
import ImportExcelModal from './ImportExcelModal';
import PageHeader from '../ui/PageHeader';
import SearchBar from '../ui/SearchBar';
import FilterSelect from '../ui/FilterSelect';
import { FiPlus, FiGrid, FiList, FiPrinter, FiUploadCloud } from 'react-icons/fi';
import GroupedAssetView from './GroupedAssetView';
import useAssetList from '../../hooks/useAssetList';
import './AssetListPage.css';

export default function AssetListPage({ role, hasWriteAccess, currentPath }) {
  const {
    // 🔍 Pencarian & Kategori Filter
    searchQuery, setSearchQuery,
    selectedFilterField, setSelectedFilterField,
    selectedUnitFilter, setSelectedUnitFilter,
    selectedRoomFilter, setSelectedRoomFilter,
    adminUnit,
    printingRoomKey,
    handlePrintRoom,

    // 📄 Halaman (Pagination) & Mode Tampilan
    currentPage, setCurrentPage,
    itemsPerPage, setItemsPerPage,
    viewMode, setViewMode,
    isLoading, hasMore,

    // 📦 Data Aset & Pilihan Dropdown
    allAssets, filteredAssets, paginatedAssets,
    availableUnits, availableCategories, categoryObjects, availableRooms,
    handleAddCategory, handleUpdateCategory, handleDeleteCategory,

    // 📝 Popup Modal Form & Aksi Simpan
    isFormOpen, setIsFormOpen, assetToEdit, handleFormSubmit,
    isDetailOpen, setIsDetailOpen, assetToView,

    // ⚠️ Modal Notifikasi & Konfirmasi Hapus
    statusModal, setStatusModal,
    confirmModal, setConfirmModal,

    // ⚡ Tombol Aksi Tambah, Detail, Edit, Hapus
    handleView,
    handleEdit,
    handleDeleteClick,
    processDelete,
    handleTambahAsetClick,
    handleNavigateToRepair,
    activeRepairCodes,
    inProgressRepairCodes,
    handleDeleteSubAssetClick,
    processDeleteSubAsset,
    confirmSubAssetDelete,
    setConfirmSubAssetDelete,
    refreshAssets
  } = useAssetList();

  // State untuk Modal Ekspor PDF & Impor Excel
  const [isExportPdfOpen, setIsExportPdfOpen] = useState(false);
  const [isImportExcelOpen, setIsImportExcelOpen] = useState(false);

  // Pilihan filter Unit Pendidikan
  const unitFilterOptions = [
    { value: 'all', label: 'Semua Unit Pendidikan' },
    ...availableUnits.map((u) => {
      const name = u.nama_unit || u;
      return { value: name, label: `Unit ${name}` };
    })
  ];

  // Pilihan filter Ruangan (gabungan master ruangan + ruangan pada data aset yang tampil)
  const roomNamesSet = new Set([
    ...availableRooms.map(r => r.nama_ruangan || r).filter(Boolean),
    ...allAssets.map(a => a.location || a.room).filter(r => r && r !== '-')
  ]);
  const roomFilterOptions = [
    { value: 'all', label: 'Semua Ruangan' },
    ...[...roomNamesSet].sort().map(rName => ({ value: rName, label: rName }))
  ];

  // Handler setelah impor Excel berhasil
  const handleImportSuccess = (message) => {
    if (refreshAssets) {
      refreshAssets();
    }
    setStatusModal({
      isOpen: true,
      type: 'success',
      title: 'Impor Berhasil',
      message: message || 'Data aset berhasil diimpor ke sistem.'
    });
  };

  return (
    <DashboardLayout role={role} currentPath={currentPath}>
      <main className="dashboard-body">
        {/* Top Header Section */}
        <PageHeader
          title="Daftar Aset"
          subtitle="Kelola dan pantau seluruh data aset sekolah"
          actions={(
            <div className="asset-header-actions">
              {/* Tombol Ekspor PDF dengan Filter Periode */}
              <button 
                type="button" 
                className="btn-action-pdf"
                onClick={() => setIsExportPdfOpen(true)}
                title="Cetak & Ekspor ke PDF dengan filter rentang waktu"
              >
                <FiPrinter size={16} />
                <span>Ekspor PDF</span>
              </button>

              {/* Tombol Impor Excel (Khusus Hak Akses Tulis) */}
              {hasWriteAccess && (
                <button 
                  type="button" 
                  className="btn-action-excel"
                  onClick={() => setIsImportExcelOpen(true)}
                  title="Impor data aset secara massal dari file Excel"
                >
                  <FiUploadCloud size={17} />
                  <span>Impor Excel</span>
                </button>
              )}

              {/* Tombol Tambah Aset Biasa (Khusus Hak Akses Tulis) */}
              {hasWriteAccess && (
                <button 
                  type="button" 
                  className="btn-tambah-aset"
                  onClick={handleTambahAsetClick}
                >
                  <FiPlus size={18} />
                  <span>Tambah Aset</span>
                </button>
              )}
            </div>
          )}
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

            {adminUnit && (
              <div className="admin-unit-active-badge">
                Unit Tanggung Jawab: <strong>{adminUnit.nama_unit}</strong>
              </div>
            )}
          </div>

          {/* Filter Row: Search & Dropdown Filter Fields */}
          <div className="filter-row">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Cari Barang..."
            />

            {!adminUnit && (
              <FilterSelect
                value={selectedUnitFilter}
                onChange={setSelectedUnitFilter}
                options={unitFilterOptions}
              />
            )}

            <FilterSelect
              value={selectedRoomFilter}
              onChange={setSelectedRoomFilter}
              options={roomFilterOptions}
            />

            <FilterSelect
              value={selectedFilterField}
              onChange={setSelectedFilterField}
              options={[
                { value: 'all', label: 'Semua Kolom' },
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
              onNavigateToRepair={handleNavigateToRepair}
              onDeleteSubAsset={handleDeleteSubAssetClick}
              activeRepairCodes={activeRepairCodes}
              inProgressRepairCodes={inProgressRepairCodes}
            />
            <Pagination
              currentPage={currentPage}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={setItemsPerPage}
              hasMore={hasMore}
              totalPages={Math.ceil(filteredAssets.length / itemsPerPage)}
              totalItems={filteredAssets.length}
            />
          </>
        ) : (
          <GroupedAssetView
            assets={filteredAssets}
            isLoading={isLoading}
            showActions={hasWriteAccess}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDeleteClick}
            onNavigateToRepair={handleNavigateToRepair}
            onDeleteSubAsset={handleDeleteSubAssetClick}
            activeRepairCodes={activeRepairCodes}
            inProgressRepairCodes={inProgressRepairCodes}
            onPrintRoom={handlePrintRoom}
            printingRoomKey={printingRoomKey}
          />
        )}

        {/* MODAL 1: TAMBAH / EDIT ASET FORM (Only for write access roles) */}
        {hasWriteAccess && (
          <AssetFormModal
            isOpen={isFormOpen}
            onClose={() => setIsFormOpen(false)}
            onSubmit={handleFormSubmit}
            assetToEdit={assetToEdit}
            availableUnits={availableUnits}
            adminUnit={adminUnit}
            availableRooms={availableRooms}
            availableCategories={availableCategories}
            categoryObjects={categoryObjects}
            canManageCategories={role === 'admin'}
            onAddCategory={handleAddCategory}
            onUpdateCategory={handleUpdateCategory}
            onDeleteCategory={handleDeleteCategory}
            existingSources={allAssets ? [...new Set(allAssets.map(a => a.source_of_funds).filter(Boolean))] : []}
          />
        )}

        {/* MODAL 2: DETAIL ASET */}
        <AssetDetailModal 
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          asset={assetToView}
        />

        {/* MODAL 3: EKSPOR PDF DENGAN FILTER PERIODE, UNIT & RUANGAN */}
        <ExportPdfModal
          isOpen={isExportPdfOpen}
          onClose={() => setIsExportPdfOpen(false)}
          availableUnits={availableUnits}
          availableRooms={[...roomNamesSet].sort()}
          adminUnit={adminUnit}
          defaultUnit={selectedUnitFilter}
          defaultRoom={selectedRoomFilter}
        />

        {/* MODAL 4: IMPOR DARI EXCEL */}
        {hasWriteAccess && (
          <ImportExcelModal
            isOpen={isImportExcelOpen}
            onClose={() => setIsImportExcelOpen(false)}
            onSuccess={handleImportSuccess}
          />
        )}

        {/* MODAL 5: STATUS NOTIFIKASI */}
        <StatusModal
          isOpen={statusModal.isOpen}
          type={statusModal.type}
          title={statusModal.title}
          message={statusModal.message}
          onConfirm={() => setStatusModal({ ...statusModal, isOpen: false })}
        />

        {/* MODAL 6: KONFIRMASI HAPUS ASET */}
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

        {/* MODAL 7: KONFIRMASI HAPUS SUB-ASET */}
        <StatusModal
          isOpen={confirmSubAssetDelete.isOpen}
          type="confirm"
          title="Konfirmasi Hapus Unit"
          message={`Apakah Anda yakin ingin menghapus unit "${confirmSubAssetDelete.subAsset?.kode_sub_aset}"? Jumlah barang pada aset induk akan otomatis berkurang.`}
          confirmText="Ya, Hapus"
          cancelText="Batal"
          onConfirm={processDeleteSubAsset}
          onCancel={() => setConfirmSubAssetDelete({ isOpen: false, subAsset: null, parentAssetId: null })}
        />
      </main>
    </DashboardLayout>
  );
}
