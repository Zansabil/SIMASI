import React, { memo, useState } from 'react';
import './AssetTable.css';
import { formatPrice } from '../../utils/currency';
import { resolveImageUrl } from '../../utils/imageHelper';
import { FiEye, FiEdit2, FiTrash2, FiChevronDown, FiChevronRight, FiExternalLink } from 'react-icons/fi';

const BASE_COLUMNS = 11;

const formatCondition = (condition) => {
  if (!condition) return '-';
  return condition.charAt(0).toUpperCase() + condition.slice(1);
};

function AssetTable({ assets = [], isLoading, onView, onEdit, onDelete, showActions = true, onNavigateToRepair, onDeleteSubAsset, activeRepairCodes = [], inProgressRepairCodes = [] }) {
  const [expandedAssetId, setExpandedAssetId] = useState(null);

  const toggleExpand = (id) => {
    setExpandedAssetId(prev => prev === id ? null : id);
  };

  // Normalisasi data aset agar field-fieldnya seragam (kontrak data yang konsisten)
  const normalizedAssets = assets.map(asset => ({
    ...asset,
    name: asset.name ?? asset.nama_aset ?? '-',
    asset_code: asset.asset_code ?? asset.kode_inventaris ?? '-',
    unit: asset.unit ?? asset.lokasi_unit?.nama_unit ?? asset.lokasiUnit?.nama_unit ?? '-',
    location: asset.location ?? asset.ruangan?.nama_ruangan ?? asset.room_name ?? asset.lokasi_aset ?? '-',
    condition: asset.condition ?? asset.kondisi_aset ?? '-',
    quantity: asset.quantity ?? asset.jumlah_aset ?? 0,
    source_of_funds: asset.source_of_funds ?? asset.sumber_dana ?? 'Dana Yayasan',
    price: asset.price ?? asset.harga_aset ?? 0,
    image_path: asset.image_path ?? asset.foto_aset,
    purchase_date: asset.purchase_date ?? asset.tgl_diperoleh ?? null,
    sub_assets: asset.sub_aset ?? asset.subAset ?? []
  }));

  return (
    <div className="table-responsive-wrapper">
      <table className="asset-table-el">
        <thead>
          <tr>
            <th className="col-expand" style={{ width: '40px' }}></th>
            <th className="col-no">No.</th>
            <th className="col-name">Nama Barang</th>
            <th className="col-code hide-on-mobile">Kode Barang</th>
            <th className="col-unit hide-on-mobile">Unit</th>
            <th className="col-location hide-on-mobile">Lokasi Penempatan</th>
            <th className="col-qty">Jumlah<span className="hide-on-mobile"> Barang</span></th>
            <th className="col-condition hide-on-mobile">Kondisi Barang</th>
            <th className="col-source hide-on-mobile">Sumber Dana</th>
            <th className="col-price hide-on-mobile">Harga Barang</th>
            <th className="col-photo">Foto</th>
            {showActions && <th className="col-actions">Aksi</th>}
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan={showActions ? BASE_COLUMNS + 1 : BASE_COLUMNS} className="table-status-message">Memuat data aset...</td>
            </tr>
          ) : normalizedAssets.length === 0 ? (
            <tr>
              <td colSpan={showActions ? BASE_COLUMNS + 1 : BASE_COLUMNS} className="table-status-message">Tidak ada data aset yang ditemukan.</td>
            </tr>
          ) : (
            normalizedAssets.map((asset, index) => {
              const isExpanded = expandedAssetId === asset.id;
              const hasSubAssets = asset.sub_assets && asset.sub_assets.length > 0;
              return (
                <React.Fragment key={asset.id}>
                  <tr className={isExpanded ? 'main-row expanded' : 'main-row'}>
                    <td className="col-expand text-center">
                      {hasSubAssets && (
                        <button 
                          type="button"
                          className="btn-toggle-expand"
                          onClick={() => toggleExpand(asset.id)}
                          title={isExpanded ? "Sembunyikan detail" : "Tampilkan detail"}
                        >
                          {isExpanded ? <FiChevronDown size={18} /> : <FiChevronRight size={18} />}
                        </button>
                      )}
                    </td>
                    <td className="col-no text-center">{index + 1}.</td>
                    <td className="col-name">
                      <div className="asset-name-text">{asset.name}</div>
                      <div className="asset-code-sub show-on-mobile">{asset.asset_code}</div>
                    </td>
                    <td className="col-code hide-on-mobile">{asset.asset_code}</td>
                    <td className="col-unit hide-on-mobile text-center">{asset.unit || '-'}</td>
                    <td className="col-location hide-on-mobile">{asset.location}</td>
                    <td className="col-qty text-center">{asset.quantity ?? '-'}</td>
                    <td className="col-condition hide-on-mobile">
                      {formatCondition(asset.condition)}
                    </td>
                    <td className="col-source hide-on-mobile">{asset.source_of_funds}</td>
                    <td className="col-price hide-on-mobile">{formatPrice(asset.price)}</td>
                    <td className="col-photo">
                      <div className="asset-thumbnail-container">
                        <img 
                          src={resolveImageUrl(asset.image_path)} 
                          alt={asset.name} 
                          className="asset-thumbnail-img"
                        />
                      </div>
                    </td>
                    {showActions && (
                      <td className="col-actions">
                        <div className="actions-btn-group">
                          <button 
                            className="action-btn btn-view" 
                            onClick={() => onView(asset)} 
                            title="Lihat Detail"
                            aria-label="Lihat Detail"
                          >
                            <FiEye size={16} color="#3b82f6" strokeWidth={2.5} />
                          </button>
                          <button 
                            className="action-btn btn-edit" 
                            onClick={() => onEdit(asset)} 
                            title="Edit Aset"
                            aria-label="Edit Aset"
                          >
                            <FiEdit2 size={16} color="#f59e0b" strokeWidth={2.5} />
                          </button>
                          <button 
                            className="action-btn btn-delete" 
                            onClick={() => onDelete(asset)} 
                            title="Hapus Aset"
                            aria-label="Hapus Aset"
                          >
                            <FiTrash2 size={16} color="#ef4444" strokeWidth={2.5} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>

                  {isExpanded && hasSubAssets && (
                    <tr className="sub-asset-row-tr">
                      <td colSpan={showActions ? BASE_COLUMNS + 1 : BASE_COLUMNS} className="sub-asset-td">
                        <div className="sub-asset-wrapper">
                          <div className="sub-asset-header">Daftar Unit Spesifik ({asset.name})</div>
                          <div className="sub-asset-table-wrapper">
                            <table className="sub-asset-table-el">
                              <thead>
                                <tr>
                                  <th style={{ width: '60px' }}>No.</th>
                                  <th>Kode Unit Barang</th>
                                  <th>Kondisi Unit</th>
                                  <th>Lokasi Ruangan</th>
                                  <th>Status Penggunaan</th>
                                  {showActions && <th style={{ width: '60px' }}>Aksi</th>}
                                </tr>
                              </thead>
                              <tbody>
                                {asset.sub_assets.map((sub, sIdx) => {
                                  const isCurrentlyUnderRepair = activeRepairCodes.includes(sub.kode_sub_aset);
                                  const isRepairInProgress = inProgressRepairCodes.includes(sub.kode_sub_aset);
                                  const isRusak = (sub.kondisi_aset || '').toLowerCase() === 'rusak';
                                  const displayStatus = (isRepairInProgress || isRusak) ? 'Sedang Diperbaiki' : (sub.status_penggunaan || 'Tersedia');
                                   const displayCondition = isRepairInProgress ? 'Rusak' : (sub.kondisi_aset || 'Baik');
                                  
                                  return (
                                  <tr key={sub.id}>
                                    <td className="text-center">{sIdx + 1}.</td>
                                    <td className="font-mono text-bold">{sub.kode_sub_aset}</td>
                                    <td>
                                      <span className={`badge-cond badge-${(displayCondition).toLowerCase().replace(/\s+/g, '-')}`}>
                                        {formatCondition(displayCondition)}
                                      </span>
                                    </td>
                                    <td>{sub.ruangan?.nama_ruangan || '-'}</td>
                                    <td>
                                      <span className={`badge-status status-${displayStatus.toLowerCase().replace(/\s+/g, '-')}`}>
                                        {displayStatus}
                                      </span>
                                    </td>
                                    {showActions && (
                                      <td className="text-center">
                                        <button 
                                          type="button" 
                                          disabled={isCurrentlyUnderRepair || isRepairInProgress}
                                          style={{ 
                                            background: 'none', 
                                            border: 'none', 
                                            cursor: (isCurrentlyUnderRepair || isRepairInProgress) ? 'not-allowed' : 'pointer', 
                                            color: (isCurrentlyUnderRepair || isRepairInProgress) ? '#cbd5e1' : '#ef4444', 
                                            padding: '2px', 
                                            display: 'inline-flex', 
                                            alignItems: 'center', 
                                            justifyContent: 'center', 
                                            borderRadius: '4px',
                                            opacity: (isCurrentlyUnderRepair || isRepairInProgress) ? 0.5 : 1
                                          }}
                                          onClick={() => {
                                            if (!(isCurrentlyUnderRepair || isRepairInProgress) && onDeleteSubAsset) {
                                              onDeleteSubAsset(sub, asset.id);
                                            }
                                          }}
                                          title={(isCurrentlyUnderRepair || isRepairInProgress) ? "Tidak dapat menghapus unit yang sedang diperbaiki" : "Hapus Unit"}
                                          onMouseOver={(e) => { if (!(isCurrentlyUnderRepair || isRepairInProgress)) e.currentTarget.style.color = '#dc2626'; }}
                                          onMouseOut={(e) => { if (!(isCurrentlyUnderRepair || isRepairInProgress)) e.currentTarget.style.color = '#ef4444'; }}
                                        >
                                          <FiTrash2 size={14} />
                                        </button>
                                      </td>
                                    )}
                                  </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

export default memo(AssetTable);
