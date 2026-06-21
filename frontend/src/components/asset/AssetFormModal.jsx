import { useState, useEffect, useRef, useCallback } from 'react';
import { FiX } from 'react-icons/fi';
import StatusModal from '../ui/StatusModal';
import ImageUploader from '../ui/ImageUploader';
import { useFormDraft } from '../../hooks/useFormDraft';
import { parseLocation } from '../../utils/locationHelper';
import { useForm } from 'react-hook-form';
import { formatToRupiah } from '../../utils/currency';

export default function AssetFormModal({
  isOpen,
  onClose,
  onSubmit,
  assetToEdit = null,
  availableUnits = ['TK', 'SD', 'SMP', 'SMA', 'MA'], // Pilihan Unit default jika tidak dikirim dari parent
  availableCategories = ['Elektronik', 'Mebel / Furnitur', 'Alat Tulis Kantor / Perlengkapan', 'Umum'], // Pilihan Kategori default
  existingSources = [] // Daftar sumber dana unik yang diambil dari data aset yang ada
}) {
  // --- STATE LOKAL ---
  // State untuk melacak apakah formulir sedang dalam proses pengiriman ke server
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State untuk melacak apakah dialog konfirmasi keluar (saat data belum disimpan) sedang terbuka
  const [isConfirmCloseOpen, setIsConfirmCloseOpen] = useState(false);

  // State untuk menyimpan pesan kesalahan yang dikirimkan oleh API Laravel
  const [submitError, setSubmitError] = useState('');

  // Ref untuk mengakses elemen DOM body modal guna menyesuaikan tingginya secara dinamis
  const modalBodyRef = useRef(null);

  // Status apakah modal saat ini dalam mode Edit (jika assetToEdit terisi) atau Tambah Baru
  const isEditing = !!assetToEdit;

  // --- INITIALISASI REACT HOOK FORM ---
  // RHF mengontrol seluruh state input form secara terpusat tanpa render berlebih
  const {
    register,            // Mendaftarkan elemen input ke dalam sistem RHF
    handleSubmit,        // Wrapper pengiriman form untuk validasi sebelum submit
    formState: { errors, isDirty }, // Mengambil errors validasi dan status kebersihan form (apakah ada perubahan data)
    setValue,            // Mengubah nilai field RHF secara programatik (digunakan untuk uploader gambar & format rupiah)
    watch,               // Memantau perubahan nilai field form secara real-time
    reset                // Mengatur ulang seluruh isi form (reset ke kosong atau muat data edit)
  } = useForm({
    defaultValues: {
      name: '',
      category: '',
      unit: '',
      room: '',
      purchaseDate: '',
      code: '',
      quantity: '',
      condition: '',
      source: '',
      price: '',
      image: ''
    }
  });

  // Memantau seluruh nilai form untuk dikirimkan ke fitur penyimpanan draf otomatis
  // eslint-disable-next-line react-hooks/incompatible-library
  const watchedValues = watch();
  
  // Objek data draf yang akan disimpan ke LocalStorage (tidak menyimpan file/gambar karena ukurannya terlalu besar)
  const draftFields = {
    name: watchedValues.name || '',
    category: watchedValues.category || '',
    unit: watchedValues.unit || '',
    room: watchedValues.room || '',
    purchaseDate: watchedValues.purchaseDate || '',
    quantity: watchedValues.quantity || '',
    condition: watchedValues.condition || '',
    source: watchedValues.source || '',
    price: watchedValues.price || ''
  };

  // --- INTEGRASI HOOK DRAF FORM (AUTO-SAVE) ---
  // Menyimpan draf formulir secara otomatis saat ada perubahan input, dan menawarkan restorasi data draf ketika membuka form baru
  const {
    isRestoreDraftOpen,  // State apakah dialog penawaran pemulihan draf aktif
    handleRestoreDraft,  // Fungsi untuk memulihkan data draf ke dalam form
    handleDiscardDraft,  // Fungsi untuk membuang draf yang lama
    clearDraft           // Fungsi untuk menghapus draf dari LocalStorage setelah sukses submit
  } = useFormDraft(
    'simasi_draft_asset',
    isOpen && !isEditing, // Hanya aktifkan penyimpanan otomatis jika form terbuka dan dalam mode TAMBAH BARU
    draftFields,
    (draft) => {
      // Callback ketika pengguna menekan "Ya, Pulihkan"
      reset({
        name: draft.name || '',
        category: draft.category || '',
        unit: draft.unit || '',
        room: draft.room || '',
        purchaseDate: draft.purchaseDate || '',
        code: '',
        quantity: draft.quantity || '',
        condition: draft.condition || '',
        source: draft.source || '',
        price: draft.price || '',
        image: ''
      });
    }
  );

  // --- OPSI DATALIST SUMBER DANA ---
  // Menggabungkan pilihan sumber dana bawaan dengan data dinamis yang sudah ada dari database agar tidak duplikat
  const defaultSources = ['Dana Yayasan', 'Dana BOS'];
  const combinedSources = [...new Set([...defaultSources, ...(existingSources || [])])];

  // --- REGISTRASI FIELD KUSTOM ---
  // ImageUploader bukan input HTML biasa, jadi kita mendaftarkannya secara manual ke RHF
  useEffect(() => {
    register('image', {
      required: !isEditing ? 'Foto kondisi aset wajib diunggah' : false // Wajib diisi hanya saat tambah aset baru
    });
  }, [register, isEditing]);

  // --- HELPER LOAD DATA EDIT ---
  // Memuat data aset yang ingin diedit ke dalam form RHF saat modal dibuka
  const loadEditData = useCallback((asset) => {
    if (!asset) return;
    // Memecah field lokasi gabungan database lama (misal: "Unit - Ruangan") menggunakan utility parseLocation
    const { unit: parsedUnit, room: parsedRoom } = parseLocation(asset);
    reset({
      name: asset.name || '',
      category: asset.category || 'Umum',
      unit: parsedUnit,
      room: parsedRoom,
      purchaseDate: asset.purchase_date || '',
      code: asset.asset_code || '',
      quantity: asset.quantity || '',
      condition: asset.condition || '',
      source: asset.source_of_funds || '',
      price: formatToRupiah(asset.price),
      image: asset.image_path || ''
    });
  }, [reset]);

  // --- HELPER RESET FORM KE KOSONG ---
  // Mengosongkan kembali isi form saat menutup form atau membuka form tambah baru
  const resetForm = useCallback(() => {
    reset({
      name: '',
      category: '',
      unit: '',
      room: '',
      purchaseDate: '',
      code: '',
      quantity: '',
      condition: '',
      source: '',
      price: '',
      image: ''
    });
  }, [reset]);

  // --- LIFECYCLE MONITOR MODAL OPEN / CHANGE ---
  // Sinkronisasi state form setiap kali modal dibuka/ditutup atau aset yang diedit berganti
  useEffect(() => {
    if (isOpen) {
      setIsConfirmCloseOpen(false); // Pastikan konfirmasi keluar tertutup
      setSubmitError('');           // Bersihkan error pengiriman sebelumnya
      if (assetToEdit) {
        loadEditData(assetToEdit);  // Muat data jika masuk mode Edit
      } else {
        resetForm();                 // Kosongkan form jika masuk mode Tambah
      }
    }
  }, [isOpen, assetToEdit, loadEditData, resetForm]);

  // --- HANDLER SUBMIT FORM ---
  // Memproses data formulir setelah lolos validasi RHF untuk dikirimkan ke API backend Laravel
  const handleSubmitForm = async (data) => {
    // Gabungkan kembali unit dan ruangan menjadi format "Unit - Ruangan" sebelum disimpan
    const combinedLocation = data.unit && data.room ? `${data.unit} - ${data.room}` : (data.unit || data.room);
    setIsSubmitting(true);
    setSubmitError('');
    try {
      await onSubmit({
        name: data.name,
        unit: data.unit,
        room: data.room,
        category: data.category,
        location: combinedLocation,
        purchaseDate: data.purchaseDate,
        code: data.code,
        quantity: data.quantity,
        condition: data.condition,
        source: data.source,
        price: data.price,
        image: data.image
      });
      clearDraft(); // Hapus draf di LocalStorage jika data berhasil disimpan ke database
    } catch (err) {
      console.error("Error submitting form: ", err);
      // Tangkap pesan error dari API Laravel dan tampilkan secara lokal di atas tombol simpan
      const errMsg = err.response?.data?.message || err.message || 'Gagal menyimpan data aset. Silakan coba lagi.';
      setSubmitError(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- HANDLER CLOSE WITH CONFIRM ---
  // Fungsi penutup form modal secara aman dengan mendeteksi status kebersihan form (isDirty)
  const handleCloseWithConfirm = () => {
    if (isDirty) {
      setIsConfirmCloseOpen(true); // Jika ada perubahan data, tampilkan popup konfirmasi keluar
    } else {
      onClose(); // Jika form bersih, langsung tutup modal
    }
  };

  // --- KEYBOARD LISTENER (ESC KEY) ---
  // Pengaman tambahan agar menekan tombol Escape tetap mendeteksi konfirmasi keluar (menggunakan Latest Ref Pattern demi performa)
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

  // --- BACKGROUND SCROLL LOCK ---
  // Mengunci scroll halaman utama di belakang modal saat modal sedang terbuka agar tampilan tidak tergeser
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

  // --- RESPONSIVE MODAL HEIGHT ---
  // Menyesuaikan tinggi maksimal body modal secara dinamis agar tombol tindakan tidak terpotong pada berbagai layar (handphone/landscape)
  useEffect(() => {
    const handleResize = () => {
      if (modalBodyRef.current) {
        modalBodyRef.current.style.maxHeight = `${window.innerHeight * 0.65}px`;
      }
    };

    if (isOpen) {
      window.addEventListener('resize', handleResize);
      handleResize(); // Jalankan fungsi sekali saat modal pertama kali terbuka
    }

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [isOpen]);

  // Jika status modal tidak terbuka, jangan render elemen apa pun ke dalam DOM
  if (!isOpen) return null;

  // --- TEMPLATE RENDER UI ---
  return (
    <div className="modal-overlay-bg">
      <div className="modal-form-container">
        {/* Header Modal */}
        <div className="modal-header-row">
          <h3 className="modal-header-title">
            {isEditing ? 'Edit Aset' : 'Tambah Aset'}
          </h3>
          <button className="modal-close-btn" onClick={handleCloseWithConfirm} aria-label="Tutup">
            <FiX size={20} />
          </button>
        </div>

        {/* Formulir Modal */}
        <form ref={modalBodyRef} onSubmit={handleSubmit(handleSubmitForm)} className="modal-form-body" noValidate>
          <p className="required-note">
            Field bertanda <span className="req-star">*</span> wajib diisi
          </p>

          {/* Input: Nama Barang */}
          <div className="modal-form-group">
            <label className="modal-form-label">Nama Barang <span className="req-star">*</span></label>
            <input
              type="text"
              id="asset-name"
              placeholder="Contoh: Proyektor Epson"
              className={`modal-form-input ${errors.name ? 'input-error' : ''}`}
              {...register('name', { required: 'Nama aset wajib diisi' })}
            />
            {errors.name && <span className="error-text">{errors.name.message}</span>}
          </div>

          {/* Input: Unit */}
          <div className="modal-form-group">
            <label className="modal-form-label">Unit <span className="req-star">*</span></label>
            <select
              id="asset-unit"
              className={`modal-form-select ${errors.unit ? 'input-error' : ''}`}
              {...register('unit', { required: 'Unit wajib diisi' })}
            >
              <option value="" disabled hidden>Unit</option>
              {availableUnits.map((u, i) => (
                <option key={i} value={u}>{u}</option>
              ))}
            </select>
            {errors.unit && <span className="error-text">{errors.unit.message}</span>}
          </div>

          {/* Input: Kategori Barang */}
          <div className="modal-form-group">
            <label className="modal-form-label">Kategori Barang <span className="req-star">*</span></label>
            <select
              id="asset-category"
              className={`modal-form-select ${errors.category ? 'input-error' : ''}`}
              {...register('category', { required: 'Kategori wajib diisi' })}
            >
              <option value="" disabled hidden>Pilih Kategori</option>
              {availableCategories.map((cat, i) => (
                <option key={i} value={cat}>{cat}</option>
              ))}
            </select>
            {errors.category && <span className="error-text">{errors.category.message}</span>}
          </div>

          {/* Input: Ruangan */}
          <div className="modal-form-group">
            <label className="modal-form-label">Lokasi Penempatan Barang <span className="req-star">*</span></label>
            <input
              type="text"
              id="asset-room"
              placeholder="Contoh: Ruang Tata Usaha"
              className={`modal-form-input ${errors.room ? 'input-error' : ''}`}
              {...register('room', { required: 'Ruangan wajib diisi' })}
            />
            {errors.room && <span className="error-text">{errors.room.message}</span>}
          </div>

          {/* Input: Tanggal Pembelian */}
          <div className="modal-form-group">
            <label className="modal-form-label">Tanggal Pembelian / Perolehan <span className="req-star">*</span></label>
            <input
              type="date"
              id="asset-purchaseDate"
              max={new Date().toISOString().split('T')[0]} // Cegah memilih tanggal di masa depan
              className={`modal-form-input ${errors.purchaseDate ? 'input-error' : ''}`}
              {...register('purchaseDate', {
                required: 'Tanggal pembelian wajib diisi',
                validate: (value) => {
                  const today = new Date().toISOString().split('T')[0];
                  return value <= today || 'Tanggal pembelian tidak boleh di masa depan';
                }
              })}
            />
            {errors.purchaseDate && <span className="error-text">{errors.purchaseDate.message}</span>}
          </div>

          {/* Input: Kode Barang (Hanya Tampil Read-Only Saat Edit) */}
          <div className="modal-form-group">
            <label className="modal-form-label">Kode Barang <span className="req-star">*</span></label>
            <input
              type="text"
              id="asset-code"
              className="modal-form-input"
              readOnly
              {...register('code')}
              placeholder={isEditing ? '' : 'Dibuat otomatis oleh server setelah disimpan'}
            />
          </div>

          {/* Input: Jumlah Barang */}
          <div className="modal-form-group">
            <label className="modal-form-label">Jumlah Barang <span className="req-star">*</span></label>
            <input
              type="number"
              min="1"
              id="asset-quantity"
              className={`modal-form-input ${errors.quantity ? 'input-error' : ''}`}
              {...register('quantity', {
                required: 'Jumlah unit wajib diisi',
                validate: (value) => {
                  const num = Number(value);
                  return (num > 0) || 'Jumlah unit harus lebih besar dari 0';
                }
              })}
              onChange={(e) => {
                const val = e.target.value;
                if (val === '' || Number(val) >= 1) {
                  setValue('quantity', val, { shouldValidate: true, shouldDirty: true });
                }
              }}
            />
            {errors.quantity && <span className="error-text">{errors.quantity.message}</span>}
          </div>

          {/* Input: Kondisi */}
          <div className="modal-form-group">
            <label className="modal-form-label">Kondisi Barang <span className="req-star">*</span></label>
            <select
              id="asset-condition"
              className={`modal-form-select ${errors.condition ? 'input-error' : ''}`}
              {...register('condition', { required: 'Kondisi wajib diisi' })}
            >
              <option value="" disabled hidden>Pilih Kondisi</option>
              <option value="baik">Baik</option>
              <option value="rusak ringan">Rusak Ringan</option>
              <option value="rusak berat">Rusak Berat</option>
            </select>
            {errors.condition && <span className="error-text">{errors.condition.message}</span>}
          </div>

          {/* Input: Sumber Dana (Combobox dengan Auto-Suggest) */}
          <div className="modal-form-group">
            <label className="modal-form-label">Sumber Dana <span className="req-star">*</span></label>
            <input
              type="text"
              id="asset-source"
              list="sumber-dana-options"
              placeholder="Pilih atau ketik sumber dana..."
              autoComplete="off"
              className={`modal-form-input ${errors.source ? 'input-error' : ''}`}
              {...register('source', { required: 'Sumber dana wajib diisi' })}
            />
            <datalist id="sumber-dana-options">
              {combinedSources.map((src, i) => (
                <option key={i} value={src} />
              ))}
            </datalist>
            {errors.source && <span className="error-text">{errors.source.message}</span>}
          </div>

          {/* Input: Harga Barang */}
          <div className="modal-form-group">
            <label className="modal-form-label">Harga Barang <span className="req-star">*</span></label>
            <input
              type="text"
              id="asset-price"
              placeholder="Rp 2.000.000"
              className={`modal-form-input ${errors.price ? 'input-error' : ''}`}
              {...register('price', {
                required: 'Harga wajib diisi',
                validate: (value) => {
                  const cleanPrice = value.replace(/[^0-9]/g, '');
                  return (Number(cleanPrice) > 0) || 'Harga barang harus lebih besar dari 0';
                }
              })}
              onChange={(e) => {
                const formatted = formatToRupiah(e.target.value);
                setValue('price', formatted, { shouldValidate: true, shouldDirty: true });
              }}
            />
            {errors.price && <span className="error-text">{errors.price.message}</span>}
          </div>

          {/* Uploader Gambar Kustom */}
          <ImageUploader
            id="asset-photo-upload"
            image={watch('image')}
            onImageChange={(val) => {
              setValue('image', val, { shouldValidate: true, shouldDirty: true });
            }}
            error={errors.image?.message}
            required={!isEditing}
          />

          {/* Error Message dari API Laravel */}
          {submitError && <div className="alert-error">{submitError}</div>}

          {/* Tombol Aksi */}
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

      {/* Modal Popup: Konfirmasi Batal Keluar */}
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

      {/* Modal Popup: Pemulihan Draf Form */}
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
