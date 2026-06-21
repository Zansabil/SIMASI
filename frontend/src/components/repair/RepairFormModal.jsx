import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import StatusModal from '../ui/StatusModal';
import { API_BASE_URL } from '../../config';

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
  
  // Data aset dari database
  const [assets, setAssets] = useState([]);
  const [selectedAssetId, setSelectedAssetId] = useState('');
  
  const [formLocation, setFormLocation] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formImage, setFormImage] = useState('');
  const [formImageFile, setFormImageFile] = useState(null); 
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const modalBodyRef = useRef(null);

  const [isRestoreDraftOpen, setIsRestoreDraftOpen] = useState(false);
  const [tempDraft, setTempDraft] = useState(null);
  const [hasCheckedDraft, setHasCheckedDraft] = useState(false);

  // Load daftar aset saat komponen di-mount atau dibuka
  useEffect(() => {
    if (isOpen) {
      setSubmitError('');
      const fetchAssets = async () => {
        try {
          const token = localStorage.getItem('auth_token');
          const response = await axios.get(`${API_BASE_URL}/api/aset`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (response.data && response.data.data) {
            setAssets(response.data.data);
          }
        } catch (error) {
          console.error("Gagal mengambil daftar aset:", error);
        }
      };
      fetchAssets();

      // Reset form
      setFormReporter('');
      setFormUnit('');
      const today = new Date().toISOString().split('T')[0];
      setFormDate(today);
      setSelectedAssetId('');
      setFormLocation('');
      setFormDesc('');
      setFormImage('');
      setFormImageFile(null);
    }
  }, [isOpen]);

  // Efek untuk menyesuaikan tinggi modal secara dinamis saat ukuran layar berubah (resize/rotate)
  useEffect(() => {
    const handleResize = () => {
      if (modalBodyRef.current) {
        modalBodyRef.current.style.maxHeight = `${window.innerHeight * 0.65}px`;
      }
    };

    if (isOpen) {
      window.addEventListener('resize', handleResize);
      handleResize(); // Panggil sekali saat pertama kali dibuka
    }

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [isOpen]);

  // Effect untuk mendeteksi draf saat modal dibuka
  useEffect(() => {
    if (isOpen) {
      const savedDraft = localStorage.getItem('simasi_draft_repair');
      if (savedDraft) {
        try {
          const parsed = JSON.parse(savedDraft);
          setTempDraft(parsed);
          setIsRestoreDraftOpen(true);
          setHasCheckedDraft(false); // Blokir autosave dulu
        } catch (e) {
          console.error("Gagal membaca draf repair:", e);
          localStorage.removeItem('simasi_draft_repair');
          setHasCheckedDraft(true);
        }
      } else {
        setHasCheckedDraft(true); // Tidak ada draf, aktifkan autosave
      }
    } else {
      setHasCheckedDraft(false);
      setTempDraft(null);
      setIsRestoreDraftOpen(false);
    }
  }, [isOpen]);

  // Effect untuk menyimpan draf secara otomatis saat field berubah
  useEffect(() => {
    if (isOpen && hasCheckedDraft) {
      const draftData = {
        formReporter,
        formUnit,
        formDate,
        selectedAssetId,
        formLocation,
        formDesc
      };
      
      const hasContent = formReporter || formUnit || formDate || selectedAssetId || formLocation || formDesc;
      
      if (hasContent) {
        localStorage.setItem('simasi_draft_repair', JSON.stringify(draftData));
      } else {
        localStorage.removeItem('simasi_draft_repair');
      }
    }
  }, [isOpen, hasCheckedDraft, formReporter, formUnit, formDate, selectedAssetId, formLocation, formDesc]);

  const handleRestoreDraft = () => {
    if (tempDraft) {
      setFormReporter(tempDraft.formReporter || '');
      setFormUnit(tempDraft.formUnit || '');
      setFormDate(tempDraft.formDate || '');
      setSelectedAssetId(tempDraft.selectedAssetId || '');
      setFormLocation(tempDraft.formLocation || '');
      setFormDesc(tempDraft.formDesc || '');
    }
    setIsRestoreDraftOpen(false);
    setTempDraft(null);
    setHasCheckedDraft(true); // Aktifkan autosave
  };

  const handleDiscardDraft = () => {
    localStorage.removeItem('simasi_draft_repair');
    setIsRestoreDraftOpen(false);
    setTempDraft(null);
    setHasCheckedDraft(true); // Aktifkan autosave
  };

  // Handle ketika aset dipilih
  const handleAssetSelect = (e) => {
    const id = e.target.value;
    setSelectedAssetId(id);
    
    // Auto fill lokasi berdasarkan aset yang dipilih
    const selectedAsset = assets.find(a => a.id.toString() === id.toString());
    if (selectedAsset) {
      setFormLocation(selectedAsset.lokasi_aset || '');
    } else {
      setFormLocation('');
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      
      // Validasi format file
      if (!allowedTypes.includes(file.type)) {
        alert('Format file tidak didukung. Harap gunakan format PNG, JPG, atau JPEG.');
        e.target.value = ''; // Reset input
        return;
      }

      // Validasi ukuran file maksimal 5MB
      if (file.size > 5 * 1024 * 1024) {
        alert('Ukuran file maksimal adalah 5MB.');
        e.target.value = ''; // Reset input
        return;
      }

      setFormImageFile(file); // Simpan file aslinya
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');

    const todayStr = new Date().toISOString().split('T')[0];
    if (formDate > todayStr) {
      setSubmitError('Tanggal pengaduan tidak boleh di masa depan.');
      setIsSubmitting(false);
      return;
    }
    
    // Cari nama aset untuk dikirim sebagai text (opsional untuk display fallback)
    const selectedAsset = assets.find(a => a.id.toString() === selectedAssetId.toString());
    const assetName = selectedAsset ? selectedAsset.nama_aset : 'Aset Tidak Diketahui';

    try {
      await onSubmit({
        reporter_name: formReporter,
        unit: formUnit,
        date: formDate,
        asset_id: selectedAssetId,
        asset_name: assetName,
        location: formLocation,
        description: formDesc,
        image_file: formImageFile, 
        image_path: formImage 
      });
      localStorage.removeItem('simasi_draft_repair');
    } catch (err) {
      console.error("Error submitting repair form:", err);
      const errMsg = err.response?.data?.message || err.message || 'Gagal menyimpan data laporan. Silakan coba lagi.';
      setSubmitError(errMsg);
    } finally {
      setIsSubmitting(false);
    }
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

        <form ref={modalBodyRef} onSubmit={handleSubmit} className="modal-form-body">
          <p className="required-note">
            Field bertanda <span className="req-star">*</span> wajib diisi
          </p>
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
              <option value="" disabled hidden>Pilih Unit Usaha</option>
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
              max={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div className="modal-form-group">
            <label className="modal-form-label">Pilih Aset <span className="req-star">*</span></label>
            <select 
              className="modal-form-select"
              required
              value={selectedAssetId}
              onChange={handleAssetSelect}
            >
              <option value="" disabled hidden>-- Pilih Aset yang Rusak --</option>
              {assets.map(aset => (
                <option key={aset.id} value={aset.id}>
                  {aset.kode_inventaris} - {aset.nama_aset}
                </option>
              ))}
            </select>
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

          {submitError && <div className="alert-error">{submitError}</div>}

          {/* Action Buttons */}
          <div className="modal-action-buttons-wrapper">
            <button type="button" className="modal-btn-batal" onClick={onClose}>
              Batal
            </button>
            <button type="submit" className="modal-btn-tambahan" style={{ backgroundColor: '#f59e0b' }} disabled={isSubmitting}>
              {isSubmitting ? 'Mengirim...' : 'Laporkan'}
            </button>
          </div>
        </form>
      </div>

      <StatusModal
        isOpen={isRestoreDraftOpen}
        type="confirm"
        title="Temukan Draf Sebelumnya"
        message="Kami menemukan draf pengisian Laporan Kerusakan yang belum selesai. Apakah Anda ingin memulihkan draf tersebut?"
        confirmText="Ya, Pulihkan"
        cancelText="Mulai Baru"
        onConfirm={handleRestoreDraft}
        onCancel={handleDiscardDraft}
      />
    </div>
  );
}
