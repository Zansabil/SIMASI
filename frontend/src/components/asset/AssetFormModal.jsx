import React, { useState, useEffect } from 'react';

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const UploadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

export default function AssetFormModal({
  isOpen,
  onClose,
  onSubmit,
  assetToEdit = null,
  allAssets = []
}) {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [code, setCode] = useState('');
  const [quantity, setQuantity] = useState('');
  const [condition, setCondition] = useState('');
  const [source, setSource] = useState('Dana Yayasan');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState('');

  // Synchronize form states on open or change of assetToEdit
  useEffect(() => {
    if (isOpen) {
      if (assetToEdit) {
        setName(assetToEdit.name || '');
        setLocation(assetToEdit.location || '');
        setPurchaseDate(assetToEdit.purchase_date || '');
        setCode(assetToEdit.asset_code || '');
        setQuantity(assetToEdit.quantity || '');
        setCondition(assetToEdit.condition || '');
        setSource(assetToEdit.source_of_funds || 'Dana Yayasan');
        setPrice(assetToEdit.price || '');
        setImage(assetToEdit.image_path || '');
      } else {
        setName('');
        setLocation('');
        setPurchaseDate('');
        setCode('');
        setQuantity('');
        setCondition('');
        setSource('Dana Yayasan');
        setPrice('');
        setImage('');
      }
    }
  }, [isOpen, assetToEdit]);

  // Auto-generate code for new assets
  useEffect(() => {
    if (assetToEdit) return; // Skip if editing
    if (!location || !purchaseDate) {
      setCode('');
      return;
    }

    const cleanLoc = location.trim().toUpperCase();
    const parts = purchaseDate.split('-'); // [YYYY, MM, DD]
    if (parts.length !== 3) return;
    const yyyy = parts[0];
    const mm = parts[1];
    const dd = parts[2];
    const dateStr = `${dd}${mm}${yyyy}`;

    const prefix = `${cleanLoc}-${dateStr}-`;

    let maxSeq = 0;
    (allAssets || []).forEach(asset => {
      if (asset.asset_code && asset.asset_code.startsWith(prefix)) {
        const seqPart = asset.asset_code.substring(prefix.length);
        const seqNum = parseInt(seqPart, 10);
        if (!isNaN(seqNum) && seqNum > maxSeq) {
          maxSeq = seqNum;
        }
      }
    });

    const nextSeq = String(maxSeq + 1).padStart(4, '0');
    setCode(`${prefix}${nextSeq}`);
  }, [location, purchaseDate, allAssets, assetToEdit]);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitForm = (e) => {
    e.preventDefault();
    onSubmit({
      name,
      location,
      purchaseDate,
      code,
      quantity,
      condition,
      source,
      price,
      image
    });
  };

  const isEditing = !!assetToEdit;

  return (
    <div className="modal-overlay-bg">
      <div className="modal-form-container">
        {/* Modal Header */}
        <div className="modal-header-row">
          <h3 className="modal-header-title">
            {isEditing ? 'Edit Aset' : 'Tambah Aset'}
          </h3>
          <button className="modal-close-btn" onClick={onClose} aria-label="Tutup">
            <CloseIcon />
          </button>
        </div>

        {/* Modal Body / Scrollable Form */}
        <form onSubmit={handleSubmitForm} className="modal-form-body">
          <div className="modal-form-group">
            <label className="modal-form-label">Nama Barang <span className="req-star">*</span></label>
            <input
              type="text"
              className="modal-form-input"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="modal-form-group">
            <label className="modal-form-label">Lokasi Penempatan Barang <span className="req-star">*</span></label>
            <input
              type="text"
              className="modal-form-input"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          <div className="modal-form-group">
            <label className="modal-form-label">Tanggal Pembelian / Perolehan <span className="req-star">*</span></label>
            <input
              type="date"
              className="modal-form-input"
              required
              value={purchaseDate}
              onChange={(e) => setPurchaseDate(e.target.value)}
            />
          </div>

          <div className="modal-form-group">
            <label className="modal-form-label">Kode Barang <span className="req-star">*</span></label>
            <input
              type="text"
              className="modal-form-input"
              required
              readOnly
              value={code}
              placeholder="Otomatis dibuat setelah mengisi lokasi & tanggal"
            />
          </div>

          <div className="modal-form-group">
            <label className="modal-form-label">Jumlah Barang <span className="req-star">*</span></label>
            <input
              type="number"
              className="modal-form-input"
              required
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </div>

          <div className="modal-form-group">
            <label className="modal-form-label">Kondisi Barang <span className="req-star">*</span></label>
            <input
              type="text"
              className="modal-form-input"
              required
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
            />
          </div>

          <div className="modal-form-group">
            <label className="modal-form-label">Sumber Dana <span className="req-star">*</span></label>
            <input
              type="text"
              className="modal-form-input"
              required
              value={source}
              onChange={(e) => setSource(e.target.value)}
            />
          </div>

          <div className="modal-form-group">
            <label className="modal-form-label">Harga Barang <span className="req-star">*</span></label>
            <input
              type="text"
              className="modal-form-input"
              required
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Rp.2000000"
            />
          </div>

          <div className="modal-form-group">
            <label className="modal-form-label">Foto Kondisi Aset <span className="req-star">*</span></label>
            <div className="modal-upload-box-wrapper">
              <input
                type="file"
                id="asset-photo-upload"
                className="hidden-file-input"
                onChange={handleFileChange}
                accept="image/*"
              />
              <label htmlFor="asset-photo-upload" className="modal-upload-label-area">
                {image ? (
                  <img src={image.startsWith('http') ? image : image} alt="Preview" className="upload-preview-thumbnail-img" />
                ) : (
                  <>
                    <UploadIcon />
                    <span className="upload-main-prompt">Klik untuk upload foto atau drag and drop</span>
                    <span className="upload-sub-prompt">PNG, JPG, JPEG (Max. 5MB)</span>
                  </>
                )}
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="modal-action-buttons-wrapper">
            <button type="button" className="modal-btn-batal" onClick={onClose}>
              Batal
            </button>
            <button type="submit" className="modal-btn-tambahan">
              {isEditing ? 'Simpan Perubahan' : 'Tambahkan Aset'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
