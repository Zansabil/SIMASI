import React, { useState, useEffect } from 'react';

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const getRoleDefaultAccess = (role) => {
  switch (role) {
    case 'Administrator':
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

  // Load values when editingUser or modal status changes
  useEffect(() => {
    if (isOpen) {
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

  const handleRoleChange = (role) => {
    setFormRole(role);
    const defaults = getRoleDefaultAccess(role);
    setFormAccess(defaults);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      username: formUsername,
      name: formName,
      email: formEmail,
      role: formRole,
      unit: formUnit,
      password: formPassword,
      status: formStatus,
      access: formAccess
    });
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
        <form onSubmit={handleFormSubmit} className="modal-form-body">
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
              <option value="Administrator">Administrator</option>
              <option value="Kepala Yayasan">Kepala Yayasan</option>
              <option value="Admin SD">Admin SD</option>
              <option value="Admin SMP">Admin SMP</option>
              <option value="Admin SMA">Admin SMA</option>
              <option value="Admin MA">Admin MA</option>
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

          {/* Form Actions */}
          <div className="modal-action-buttons-wrapper">
            <button type="button" className="modal-btn-batal" onClick={onClose}>
              Batal
            </button>
            <button type="submit" className="modal-btn-tambahan">
              {editingUser ? 'Simpan Perubahan' : 'Simpan Pengguna'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
