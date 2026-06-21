import React, { useState, useEffect, useRef } from 'react';
import { FiX, FiUpload } from 'react-icons/fi';
import StatusModal from '../ui/StatusModal';

const formatToRupiah = (value) => {
  if (value === null || value === undefined || value === '') return '';
  const cleanNumber = value.toString().replace(/[^0-9]/g, '');
  if (!cleanNumber) return '';
  return 'Rp ' + Number(cleanNumber).toLocaleString('id-ID');
};

export default function AssetFormModal({
  isOpen,
  onClose,
  onSubmit,
  assetToEdit = null,
  availableUnits = ['TK', 'SD', 'SMP', 'SMA', 'MA'], // Default fallback
  availableCategories = ['Elektronik', 'Mebel / Furnitur', 'Alat Tulis Kantor / Perlengkapan', 'Umum'], // Default fallback
  existingSources = []
}) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [unit, setUnit] = useState('');
  const [room, setRoom] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [code, setCode] = useState('');
  const [quantity, setQuantity] = useState('');
  const [condition, setCondition] = useState('');
  const [source, setSource] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmCloseOpen, setIsConfirmCloseOpen] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const fileReaderRef = useRef(null);
  const modalBodyRef = useRef(null);

  const [isRestoreDraftOpen, setIsRestoreDraftOpen] = useState(false);
  const [tempDraft, setTempDraft] = useState(null);
  const [hasCheckedDraft, setHasCheckedDraft] = useState(false);

  const defaultSources = ['Dana Yayasan', 'Dana BOS'];
  const combinedSources = [...new Set([...defaultSources, ...(existingSources || [])])];

  const handleFieldChange = (field, setter, value) => {
    setter(value);
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Synchronize form states on open or change of assetToEdit
  useEffect(() => {
    if (isOpen) {
      setIsConfirmCloseOpen(false);
      setErrors({});
      setSubmitError('');
      if (assetToEdit) {
        setName(assetToEdit.name || '');
        
        if (assetToEdit.unit || assetToEdit.room) {
          setUnit(assetToEdit.unit || '');
          setRoom(assetToEdit.room || '');
        } else {
          const locStr = assetToEdit.location || '';
          if (locStr.includes(' - ')) {
            const parts = locStr.split(' - ');
            setUnit(parts[0] || '');
            setRoom(parts.slice(1).join(' - ') || '');
          } else {
            // Backward compatibility for old records
            setUnit(locStr);
            setRoom('');
          }
        }
        
        setCategory(assetToEdit.category || 'Umum');
        setPurchaseDate(assetToEdit.purchase_date || '');
        setCode(assetToEdit.asset_code || '');
        setQuantity(assetToEdit.quantity || '');
        setCondition(assetToEdit.condition || '');
        setSource(assetToEdit.source_of_funds || 'Dana Yayasan');
        setPrice(formatToRupiah(assetToEdit.price));
        setImage(assetToEdit.image_path || '');
      } else {
        setName('');
        setUnit('');
        setRoom('');
        setCategory('');
        setPurchaseDate('');
        setCode('');
        setQuantity('');
        setCondition('');
        setSource('');
        setPrice('');
        setImage('');
      }
    }
  }, [isOpen, assetToEdit]);

  // Auto-generate code for new assets was moved to backend to prevent race conditions.

  // Cleanup FileReader on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      if (fileReaderRef.current && fileReaderRef.current.readyState === 1) {
        fileReaderRef.current.abort();
      }
    };
  }, []);

  if (!isOpen) return null;

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
        e.target.value = ''; // Reset input agar user bisa memilih ulang file lain
        return;
      }

      const reader = new FileReader();
      fileReaderRef.current = reader;
      reader.onloadend = () => {
        setImage(reader.result);
        if (errors.image) {
          setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors.image;
            return newErrors;
          });
        }
      };
      reader.onerror = () => {
        alert('Gagal membaca file');
      };
      reader.readAsDataURL(file);
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!name.trim()) newErrors.name = 'Nama barang wajib diisi';
    if (!unit) newErrors.unit = 'Unit wajib dipilih';
    if (!category) newErrors.category = 'Kategori barang wajib dipilih';
    if (!room.trim()) newErrors.room = 'Lokasi penempatan barang wajib diisi';
    if (!purchaseDate) {
      newErrors.purchaseDate = 'Tanggal pembelian wajib diisi';
    } else {
      const todayStr = new Date().toISOString().split('T')[0];
      if (purchaseDate > todayStr) {
        newErrors.purchaseDate = 'Tanggal pembelian tidak boleh di masa depan';
      }
    }
    if (!quantity) {
      newErrors.quantity = 'Jumlah barang wajib diisi';
    } else if (Number(quantity) <= 0) {
      newErrors.quantity = 'Jumlah barang harus lebih dari 0';
    }
    if (!condition) {
      newErrors.condition = 'Kondisi barang wajib dipilih';
    }
    if (!source) {
      newErrors.source = 'Sumber dana wajib dipilih';
    }
    if (!price) {
      newErrors.price = 'Harga barang wajib diisi';
    } else {
      const cleanPrice = Number(price.replace(/\D/g, ''));
      if (cleanPrice <= 0) {
        newErrors.price = 'Harga barang harus lebih dari 0';
      }
    }
    if (!image) {
      newErrors.image = 'Foto kondisi aset wajib diunggah';
    }

    setErrors(newErrors);

    const errorKeys = Object.keys(newErrors);
    if (errorKeys.length > 0) {
      const firstErrorKey = errorKeys[0];
      const errorElement = document.getElementById(`asset-${firstErrorKey}`);
      if (errorElement) {
        errorElement.focus();
      }
    }

    return errorKeys.length === 0;
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const combinedLocation = unit && room ? `${unit} - ${room}` : (unit || room);
    setIsSubmitting(true);
    setSubmitError('');
    try {
      await onSubmit({
        name,
        unit,
        room,
        category,
        location: combinedLocation,
        purchaseDate,
        code,
        quantity,
        condition,
        source,
        price,
        image
      });
      localStorage.removeItem('simasi_draft_asset');
    } catch (err) {
      console.error("Error submitting form: ", err);
      const errMsg = err.response?.data?.message || err.message || 'Gagal menyimpan data aset. Silakan coba lagi.';
      setSubmitError(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const checkIsDirty = () => {
    if (assetToEdit) {
      // Edit Mode
      const origName = assetToEdit.name || '';
      
      let origUnit = '';
      let origRoom = '';
      if (assetToEdit.unit || assetToEdit.room) {
        origUnit = assetToEdit.unit || '';
        origRoom = assetToEdit.room || '';
      } else {
        const locStr = assetToEdit.location || '';
        if (locStr.includes(' - ')) {
          const parts = locStr.split(' - ');
          origUnit = parts[0] || '';
          origRoom = parts.slice(1).join(' - ') || '';
        } else {
          origUnit = locStr;
          origRoom = '';
        }
      }
      
      const origCategory = assetToEdit.category || 'Umum';
      const origPurchaseDate = assetToEdit.purchase_date || '';
      const origQuantity = assetToEdit.quantity || '';
      const origCondition = assetToEdit.condition || '';
      const origSource = assetToEdit.source_of_funds || 'Dana Yayasan';
      const origPrice = formatToRupiah(assetToEdit.price);
      const origImage = assetToEdit.image_path || '';

      const isNameDiff = name !== origName;
      const isUnitDiff = unit !== origUnit;
      const isRoomDiff = room !== origRoom;
      const isCategoryDiff = category !== origCategory;
      const isPurchaseDateDiff = purchaseDate !== origPurchaseDate;
      const isQuantityDiff = quantity.toString() !== origQuantity.toString();
      const isConditionDiff = (condition ? condition.toLowerCase() : '') !== (origCondition ? origCondition.toLowerCase() : '');
      const isSourceDiff = source !== origSource;
      const isPriceDiff = price !== origPrice;
      const isImageDiff = image !== origImage;

      return (
        isNameDiff ||
        isUnitDiff ||
        isRoomDiff ||
        isCategoryDiff ||
        isPurchaseDateDiff ||
        isQuantityDiff ||
        isConditionDiff ||
        isSourceDiff ||
        isPriceDiff ||
        isImageDiff
      );
    } else {
      // Create Mode
      return (
        name !== '' ||
        unit !== '' ||
        room !== '' ||
        category !== '' ||
        purchaseDate !== '' ||
        quantity !== '' ||
        condition !== '' ||
        source !== 'Dana Yayasan' ||
        price !== '' ||
        image !== ''
      );
    }
  };

  const handleCloseWithConfirm = () => {
    if (checkIsDirty()) {
      setIsConfirmCloseOpen(true);
    } else {
      onClose();
    }
  };

  // Keyboard listener untuk tombol Escape agar menutup modal secara aman
  const handleCloseWithConfirmRef = useRef(handleCloseWithConfirm);
  useEffect(() => {
    handleCloseWithConfirmRef.current = handleCloseWithConfirm;
  });

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        handleCloseWithConfirmRef.current();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
    }

    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen]);

  // Efek untuk mengunci scroll halaman belakang (background) saat modal terbuka
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
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

  // Effect untuk mendeteksi draf saat modal dibuka dalam mode Tambah (Create)
  useEffect(() => {
    if (isOpen) {
      if (!assetToEdit) {
        const savedDraft = localStorage.getItem('simasi_draft_asset');
        if (savedDraft) {
          try {
            const parsed = JSON.parse(savedDraft);
            setTempDraft(parsed);
            setIsRestoreDraftOpen(true);
            setHasCheckedDraft(false); // Blokir autosave dulu
          } catch (e) {
            console.error("Gagal membaca draf:", e);
            localStorage.removeItem('simasi_draft_asset');
            setHasCheckedDraft(true);
          }
        } else {
          setHasCheckedDraft(true); // Tidak ada draf, aktifkan autosave
        }
      } else {
        setHasCheckedDraft(false); // Mode Edit tidak menggunakan draf
      }
    } else {
      setHasCheckedDraft(false);
      setTempDraft(null);
      setIsRestoreDraftOpen(false);
    }
  }, [isOpen, assetToEdit]);

  // Effect untuk menyimpan draf secara otomatis saat field berubah
  useEffect(() => {
    if (isOpen && !assetToEdit && hasCheckedDraft) {
      const draftData = {
        name,
        category,
        unit,
        room,
        purchaseDate,
        quantity,
        condition,
        source,
        price
      };
      
      const hasContent = name || category || unit || room || purchaseDate || quantity || condition || source || price;
      
      if (hasContent) {
        localStorage.setItem('simasi_draft_asset', JSON.stringify(draftData));
      } else {
        localStorage.removeItem('simasi_draft_asset');
      }
    }
  }, [isOpen, assetToEdit, hasCheckedDraft, name, category, unit, room, purchaseDate, quantity, condition, source, price]);

  const handleRestoreDraft = () => {
    if (tempDraft) {
      setName(tempDraft.name || '');
      setCategory(tempDraft.category || '');
      setUnit(tempDraft.unit || '');
      setRoom(tempDraft.room || '');
      setPurchaseDate(tempDraft.purchaseDate || '');
      setQuantity(tempDraft.quantity || '');
      setCondition(tempDraft.condition || '');
      setSource(tempDraft.source || '');
      setPrice(tempDraft.price || '');
    }
    setIsRestoreDraftOpen(false);
    setTempDraft(null);
    setHasCheckedDraft(true); // Aktifkan autosave
  };

  const handleDiscardDraft = () => {
    localStorage.removeItem('simasi_draft_asset');
    setIsRestoreDraftOpen(false);
    setTempDraft(null);
    setHasCheckedDraft(true); // Aktifkan autosave
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
          <button className="modal-close-btn" onClick={handleCloseWithConfirm} aria-label="Tutup">
            <FiX size={20} />
          </button>
        </div>

        {/* Modal Body / Scrollable Form */}
        <form ref={modalBodyRef} onSubmit={handleSubmitForm} className="modal-form-body" noValidate>
          <p className="required-note">
            Field bertanda <span className="req-star">*</span> wajib diisi
          </p>
          <div className="modal-form-group">
            <label className="modal-form-label">Nama Barang <span className="req-star">*</span></label>
            <input
              type="text"
              id="asset-name"
              className={`modal-form-input ${errors.name ? 'input-error' : ''}`}
              value={name}
              onChange={(e) => handleFieldChange('name', setName, e.target.value)}
            />
            {errors.name && <span className="error-text">{errors.name}</span>}
          </div>

          <div className="modal-form-group">
            <label className="modal-form-label">Unit <span className="req-star">*</span></label>
            <select
              id="asset-unit"
              className={`modal-form-select ${errors.unit ? 'input-error' : ''}`}
              value={unit}
              onChange={(e) => handleFieldChange('unit', setUnit, e.target.value)}
            >
              <option value="" disabled hidden>Unit</option>
              {availableUnits.map((u, i) => (
                <option key={i} value={u}>{u}</option>
              ))}
            </select>
            {errors.unit && <span className="error-text">{errors.unit}</span>}
          </div>

          <div className="modal-form-group">
            <label className="modal-form-label">Kategori Barang <span className="req-star">*</span></label>
            <select
              id="asset-category"
              className={`modal-form-select ${errors.category ? 'input-error' : ''}`}
              value={category}
              onChange={(e) => handleFieldChange('category', setCategory, e.target.value)}
            >
              <option value="" disabled hidden>Pilih Kategori</option>
              {availableCategories.map((cat, i) => (
                <option key={i} value={cat}>{cat}</option>
              ))}
            </select>
            {errors.category && <span className="error-text">{errors.category}</span>}
          </div>

          <div className="modal-form-group">
            <label className="modal-form-label">Lokasi Penempatan Barang <span className="req-star">*</span></label>
            <input
              type="text"
              id="asset-room"
              className={`modal-form-input ${errors.room ? 'input-error' : ''}`}
              value={room}
              onChange={(e) => handleFieldChange('room', setRoom, e.target.value)}
              placeholder="Contoh: Ruang Tata Usaha"
            />
            {errors.room && <span className="error-text">{errors.room}</span>}
          </div>

          <div className="modal-form-group">
            <label className="modal-form-label">Tanggal Pembelian / Perolehan <span className="req-star">*</span></label>
            <input
              type="date"
              id="asset-purchaseDate"
              className={`modal-form-input ${errors.purchaseDate ? 'input-error' : ''}`}
              value={purchaseDate}
              onChange={(e) => handleFieldChange('purchaseDate', setPurchaseDate, e.target.value)}
              max={new Date().toISOString().split('T')[0]}
            />
            {errors.purchaseDate && <span className="error-text">{errors.purchaseDate}</span>}
          </div>

          <div className="modal-form-group">
            <label className="modal-form-label">Kode Barang <span className="req-star">*</span></label>
            <input
              type="text"
              id="asset-code"
              className="modal-form-input"
              readOnly
              value={isEditing ? code : ''}
              placeholder={isEditing ? '' : 'Dibuat otomatis oleh server setelah disimpan'}
            />
          </div>

          <div className="modal-form-group">
            <label className="modal-form-label">Jumlah Barang <span className="req-star">*</span></label>
            <input
              type="number"
              min="1"
              id="asset-quantity"
              className={`modal-form-input ${errors.quantity ? 'input-error' : ''}`}
              value={quantity}
              onChange={(e) => {
                const val = e.target.value;
                if (val === '' || Number(val) >= 1) {
                  handleFieldChange('quantity', setQuantity, val);
                }
              }}
            />
            {errors.quantity && <span className="error-text">{errors.quantity}</span>}
          </div>

          <div className="modal-form-group">
            <label className="modal-form-label">Kondisi Barang <span className="req-star">*</span></label>
            <select
              id="asset-condition"
              className={`modal-form-select ${errors.condition ? 'input-error' : ''}`}
              value={condition ? condition.toLowerCase() : ''}
              onChange={(e) => handleFieldChange('condition', setCondition, e.target.value)}
            >
              <option value="" disabled hidden>Pilih Kondisi</option>
              <option value="baik">Baik</option>
              <option value="rusak ringan">Rusak Ringan</option>
              <option value="rusak berat">Rusak Berat</option>
            </select>
            {errors.condition && <span className="error-text">{errors.condition}</span>}
          </div>

          <div className="modal-form-group">
            <label className="modal-form-label">Sumber Dana <span className="req-star">*</span></label>
            <input
              type="text"
              id="asset-source"
              className={`modal-form-input ${errors.source ? 'input-error' : ''}`}
              list="sumber-dana-options"
              value={source}
              onChange={(e) => handleFieldChange('source', setSource, e.target.value)}
              placeholder="Pilih atau ketik sumber dana..."
              autoComplete="off"
            />
            <datalist id="sumber-dana-options">
              {combinedSources.map((src, i) => (
                <option key={i} value={src} />
              ))}
            </datalist>
            {errors.source && <span className="error-text">{errors.source}</span>}
          </div>

          <div className="modal-form-group">
            <label className="modal-form-label">Harga Barang <span className="req-star">*</span></label>
            <input
              type="text"
              id="asset-price"
              className={`modal-form-input ${errors.price ? 'input-error' : ''}`}
              value={price}
              onChange={(e) => handleFieldChange('price', setPrice, formatToRupiah(e.target.value))}
              placeholder="Rp 2.000.000"
            />
            {errors.price && <span className="error-text">{errors.price}</span>}
          </div>

          <div className="modal-form-group">
            <label className="modal-form-label">Foto Kondisi Aset <span className="req-star">*</span></label>
            <div className={`modal-upload-box-wrapper ${errors.image ? 'upload-error' : ''}`} id="asset-image-container">
              <input
                type="file"
                id="asset-photo-upload"
                className="hidden-file-input"
                onChange={handleFileChange}
                accept="image/*"
                required={!image}
              />
              <label htmlFor="asset-photo-upload" className="modal-upload-label-area">
                {image ? (
                  <img src={image.startsWith('http') ? image : image} alt="Preview" className="upload-preview-thumbnail-img" />
                ) : (
                  <>
                    <FiUpload size={36} color="#94a3b8" />
                    <span className="upload-main-prompt">Klik untuk upload foto atau drag and drop</span>
                    <span className="upload-sub-prompt">PNG, JPG, JPEG (Max. 5MB)</span>
                  </>
                )}
              </label>
            </div>
            {errors.image && <span className="error-text">{errors.image}</span>}
          </div>

          {submitError && <div className="alert-error">{submitError}</div>}

          {/* Action Buttons */}
          <div className="modal-action-buttons-wrapper">
            <button type="button" className="modal-btn-batal" onClick={handleCloseWithConfirm}>
              Batal
            </button>
            <button type="submit" className="modal-btn-tambahan" disabled={isSubmitting}>
              {isSubmitting ? 'Menyimpan...' : (isEditing ? 'Simpan Perubahan' : 'Tambahkan Aset')}
            </button>
          </div>
        </form>
      </div>

      <StatusModal
        isOpen={isConfirmCloseOpen}
        type="confirm"
        title="Konfirmasi Keluar"
        message="Perubahan data belum disimpan. Yakin ingin keluar?"
        confirmText="Ya, Keluar"
        cancelText="Batal"
        onConfirm={() => {
          setIsConfirmCloseOpen(false);
          onClose();
        }}
        onCancel={() => setIsConfirmCloseOpen(false)}
      />

      <StatusModal
        isOpen={isRestoreDraftOpen}
        type="confirm"
        title="Temukan Draf Sebelumnya"
        message="Kami menemukan draf pengisian formulir yang belum selesai. Apakah Anda ingin memulihkan draf tersebut?"
        confirmText="Ya, Pulihkan"
        cancelText="Mulai Baru"
        onConfirm={handleRestoreDraft}
        onCancel={handleDiscardDraft}
      />
    </div>
  );
}
