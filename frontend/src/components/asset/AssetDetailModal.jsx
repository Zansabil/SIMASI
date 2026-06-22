
import { API_BASE_URL } from '../../config';
import './AssetDetailModal.css';
import { formatPrice } from '../../utils/currency';
import { FiX } from 'react-icons/fi';
import { formatDate } from '../../utils/formatDate';
import { resolveImageUrl, DEFAULT_ASSET_IMAGE } from '../../utils/imageHelper';

// Menggunakan helper formatPrice dari utils/currency

export default function AssetDetailModal({ isOpen, onClose, asset }) {
  if (!isOpen || !asset) return null;

  const resolvedImage = resolveImageUrl(asset.image_path);

  return (
    <div className="detail-modal-overlay">
      <div className="detail-modal-container">
        {/* Header */}
        <div className="detail-modal-header">
          <h3 className="detail-modal-title">Informasi Detail Aset</h3>
          <button className="detail-modal-close-btn" onClick={onClose} aria-label="Tutup">
            <FiX size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="detail-modal-body">
          <div className="detail-modal-image-wrapper">
            <img 
              src={resolvedImage} 
              alt={asset.name} 
              className="detail-modal-image"
              onError={(e) => { e.target.src = DEFAULT_ASSET_IMAGE; }}
            />
          </div>

          <div className="detail-modal-info">
            <div className="detail-info-group full-width">
              <span className="detail-info-label">Nama Barang</span>
              <span className="detail-info-value highlight-value">{asset.name}</span>
            </div>

            <div className="detail-info-row">
              <div className="detail-info-group">
                <span className="detail-info-label">Kode Inventaris</span>
                <span className="detail-info-value badge-value">{asset.asset_code}</span>
              </div>
              <div className="detail-info-group">
                <span className="detail-info-label">Kondisi Aset</span>
                <span className={`detail-info-value condition-badge condition-${asset.condition?.toLowerCase().replace(/\s+/g, '-')}`}>
                  {asset.condition || '-'}
                </span>
              </div>
            </div>

            <div className="detail-info-row">
              <div className="detail-info-group">
                <span className="detail-info-label">Lokasi Penempatan</span>
                <span className="detail-info-value">{asset.location || '-'}</span>
              </div>
              <div className="detail-info-group">
                <span className="detail-info-label">Jumlah Unit</span>
                <span className="detail-info-value">{asset.quantity || 0} Unit</span>
              </div>
            </div>

            <div className="detail-info-row">
              <div className="detail-info-group">
                <span className="detail-info-label">Tanggal Perolehan</span>
                <span className="detail-info-value">{formatDate(asset.purchase_date)}</span>
              </div>
              <div className="detail-info-group">
                <span className="detail-info-label">Sumber Dana</span>
                <span className="detail-info-value">{asset.source_of_funds || '-'}</span>
              </div>
            </div>

            <div className="detail-info-group full-width price-group">
              <span className="detail-info-label">Estimasi Harga Per Unit</span>
              <span className="detail-info-value price-value">{formatPrice(asset.price)}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="detail-modal-footer">
          <button className="detail-btn-close" onClick={onClose}>
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
