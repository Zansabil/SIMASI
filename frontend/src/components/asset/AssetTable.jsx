import React, { memo, useState } from 'react';
import './AssetTable.css';
import { formatPrice } from '../../utils/currency';
import { resolveImageUrl } from '../../utils/imageHelper';
import { FiEye, FiEdit2, FiTrash2, FiChevronDown, FiChevronRight, FiAlertTriangle } from 'react-icons/fi';

const BASE_COLUMNS = 11;

const formatCondition = (condition) => {
  if (!condition) return '-';
  return condition.charAt(0).toUpperCase() + condition.slice(1);
};

function AssetTable({ assets = [], isLoading, onView, onEdit, onDelete, showActions = true, onUpdateSubAssetCondition, onReportDamage, activeRepairCodes = [], inProgressRepairCodes = [] }) {
  const [expandedAssetId, setExpandedAssetId] = useState(null);
  const [editingSubAssetId, setEditingSubAssetId] = useState(null);
  const [editingCondition, setEditingCondition] = useState('');

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
                                </tr>
                              </thead>
                              <tbody>
                                {asset.sub_assets.map((sub, sIdx) => {
                                  const isCurrentlyUnderRepair = activeRepairCodes.includes(sub.kode_sub_aset);
                                  const isRepairInProgress = inProgressRepairCodes.includes(sub.kode_sub_aset);
                                  const displayStatus = isRepairInProgress ? 'Sedang Diperbaiki' : (sub.status_penggunaan || 'Tersedia');
                                  
                                  return (
                                  <tr key={sub.id}>
                                    <td className="text-center">{sIdx + 1}.</td>
                                    <td className="font-mono text-bold">{sub.kode_sub_aset}</td>
                                    <td>
                                      {editingSubAssetId === sub.id ? (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                          <select 
                                            value={editingCondition} 
                                            onChange={(e) => setEditingCondition(e.target.value)}
                                            style={{ minWidth: '120px', padding: '4px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                                          >
                                            <option value="Baik">Baik</option>
                                            <option value="Rusak ringan">Rusak ringan</option>
                                            <option value="Rusak berat">Rusak berat</option>
                                          </select>
                                          <button 
                                            type="button"
                                            onClick={() => {
                                              if (onUpdateSubAssetCondition) {
                                                onUpdateSubAssetCondition(sub.id, editingCondition, asset.id);
                                              }
                                              setEditingSubAssetId(null);
                                            }}
                                            style={{ background: '#10b981', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: '500' }}
                                          >Simpan</button>
                                          <button 
                                            type="button"
                                            onClick={() => setEditingSubAssetId(null)}
                                            style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: '500' }}
                                          >Batal</button>
                                        </div>
                                      ) : (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                          <span className={`badge-cond badge-${(sub.kondisi_aset || '').toLowerCase().replace(/\s+/g, '-')}`}>
                                            {formatCondition(sub.kondisi_aset)}
                                          </span>
                                          {(() => {
                                            const conditionLower = (sub.kondisi_aset || '').toLowerCase();
                                            const isConditionGood = conditionLower === 'baik' || conditionLower === '';
                                            
                                            const disableReportBtn = isConditionGood || isCurrentlyUnderRepair;
                                            const disableEditBtn = isRepairInProgress;
                                            
                                            let reportTooltip = "Laporkan Kerusakan";
                                            if (isCurrentlyUnderRepair) {
                                              reportTooltip = "Unit ini sedang dalam proses perbaikan/menunggu perbaikan";
                                            } else if (isConditionGood) {
                                              reportTooltip = "Ubah status kondisi menjadi rusak terlebih dahulu";
                                            }

                                            return (
                                            <>
                                              <button 
                                                type="button" 
                                                disabled={disableEditBtn}
                                                style={{ 
                                                  background: 'none', 
                                                  border: 'none', 
                                                  cursor: disableEditBtn ? 'not-allowed' : 'pointer', 
                                                  color: disableEditBtn ? '#cbd5e1' : '#64748b', 
                                                  padding: '2px', 
                                                  display: 'flex', 
                                                  alignItems: 'center', 
                                                  justifyContent: 'center', 
                                                  borderRadius: '4px',
                                                  opacity: disableEditBtn ? 0.5 : 1
                                                }}
                                                onClick={() => {
                                                  if (!disableEditBtn) {
                                                    setEditingSubAssetId(sub.id);
                                                    setEditingCondition(sub.kondisi_aset || 'Baik');
                                                  }
                                                }}
                                                title={disableEditBtn ? "Tidak dapat mengubah kondisi saat unit sedang diperbaiki" : "Edit Kondisi Unit"}
                                                onMouseOver={(e) => { if (!disableEditBtn) e.currentTarget.style.color = '#3b82f6'; }}
                                                onMouseOut={(e) => { if (!disableEditBtn) e.currentTarget.style.color = '#64748b'; }}
                                              >
                                                <FiEdit2 size={14} />
                                              </button>
                                              <button 
                                                type="button" 
                                                disabled={disableReportBtn}
                                                style={{ 
                                                  background: 'none', 
                                                  border: 'none', 
                                                  cursor: disableReportBtn ? 'not-allowed' : 'pointer', 
                                                  color: disableReportBtn ? '#cbd5e1' : '#64748b', 
                                                  padding: '2px', 
                                                  display: 'flex', 
                                                  alignItems: 'center', 
                                                  justifyContent: 'center', 
                                                  borderRadius: '4px',
                                                  opacity: disableReportBtn ? 0.5 : 1
                                                }}
                                                onClick={() => {
                                                  if (!disableReportBtn && onReportDamage) {
                                                    onReportDamage(sub, asset);
                                                  }
                                                }}
                                                title={reportTooltip}
                                                onMouseOver={(e) => { if (!disableReportBtn) e.currentTarget.style.color = '#f59e0b'; }}
                                                onMouseOut={(e) => { if (!disableReportBtn) e.currentTarget.style.color = '#64748b'; }}
                                              >
                                                <FiAlertTriangle size={14} />
                                              </button>
                                            </>
                                            );
                                          })()}
                                        </div>
                                      )}
                                    </td>
                                    <td>{sub.ruangan?.nama_ruangan || '-'}</td>
                                    <td>
                                      <span className={`badge-status status-${displayStatus.toLowerCase().replace(/\s+/g, '-')}`}>
                                        {displayStatus}
                                      </span>
                                    </td>
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
