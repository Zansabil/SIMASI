import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../config';
import { FiUser, FiSave, FiCheck, FiEye, FiEyeOff } from 'react-icons/fi';
import DashboardLayout from '../layout/DashboardLayout';
import StatusModal from '../ui/StatusModal';
import './Profile.css';

export default function ProfilePage({ role, defaultRoleName, currentPath }) {
  const fileInputRef = useRef(null);

  // Profile data state — seeded from localStorage
  const [profileName, setProfileName]         = useState('');
  const [profileUsername, setProfileUsername] = useState('');
  const [profileEmail, setProfileEmail]       = useState('');
  const [avatarSrc, setAvatarSrc]             = useState('');
  const [isSaving, setIsSaving]               = useState(false);
  const [showToast, setShowToast]             = useState(false);
  const [toastMsg, setToastMsg]               = useState('');
  
  const [statusModal, setStatusModal]         = useState({ isOpen: false, type: 'error', title: '', message: '' });

  // Password states
  const [currentPassword, setCurrentPassword]   = useState('');
  const [newPassword, setNewPassword]           = useState('');
  const [confirmPassword, setConfirmPassword]   = useState('');
  const [showCurrentPw, setShowCurrentPw]       = useState(false);
  const [showNewPw, setShowNewPw]               = useState(false);
  const [showConfirmPw, setShowConfirmPw]       = useState(false);
  const [isSavingPw, setIsSavingPw]             = useState(false);
  const [pwError, setPwError]                   = useState('');

  // Load existing data from localStorage on mount
  useEffect(() => {
    setProfileName(localStorage.getItem('user_name') || defaultRoleName || 'User');
    setProfileUsername(localStorage.getItem('user_username') || role || 'user');
    setProfileEmail(localStorage.getItem('user_email') || `${role || 'user'}@simas.sch.id`);
    setAvatarSrc(localStorage.getItem('user_avatar') || '');
  }, [role, defaultRoleName]);

  // Generate initials from name
  const getInitials = (name) => {
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0][0]?.toUpperCase() || 'U';
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  // Handle avatar file selection
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setStatusModal({ isOpen: true, type: 'error', title: 'Gagal Mengunggah', message: 'Ukuran foto maksimal 2 MB.' });
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarSrc(ev.target.result);
    reader.readAsDataURL(file);
  };

  // Save profile info
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const token = localStorage.getItem('auth_token');
      await axios.put(`${API_BASE_URL}/api/profile`, {
        name: profileName,
        email: profileEmail,
      }, { headers: { Authorization: `Bearer ${token}` } });
    } catch (err) {
      console.warn('Backend offline — saving locally.', err);
    }
    localStorage.setItem('user_name', profileName);
    localStorage.setItem('user_email', profileEmail);
    if (avatarSrc) localStorage.setItem('user_avatar', avatarSrc);
    setIsSaving(false);
    triggerToast('Profil berhasil diperbarui');
  };

  // Save password
  const handleSavePassword = async (e) => {
    e.preventDefault();
    setPwError('');
    if (newPassword !== confirmPassword) {
      setPwError('Kata sandi baru dan konfirmasi tidak cocok.');
      return;
    }
    if (newPassword.length < 8) {
      setPwError('Kata sandi baru minimal 8 karakter.');
      return;
    }
    setIsSavingPw(true);
    try {
      const token = localStorage.getItem('auth_token');
      await axios.put(`${API_BASE_URL}/api/profile/password`, {
        current_password: currentPassword,
        new_password: newPassword,
        new_password_confirmation: confirmPassword,
      }, { headers: { Authorization: `Bearer ${token}` } });
    } catch (err) {
      console.warn('Backend offline — password change skipped locally.', err);
    }
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setIsSavingPw(false);
    triggerToast('Kata sandi berhasil diperbarui');
  };

  const triggerToast = (msg) => {
    setToastMsg(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
  };

  /* ── Password input helper ── */
  const PwInput = ({ label, value, onChange, show, onToggle }) => (
    <div className="profile-form-group">
      <label className="profile-form-label">{label}</label>
      <div style={{ position: 'relative' }}>
        <input
          className="profile-form-input"
          type={show ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          style={{ paddingRight: '42px' }}
        />
        <button
          type="button"
          onClick={onToggle}
          style={{
            position: 'absolute', right: '12px', top: '50%',
            transform: 'translateY(-50%)', background: 'none',
            border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '0',
            display: 'flex', alignItems: 'center'
          }}
        >
          {show ? <FiEyeOff size={16} /> : <FiEye size={16} />}
        </button>
      </div>
    </div>
  );

  return (
    <DashboardLayout role={role} currentPath={currentPath}>
      <main className="dashboard-body">
        {/* Page Header */}
        <div className="profile-header-row">
          <div className="profile-page-icon-wrap">
            <FiUser size={22} color="#fff" />
          </div>
          <div>
            <h2 className="profile-page-title">Profil Saya</h2>
            <p className="profile-page-subtitle">Kelola informasi profil dan akun Anda</p>
          </div>
        </div>

        {/* Cards wrapper — tengah */}
        <div className="profile-cards-center-wrap">

          {/* Card 1: Informasi Profil */}
          <div className="profile-card">
            <h3 className="profile-card-title">Informasi Profil</h3>
            <p className="profile-card-subtitle">Perbarui informasi profil akun dan alamat email Anda.</p>
            <hr className="profile-card-divider" />

            <form onSubmit={handleSaveProfile}>
              {/* Avatar */}
              <p className="profile-avatar-label">Avatar</p>
              <div className="profile-avatar-section">
                <div className="profile-avatar-circle">
                  {avatarSrc ? <img src={avatarSrc} alt="avatar" /> : getInitials(profileName)}
                </div>
                <div className="profile-avatar-upload-group">
                  <button type="button" className="profile-avatar-upload-btn"
                    onClick={() => fileInputRef.current?.click()}>
                    Unggah foto
                  </button>
                  <span className="profile-avatar-hint">JPG, PNG, WEBP atau GIF. Maksimal 2 MB.</span>
                </div>
              </div>
              <input ref={fileInputRef} type="file" accept="image/*"
                style={{ display: 'none' }} onChange={handleAvatarChange} />

              {/* Fields */}
              <div className="profile-form-group">
                <label className="profile-form-label">Nama Lengkap</label>
                <input className="profile-form-input" type="text" value={profileName}
                  onChange={(e) => setProfileName(e.target.value)} placeholder="Nama lengkap" required />
              </div>

              <div className="profile-form-group">
                <label className="profile-form-label">Username</label>
                <input className="profile-form-input readonly" type="text" value={profileUsername} readOnly />
              </div>

              <div className="profile-form-group">
                <label className="profile-form-label">Alamat Email</label>
                <input className="profile-form-input" type="email" value={profileEmail}
                  onChange={(e) => setProfileEmail(e.target.value)} placeholder="email@simas.sch.id" required />
              </div>

              {/* Save button — pojok kanan */}
              <div className="profile-save-row">
                <button type="submit" className="profile-save-btn" disabled={isSaving}>
                  {isSaving ? <><FiSave size={15} /> Menyimpan...</> : <><FiCheck size={15} /> Menyimpan</>}
                </button>
              </div>
            </form>
          </div>

          {/* Card 2: Perbarui Kata Sandi */}
          <div className="profile-card" style={{ marginTop: '24px' }}>
            <h3 className="profile-card-title">Perbarui kata sandi</h3>
            <p className="profile-card-subtitle">Pastikan akun Anda menggunakan kata sandi yang panjang dan acak agar tetap aman.</p>
            <hr className="profile-card-divider" />

            <form onSubmit={handleSavePassword}>
              <PwInput
                label="Kata sandi saat ini"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                show={showCurrentPw}
                onToggle={() => setShowCurrentPw(p => !p)}
              />
              <PwInput
                label="Kata sandi baru"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                show={showNewPw}
                onToggle={() => setShowNewPw(p => !p)}
              />
              <PwInput
                label="Konfirmasi kata sandi"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                show={showConfirmPw}
                onToggle={() => setShowConfirmPw(p => !p)}
              />

              {pwError && (
                <p style={{ color: '#dc2626', fontSize: '13px', marginBottom: '12px', marginTop: '-8px' }}>
                  {pwError}
                </p>
              )}

              {/* Save button — pojok kanan */}
              <div className="profile-save-row">
                <button type="submit" className="profile-save-btn" disabled={isSavingPw}>
                  {isSavingPw ? <><FiSave size={15} /> Menyimpan...</> : <><FiCheck size={15} /> Menyimpan</>}
                </button>
              </div>
            </form>
          </div>

        </div>{/* end cards-center-wrap */}

        <footer className="footer-copyright-text" style={{ marginTop: '40px' }}>
          © 2025 SIMAS - Sistem Informasi Manajemen Aset
        </footer>
      </main>

      {/* Toast Notification */}
      {showToast && (
        <div className="profile-toast">
          <FiCheck size={18} /> {toastMsg}
        </div>
      )}

      {/* Status Modal */}
      <StatusModal
        isOpen={statusModal.isOpen}
        type={statusModal.type}
        title={statusModal.title}
        message={statusModal.message}
        onConfirm={() => setStatusModal({ ...statusModal, isOpen: false })}
      />
    </DashboardLayout>
  );
}
