import React, { useState, useEffect, useRef } from 'react';
import StatusModal from '../ui/StatusModal';

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const getRoleDefaultAccess = (role) => {
  switch (role) {
    case 'Super Admin':
    case 'Administrator':
    case 'Super Admin':
      return {
        dashboard: true,
        daftarAset: true,
        pengadaanAset: true,
        persetujuanPengadaan: true,
        perbaikanAset: true,
        manajemenPengguna: true
      };
    case 'Kepala Yayasan':
      return {
        dashboard: true,
        daftarAset: true,
        pengadaanAset: false,
        persetujuanPengadaan: true,
        perbaikanAset: true,
        manajemenPengguna: false
      };
    case 'Admin':
    case 'Admin SD':
    case 'Admin SMP':
    case 'Admin SMA':
    case 'Admin MA':
      return {
        dashboard: true,
        daftarAset: true,
        pengadaanAset: true,
        persetujuanPengadaan: false,
        perbaikanAset: true,
        manajemenPengguna: false
      };
    case 'Petugas Perbaikan':
    case 'Guru':
      return {
        dashboard: true,
        daftarAset: true,
        pengadaanAset: true,
        persetujuanPengadaan: false,
        perbaikanAset: true,
        manajemenPengguna: false
      };
    default:
      return {
        dashboard: false,
        daftarAset: false,
        pengadaanAset: false,
        persetujuanPengadaan: false,
        perbaikanAset: false,
        manajemenPengguna: false
      };
  }
};

