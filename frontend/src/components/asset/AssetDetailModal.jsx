
import { API_BASE_URL } from '../../config';
import './AssetDetailModal.css';
import { formatPrice } from '../../utils/currency';

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

// Menggunakan helper formatPrice dari utils/currency

export default function AssetDetailModal({ isOpen, onClose, asset }) {
  if (!isOpen || !asset) return null;

  const defaultImage = 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&fit=crop';
  
  let resolvedImage = defaultImage;
  if (asset.image_path) {
    if (asset.image_path.startsWith('http') || asset.image_path.startsWith('data:')) {
      resolvedImage = asset.image_path;
    } else {
      resolvedImage = `${API_BASE_URL}/storage/${asset.image_path}`;
    }
  }

  return (
    <div className="detail-modal-overlay">
      <div className="detail-modal-container">
        {/* Header */}
        <div className="detail-modal-header">
          <h3 className="detail-modal-title">Informasi Detail Aset</h3>
          <button className="detail-modal-close-btn" onClick={onClose} aria-label="Tutup">
            <CloseIcon />
          </button>
        </div>

        {/* Content */}
        <div className="detail-modal-body">
          <div className="detail-modal-image-wrapper">
            <img 
              src={resolvedImage} 
              alt={asset.name} 
              className="detail-modal-image"
              onError={(e) => { e.target.src = defaultImage; }}
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
                <span className={`detail-info-value condition-badge condition-${asset.condition?.toLowerCase()}`}>
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
