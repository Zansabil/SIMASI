import React, { useState, useEffect } from 'react';

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const UploadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="17 8 12 3 7 8"/>
    <line x1="12" y1="3" x2="12" y2="15"/>
  </svg>
);

export default function RepairFormModal({ isOpen, onClose, onSubmit }) {
  const [formReporter, setFormReporter] = useState('');
  const [formUnit, setFormUnit] = useState('');
  const [formDate, setFormDate] = useState('');
  const [formAssetName, setFormAssetName] = useState('');
  const [formLocation, setFormLocation] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formImage, setFormImage] = useState('');

  // Reset or initialize form states when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormReporter('');
      setFormUnit('');
      const today = new Date().toISOString().split('T')[0];
      setFormDate(today);
      setFormAssetName('');
      setFormLocation('');
      setFormDesc('');
      setFormImage('');
    }
  }, [isOpen]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      reporter_name: formReporter,
      unit: formUnit,
      date: formDate,
      asset_name: formAssetName,
      location: formLocation,
      description: formDesc,
      image_path: formImage
    });
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay-bg">
      <div className="modal-form-container">
        <div className="modal-header-row">
          <h3 className="modal-header-title">Laporkan Kerusakan</h3>
          <button className="modal-close-btn" onClick={onClose} aria-label="Tutup">
            <CloseIcon />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form-body">
          <div className="modal-form-group">
            <label className="modal-form-label">Nama Pelapor <span className="req-star">*</span></label>
            <input 
              type="text" 
              className="modal-form-input" 
              required
              value={formReporter}
              onChange={(e) => setFormReporter(e.target.value)}
              placeholder="Masukkan nama pelapor"
            />
          </div>

          <div className="modal-form-group">
            <label className="modal-form-label">Unit Usaha <span className="req-star">*</span></label>
            <select 
              className="modal-form-select"
              required
              value={formUnit}
              onChange={(e) => setFormUnit(e.target.value)}
            >
              <option value="">Pilih Unit Usaha</option>
              <option value="SMA">SMA</option>
              <option value="MA">MA</option>
              <option value="SMP">SMP</option>
              <option value="SD">SD</option>
              <option value="TK">TK</option>
              <option value="Yayasan">Yayasan</option>
            </select>
          </div>

          <div className="modal-form-group">
            <label className="modal-form-label">Tanggal Pengaduan <span className="req-star">*</span></label>
            <input 
              type="date" 
              className="modal-form-input" 
              required
              value={formDate}
              onChange={(e) => setFormDate(e.target.value)}
            />
          </div>

          <div className="modal-form-group">
            <label className="modal-form-label">Nama Aset <span className="req-star">*</span></label>
            <input 
              type="text" 
              className="modal-form-input" 
              required
              value={formAssetName}
              onChange={(e) => setFormAssetName(e.target.value)}
              placeholder="Masukkan nama aset yang rusak"
            />
          </div>

          <div className="modal-form-group">
            <label className="modal-form-label">Lokasi Aset <span className="req-star">*</span></label>
            <input 
              type="text" 
              className="modal-form-input" 
              required
              value={formLocation}
              onChange={(e) => setFormLocation(e.target.value)}
              placeholder="Contoh: Ruang Kelas 4A"
            />
          </div>

          <div className="modal-form-group">
            <label className="modal-form-label">Deskripsi Perbaikan <span className="req-star">*</span></label>
            <textarea 
              className="modal-form-input" 
              style={{ minHeight: '80px', resize: 'vertical' }}
              required
              value={formDesc}
              onChange={(e) => setFormDesc(e.target.value)}
              placeholder="Tuliskan kendala atau jenis kerusakan aset..."
            />
          </div>

          <div className="modal-form-group">
            <label className="modal-form-label">Foto Kerusakan <span className="req-star">*</span></label>
            <div className="modal-upload-box-wrapper">
              <input 
                type="file" 
                id="repair-photo-upload" 
                className="hidden-file-input" 
                onChange={handleFileChange}
                accept="image/*"
                required={!formImage}
              />
              <label htmlFor="repair-photo-upload" className="modal-upload-label-area">
                {formImage ? (
                  <img src={formImage} alt="Preview" className="upload-preview-thumbnail-img" />
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
            <button type="submit" className="modal-btn-tambahan" style={{ backgroundColor: '#f59e0b' }}>
              Laporkan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
