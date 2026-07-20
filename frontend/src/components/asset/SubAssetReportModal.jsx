import React, { useState, useEffect, useRef } from 'react';
import { FiX, FiUploadCloud, FiAlertCircle } from 'react-icons/fi';
import './SubAssetReportModal.css';

export default function SubAssetReportModal({ isOpen, onClose, onSubmit, selectedSubAsset, parentAsset }) {
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setDescription('');
      setImageFile(null);
      setImagePreview('');
      setIsSubmitting(false);
    }
  }, [isOpen]);

  if (!isOpen || !selectedSubAsset || !parentAsset) return null;

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) {
      alert("Mohon isi deskripsi kerusakan.");
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = {
        asset_id: parentAsset.id,
        asset_name: parentAsset.name,
        location: selectedSubAsset.ruangan?.nama_ruangan || parentAsset.location || '-',
        description: `(Unit: ${selectedSubAsset.kode_sub_aset})\n${description}`,
        image_file: imageFile
      };
      
      await onSubmit(formData);
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="sub-asset-report-overlay">
      <div className="sub-asset-report-modal">
        <div className="report-modal-header">
          <div className="header-title-group">
            <FiAlertCircle size={24} color="#f59e0b" />
            <h2>Laporkan Kerusakan Unit</h2>
          </div>
          <button className="btn-close-modal" onClick={onClose}>
            <FiX size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="report-modal-body">
          <div className="unit-info-banner">
            <div className="unit-info-row">
              <span className="info-label">Aset Induk:</span>
              <span className="info-value">{parentAsset.name}</span>
            </div>
            <div className="unit-info-row">
              <span className="info-label">Kode Unit:</span>
              <span className="info-value font-mono">{selectedSubAsset.kode_sub_aset}</span>
            </div>
            <div className="unit-info-row">
              <span className="info-label">Ruangan:</span>
              <span className="info-value">{selectedSubAsset.ruangan?.nama_ruangan || '-'}</span>
            </div>
          </div>

          <div className="form-group">
            <label>Deskripsi Kerusakan <span className="required-star">*</span></label>
            <textarea
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Jelaskan secara detail kerusakan yang terjadi pada unit ini..."
              rows={4}
              className="report-textarea"
            />
          </div>

          <div className="form-group">
            <label>Lampiran Foto (Opsional)</label>
            <div 
              className={`upload-zone ${imagePreview ? 'has-image' : ''}`}
              onClick={() => !imagePreview && fileInputRef.current?.click()}
            >
              {imagePreview ? (
                <div className="preview-container">
                  <img src={imagePreview} alt="Preview Kerusakan" className="preview-image" />
                  <button type="button" className="btn-remove-image" onClick={removeImage}>
                    Ganti Foto
                  </button>
                </div>
              ) : (
                <div className="upload-placeholder">
                  <FiUploadCloud size={32} color="#94a3b8" />
                  <p>Klik untuk mengunggah foto kerusakan</p>
                  <span className="upload-hint">Maksimal 2MB (JPG, PNG)</span>
                </div>
              )}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/jpeg, image/png, image/jpg"
                style={{ display: 'none' }}
              />
            </div>
          </div>

          <div className="report-modal-footer">
            <button type="button" className="btn-cancel-report" onClick={onClose} disabled={isSubmitting}>
              Batal
            </button>
            <button type="submit" className="btn-submit-report" disabled={isSubmitting}>
              {isSubmitting ? 'Mengirim...' : 'Kirim Laporan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
