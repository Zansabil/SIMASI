
import { API_BASE_URL } from '../../config';
import './AssetTable.css';
import { formatPrice } from '../../utils/currency';

export default function AssetTable({ assets, isLoading, onView, onEdit, onDelete, showActions = true }) {
  // SVGs for Actions
  const EyeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  );

  const PencilIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9"/>
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>
    </svg>
  );

  const TrashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18"/>
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
    </svg>
  );

  // Menggunakan helper formatPrice dari utils/currency

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
              <td colSpan={showActions ? 11 : 10} className="text-center py-8" style={{ color: '#64748b', fontWeight: '500' }}>Memuat data aset...</td>
            </tr>
          ) : assets.length === 0 ? (
            <tr>
              <td colSpan={showActions ? 11 : 10} className="text-center py-8" style={{ color: '#64748b', fontWeight: '500' }}>Tidak ada data aset yang ditemukan.</td>
            </tr>
          ) : (
            assets.map((asset, index) => (
              <tr key={asset.id || index}>
                <td className="col-no text-center">{index + 1}.</td>
                <td className="col-name">
                  <div className="asset-name-text">{asset.name}</div>
                  <div className="asset-code-sub show-on-mobile">{asset.asset_code}</div>
                </td>
                <td className="col-code hide-on-mobile">{asset.asset_code}</td>
                <td className="col-unit hide-on-mobile text-center">{asset.unit || '-'}</td>
                <td className="col-location hide-on-mobile">{asset.room || '-'}</td>
                <td className="col-qty text-center">{asset.quantity}</td>
                <td className="col-condition hide-on-mobile">
                  {asset.condition.charAt(0).toUpperCase() + asset.condition.slice(1)}
                </td>
                <td className="col-source hide-on-mobile">{asset.source_of_funds || 'Dana Yayasan'}</td>
                <td className="col-price hide-on-mobile">{formatPrice(asset.price)}</td>
                <td className="col-photo">
                  <div className="asset-thumbnail-container">
                    <img 
                      src={asset.image_path ? (asset.image_path.startsWith('http') || asset.image_path.startsWith('data:') ? asset.image_path : `${API_BASE_URL}/storage/${asset.image_path}`) : 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=100&fit=crop'} 
                      alt={asset.name || asset.nama_aset} 
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
                        <EyeIcon />
                      </button>
                      <button 
                        className="action-btn btn-edit" 
                        onClick={() => onEdit(asset)} 
                        title="Edit Aset"
                        aria-label="Edit Aset"
                      >
                        <PencilIcon />
                      </button>
                      <button 
                        className="action-btn btn-delete" 
                        onClick={() => onDelete(asset)} 
                        title="Hapus Aset"
                        aria-label="Hapus Aset"
                      >
                        <TrashIcon />
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