export default function UserFormModal({ isOpen, onClose, onSubmit, editingUser }) {
  const [formUsername, setFormUsername] = useState('');
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formRole, setFormRole] = useState('');
  const [formUnit, setFormUnit] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formStatus, setFormStatus] = useState('Aktif');
  const [formAccess, setFormAccess] = useState({
    dashboard: false,
    daftarAset: false,
    pengadaanAset: false,
    persetujuanPengadaan: false,
    perbaikanAset: false,
    manajemenPengguna: false
  });
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const modalBodyRef = useRef(null);

  const [isRestoreDraftOpen, setIsRestoreDraftOpen] = useState(false);
  const [tempDraft, setTempDraft] = useState(null);
  const [hasCheckedDraft, setHasCheckedDraft] = useState(false);

  // Load values when editingUser or modal status changes
  useEffect(() => {
    if (isOpen) {
      setSubmitError('');
      if (editingUser) {
        setFormUsername(editingUser.username);
        setFormName(editingUser.name);
        setFormEmail(editingUser.email);
        setFormRole(editingUser.role);
        setFormUnit(editingUser.unit || '-');
        setFormPassword(''); // optional on edit
        setFormStatus(editingUser.status || 'Aktif');
        setFormAccess(editingUser.access ? { ...editingUser.access } : getRoleDefaultAccess(editingUser.role));
      } else {
        setFormUsername('');
        setFormName('');
        setFormEmail('');
        setFormRole('');
        setFormUnit('-');
        setFormPassword('');
        setFormStatus('Aktif');
        setFormAccess({
          dashboard: false,
          daftarAset: false,
          pengadaanAset: false,
          persetujuanPengadaan: false,
          perbaikanAset: false,
          manajemenPengguna: false
        });
      }
    }
  }, [isOpen, editingUser]);

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
      if (!editingUser) {
        const savedDraft = localStorage.getItem('simasi_draft_user');
        if (savedDraft) {
          try {
            const parsed = JSON.parse(savedDraft);
            setTempDraft(parsed);
            setIsRestoreDraftOpen(true);
            setHasCheckedDraft(false); // Blokir autosave dulu
          } catch (e) {
            console.error("Gagal membaca draf user:", e);
            localStorage.removeItem('simasi_draft_user');
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
  }, [isOpen, editingUser]);

  // Effect untuk menyimpan draf secara otomatis saat field berubah
  useEffect(() => {
    if (isOpen && !editingUser && hasCheckedDraft) {
      const draftData = {
        formUsername,
        formName,
        formEmail,
        formRole,
        formUnit,
        formStatus,
        formAccess
      };
      
      const hasContent = formUsername || formName || formEmail || formRole || formUnit || 
                         (formStatus && formStatus !== 'Aktif') || 
                         Object.values(formAccess).some(val => val === true);
      
      if (hasContent) {
        localStorage.setItem('simasi_draft_user', JSON.stringify(draftData));
      } else {
        localStorage.removeItem('simasi_draft_user');
      }
    }
  }, [isOpen, editingUser, hasCheckedDraft, formUsername, formName, formEmail, formRole, formUnit, formStatus, formAccess]);

  const handleRestoreDraft = () => {
    if (tempDraft) {
      setFormUsername(tempDraft.formUsername || '');
      setFormName(tempDraft.formName || '');
      setFormEmail(tempDraft.formEmail || '');
      setFormRole(tempDraft.formRole || '');
      setFormUnit(tempDraft.formUnit || '');
      setFormStatus(tempDraft.formStatus || 'Aktif');
      setFormAccess(tempDraft.formAccess || {
        dashboard: false,
        daftarAset: false,
        pengadaanAset: false,
        persetujuanPengadaan: false,
        perbaikanAset: false,
        manajemenPengguna: false
      });
    }
    setIsRestoreDraftOpen(false);
    setTempDraft(null);
    setHasCheckedDraft(true); // Aktifkan autosave
  };

  const handleDiscardDraft = () => {
    localStorage.removeItem('simasi_draft_user');
    setIsRestoreDraftOpen(false);
    setTempDraft(null);
    setHasCheckedDraft(true); // Aktifkan autosave
  };

  const handleRoleChange = (role) => {
    setFormRole(role);
    const defaults = getRoleDefaultAccess(role);
    setFormAccess(defaults);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');
    try {
      await onSubmit({
        username: formUsername,
        name: formName,
        email: formEmail,
        role: formRole,
        unit: formUnit,
        password: formPassword,
        status: formStatus,
        access: formAccess
      });
      localStorage.removeItem('simasi_draft_user');
    } catch (err) {
      console.error("Error submitting user form:", err);
      const errMsg = err.response?.data?.message || err.message || 'Gagal menyimpan data pengguna. Silakan coba lagi.';
      setSubmitError(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay-bg">
      <div className="modal-form-container">
        {/* Modal Header */}
        <div className="modal-header-row">
          <h3 className="modal-header-title">{editingUser ? 'Edit Pengguna' : 'Tambah Pengguna'}</h3>
          <button className="modal-close-btn" onClick={onClose} aria-label="Tutup">
            <CloseIcon />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form ref={modalBodyRef} onSubmit={handleFormSubmit} className="modal-form-body">
          <p className="required-note">
            Field bertanda <span className="req-star">*</span> wajib diisi
          </p>
          <div className="modal-form-group">
            <label className="modal-form-label">Username <span className="req-star">*</span></label>
            <input
              type="text"
              className="modal-form-input"
              required
              value={formUsername}
              onChange={(e) => setFormUsername(e.target.value)}
              placeholder="contoh: adminunit"
              autoComplete="new-username"
            />
          </div>

          <div className="modal-form-group">
            <label className="modal-form-label">Nama Lengkap <span className="req-star">*</span></label>
            <input
              type="text"
              className="modal-form-input"
              required
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="contoh: Budi Setiawan, S.Pd"
            />
          </div>

          <div className="modal-form-group">
            <label className="modal-form-label">Email <span className="req-star">*</span></label>
            <input
              type="email"
              className="modal-form-input"
              required
              value={formEmail}
              onChange={(e) => setFormEmail(e.target.value)}
              placeholder="contoh: budi@simas.sch.id"
            />
          </div>

          <div className="modal-form-group">
            <label className="modal-form-label">Role Akses <span className="req-star">*</span></label>
            <select
              className="modal-form-select"
              required
              value={formRole}
              onChange={(e) => handleRoleChange(e.target.value)}
            >
              <option value="">Pilih Role Akses</option>
              <option value="Super Admin">Super Admin</option>
              <option value="Kepala Yayasan">Kepala Yayasan</option>
              <option value="Admin">Admin</option>
              <option value="Petugas Perbaikan">Petugas Perbaikan</option>
              <option value="Guru">Guru</option>
            </select>
          </div>

          <div className="modal-form-group">
            <label className="modal-form-label">Unit Kerja</label>
            <select
              className="modal-form-select"
              value={formUnit}
              onChange={(e) => setFormUnit(e.target.value)}
            >
              <option value="-">- (Yayasan / Global)</option>
              <option value="SD">SD</option>
              <option value="SMP">SMP</option>
              <option value="SMA">SMA</option>
              <option value="MA">MA</option>
              <option value="TK">TK</option>
            </select>
          </div>

          <div className="modal-form-group">
            <label className="modal-form-label">Password {!editingUser && <span className="req-star">*</span>}</label>
            <input
              type="password"
              className="modal-form-input"
              required={!editingUser}
              value={formPassword}
              onChange={(e) => setFormPassword(e.target.value)}
              placeholder={editingUser ? "Kosongkan jika tidak ingin diubah" : "Masukkan kata sandi awal"}
              autoComplete="new-password"
            />
          </div>

          <div className="modal-form-group">
            <label className="modal-form-label">Status Akun</label>
            <select
              className="modal-form-select"
              value={formStatus}
              onChange={(e) => setFormStatus(e.target.value)}
            >
              <option value="Aktif">Aktif</option>
              <option value="Non-Aktif">Non-Aktif</option>
            </select>
          </div>

          {/* Hak Akses Menu Section */}
          <div className="modal-form-group full-width">
            <h4 className="access-rights-title">Hak Akses Menu</h4>
            <p className="access-rights-subtitle">Pilih menu yang dapat diakses oleh pengguna ini</p>
            <div className="access-rights-card">
              <label className="access-checkbox-label">
                <input
                  type="checkbox"
                  checked={formAccess.dashboard}
                  onChange={(e) => setFormAccess({ ...formAccess, dashboard: e.target.checked })}
                />
                <span>Dashboard</span>
              </label>
              <label className="access-checkbox-label">
                <input
                  type="checkbox"
                  checked={formAccess.daftarAset}
                  onChange={(e) => setFormAccess({ ...formAccess, daftarAset: e.target.checked })}
                />
                <span>Daftar Aset</span>
              </label>
              <label className="access-checkbox-label">
                <input
                  type="checkbox"
                  checked={formAccess.pengadaanAset}
                  onChange={(e) => setFormAccess({ ...formAccess, pengadaanAset: e.target.checked })}
                />
                <span>Pengadaan Aset</span>
              </label>
              <label className="access-checkbox-label">
                <input
                  type="checkbox"
                  checked={formAccess.persetujuanPengadaan}
                  onChange={(e) => setFormAccess({ ...formAccess, persetujuanPengadaan: e.target.checked })}
                />
                <span>Persetujuan Pengadaan</span>
              </label>
              <label className="access-checkbox-label">
                <input
                  type="checkbox"
                  checked={formAccess.perbaikanAset}
                  onChange={(e) => setFormAccess({ ...formAccess, perbaikanAset: e.target.checked })}
                />
                <span>Perbaikan Aset</span>
              </label>
              <label className="access-checkbox-label">
                <input
                  type="checkbox"
                  checked={formAccess.manajemenPengguna}
                  onChange={(e) => setFormAccess({ ...formAccess, manajemenPengguna: e.target.checked })}
                />
                <span>Manajemen Pengguna</span>
              </label>
            </div>
          </div>

          {submitError && <div className="alert-error">{submitError}</div>}

          {/* Form Actions */}
          <div className="modal-action-buttons-wrapper">
            <button type="button" className="modal-btn-batal" onClick={onClose}>
              Batal
            </button>
            <button type="submit" className="modal-btn-tambahan" disabled={isSubmitting}>
              {isSubmitting ? 'Menyimpan...' : (editingUser ? 'Simpan Perubahan' : 'Simpan Pengguna')}
            </button>
          </div>
        </form>
      </div>

      <StatusModal
        isOpen={isRestoreDraftOpen}
        type="confirm"
        title="Temukan Draf Sebelumnya"
        message="Kami menemukan draf pengisian data Pengguna yang belum selesai. Apakah Anda ingin memulihkan draf tersebut?"
        confirmText="Ya, Pulihkan"
        cancelText="Mulai Baru"
        onConfirm={handleRestoreDraft}
        onCancel={handleDiscardDraft}
      />
    </div>
  );
}
