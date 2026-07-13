import React, { memo } from 'react';
import './AssetTable.css';
import { formatPrice } from '../../utils/currency';
import { resolveImageUrl } from '../../utils/imageHelper';
import { FiEye, FiEdit2, FiTrash2 } from 'react-icons/fi';

const BASE_COLUMNS = 10;

const formatCondition = (condition) => {
  if (!condition) return '-';
  return condition.charAt(0).toUpperCase() + condition.slice(1);
};

function AssetTable({ assets = [], isLoading, onView, onEdit, onDelete, showActions = true }) {
  // Normalisasi data aset agar field-fieldnya seragam (kontrak data yang konsisten)
  const normalizedAssets = assets.map(asset => ({
    ...asset,
    name: asset.name ?? asset.nama_aset ?? '-',
    asset_code: asset.asset_code ?? asset.kode_inventaris ?? '-',
    location: asset.location ?? asset.room_name ?? asset.lokasi_aset ?? '-',
    condition: asset.condition ?? asset.kondisi_aset ?? '-',
    quantity: asset.quantity ?? asset.jumlah_aset ?? 0,
    source_of_funds: asset.source_of_funds ?? asset.sumber_dana ?? 'Dana Yayasan',
    price: asset.price ?? asset.harga_aset ?? 0,
    image_path: asset.image_path ?? asset.foto_aset
  }));

  return (
    <div className="table-responsive-wrapper">
      <table className="asset-table-el">
        <thead>
          <tr>
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
            normalizedAssets.map((asset, index) => (
              <tr key={asset.id}>
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
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default memo(AssetTable);
