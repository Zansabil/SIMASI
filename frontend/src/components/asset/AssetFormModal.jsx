import React, { useState, useEffect, useRef } from 'react';
import { FiX, FiUpload } from 'react-icons/fi';

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
  allAssets = [],
  availableUnits = ['TK', 'SD', 'SMP', 'SMA', 'MA'], // Default fallback
  availableCategories = ['Elektronik', 'Mebel / Furnitur', 'Alat Tulis Kantor / Perlengkapan', 'Umum'] // Default fallback
}) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [unit, setUnit] = useState('');
  const [room, setRoom] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [code, setCode] = useState('');
  const [quantity, setQuantity] = useState('');
  const [condition, setCondition] = useState('');
  const [source, setSource] = useState('Dana Yayasan');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileReaderRef = useRef(null);

  // Synchronize form states on open or change of assetToEdit
  useEffect(() => {
    if (isOpen) {
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
        setSource('Dana Yayasan');
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
      };
      reader.onerror = () => {
        alert('Gagal membaca file');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    const combinedLocation = unit && room ? `${unit} - ${room}` : (unit || room);
    setIsSubmitting(true);
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
    } catch (err) {
      console.error("Error submitting form: ", err);
    } finally {
      setIsSubmitting(false);
    }
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
            <FiX size={20} />
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
            <label className="modal-form-label">Unit <span className="req-star">*</span></label>
            <select
              className="modal-form-select"
              required
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
            >
              <option value="" disabled hidden>Unit</option>
              {availableUnits.map((u, i) => (
                <option key={i} value={u}>{u}</option>
              ))}
            </select>
          </div>

          <div className="modal-form-group">
            <label className="modal-form-label">Kategori Barang <span className="req-star">*</span></label>
            <select
              className="modal-form-select"
              required
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="" disabled hidden>Pilih Kategori</option>
              {availableCategories.map((cat, i) => (
                <option key={i} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="modal-form-group">
            <label className="modal-form-label">Lokasi Penempatan Barang <span className="req-star">*</span></label>
            <input
              type="text"
              className="modal-form-input"
              required
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              placeholder="Contoh: Ruang Tata Usaha"
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
              className="modal-form-input"
              required
              value={quantity}
              onChange={(e) => {
                const val = e.target.value;
                if (val === '' || Number(val) >= 1) {
                  setQuantity(val);
                }
              }}
            />
          </div>

          <div className="modal-form-group">
            <label className="modal-form-label">Kondisi Barang <span className="req-star">*</span></label>
            <select
              className="modal-form-select"
              required
              value={condition ? condition.toLowerCase() : ''}
              onChange={(e) => setCondition(e.target.value)}
            >
              <option value="" disabled hidden>Pilih Kondisi</option>
              <option value="baik">Baik</option>
              <option value="rusak ringan">Rusak Ringan</option>
              <option value="rusak berat">Rusak Berat</option>
            </select>
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
              onChange={(e) => setPrice(formatToRupiah(e.target.value))}
              placeholder="Rp 2.000.000"
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
                    <FiUpload size={36} color="#94a3b8" />
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
            <button type="submit" className="modal-btn-tambahan" disabled={isSubmitting}>
              {isSubmitting ? 'Menyimpan...' : (isEditing ? 'Simpan Perubahan' : 'Tambahkan Aset')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
