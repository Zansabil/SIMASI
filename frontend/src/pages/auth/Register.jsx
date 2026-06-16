import React, { useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../config';
import { useNavigate, Link } from 'react-router-dom';
import logo from '../../assets/logo.png';
import './Register.css';

export default function Register() {
  const navigate = useNavigate();
  
  // State management for form inputs
  const [namaLengkap, setNamaLengkap] = useState('');
  const [email, setEmail] = useState('');
  const [noTelepon, setNoTelepon] = useState('');
  const [jabatan, setJabatan] = useState('');
  const [unitKerja, setUnitKerja] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [konfirmasiPassword, setKonfirmasiPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  
  // Feedback states
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    // Validation checks
    if (password !== konfirmasiPassword) {
      setErrorMsg('Kata sandi dan konfirmasi kata sandi tidak cocok.');
      return;
    }

    if (!agreeTerms) {
      setErrorMsg('Anda harus menyetujui Syarat & Ketentuan serta Kebijakan Privasi.');
      return;
    }

    setIsLoading(true);

    try {
      // Connect to Laravel backend register API
      const response = await axios.post(`${API_BASE_URL}/api/register`, {
        nama: namaLengkap,
        nama_pengguna: username,
        email: email,
        password: password,
        area: unitKerja
      });

      setSuccessMsg('Pendaftaran berhasil! Mengalihkan ke halaman login...');
      
      // Reset form
      setNamaLengkap('');
      setEmail('');
      setNoTelepon('');
      setJabatan('');
      setUnitKerja('');
      setUsername('');
      setPassword('');
      setKonfirmasiPassword('');
      setAgreeTerms(false);

      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setErrorMsg(err.response.data.message);
      } else if (err.response && err.response.data && err.response.data.errors) {
        const errors = err.response.data.errors;
        const firstErrorKey = Object.keys(errors)[0];
        setErrorMsg(errors[firstErrorKey][0]);
      } else {
        setErrorMsg('Gagal terhubung ke server backend. Pastikan Laravel sudah berjalan.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-container">
      {/* Logo Pesantren above the Card */}
      <img src={logo} alt="SIMAS Logo" className="register-logo-img" />

      {/* Card Pendaftaran */}
      <div className="register-card">
        {/* Card Header with X button */}
        <div className="register-card-header">
          <span className="register-card-title">Formulir Pendaftaran</span>
          <button className="close-button" onClick={() => navigate('/login')} aria-label="Tutup dan kembali ke login">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Display Feedback Alerts */}
        {errorMsg && (
          <div style={{ background: '#FEE2E2', borderLeft: '4px solid #EF4444', borderRadius: '4px', color: '#991B1B', fontSize: '13px', padding: '10px', marginBottom: '20px', textAlign: 'left', fontWeight: '500' }}>
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div style={{ background: '#D1FAE5', borderLeft: '4px solid #10B981', borderRadius: '4px', color: '#065F46', fontSize: '13px', padding: '10px', marginBottom: '20px', textAlign: 'left', fontWeight: '500' }}>
            {successMsg}
          </div>
        )}

        {/* Registration Form */}
        <form className="register-form" onSubmit={handleSubmit}>
          <div className="form-body">
            
            {/* Section 1: Data Pribadi */}
            <div className="form-section">
              <h3 className="section-heading">Data Pribadi</h3>
              
              <div className="form-group">
                <label className="form-label" htmlFor="namaLengkap">Nama Lengkap <span className="required-asterisk">*</span></label>
                <input
                  id="namaLengkap"
                  type="text"
                  className="form-input"
                  placeholder="Masukkan nama lengkap"
                  required
                  value={namaLengkap}
                  onChange={(e) => setNamaLengkap(e.target.value)}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="email">Email <span className="required-asterisk">*</span></label>
                  <input
                    id="email"
                    type="email"
                    className="form-input"
                    placeholder="emailsekolah@gmail.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="noTelepon">No. Telepon <span className="required-asterisk">*</span></label>
                  <input
                    id="noTelepon"
                    type="text"
                    className="form-input"
                    placeholder="08xxxxxxxxxx"
                    required
                    value={noTelepon}
                    onChange={(e) => setNoTelepon(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Data Kepegawaian */}
            <div className="form-section">
              <h3 className="section-heading">Data Kepegawaian</h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="jabatan">Jabatan <span className="required-asterisk">*</span></label>
                  <select
                    id="jabatan"
                    className="form-select"
                    required
                    value={jabatan}
                    onChange={(e) => setJabatan(e.target.value)}
                  >
                    <option value="">Pilih Jabatan</option>
                    <option value="guru">Guru</option>
                    <option value="admin">Admin Aset</option>
                    <option value="petugas-perbaikan">Petugas Perbaikan</option>
                    <option value="kepala-yayasan">Kepala Yayasan</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="unitKerja">Unit Kerja <span className="required-asterisk">*</span></label>
                  <select
                    id="unitKerja"
                    className="form-select"
                    required
                    value={unitKerja}
                    onChange={(e) => setUnitKerja(e.target.value)}
                  >
                    <option value="">Pilih Unit Kerja</option>
                    <option value="MI Ash-Shiddiqi">MI Ash-Shiddiqi</option>
                    <option value="MTs Ash-Shiddiqi">MTs Ash-Shiddiqi</option>
                    <option value="MA Ash-Shiddiqi">MA Ash-Shiddiqi</option>
                    <option value="Yayasan Ash-Shiddiqi">Yayasan Ash-Shiddiqi</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section 3: Data Akun */}
            <div className="form-section">
              <h3 className="section-heading">Data Akun</h3>
              
              <div className="form-group">
                <label className="form-label" htmlFor="username">User Name <span className="required-asterisk">*</span></label>
                <input
                  id="username"
                  type="text"
                  className="form-input"
                  placeholder="Masukkan username"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
                <div className="input-note">Username akan di gunakan untuk login ke sistem</div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="password">Password <span className="required-asterisk">*</span></label>
                  <input
                    id="password"
                    type="password"
                    className="form-input"
                    placeholder="Masukkan password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="konfirmasiPassword">Konfirmasi Password <span className="required-asterisk">*</span></label>
                  <input
                    id="konfirmasiPassword"
                    type="password"
                    className="form-input"
                    placeholder="Ulangi password"
                    required
                    value={konfirmasiPassword}
                    onChange={(e) => setKonfirmasiPassword(e.target.value)}
                  />
                </div>
              </div>
            </div>

          </div>

          {/* Form Footer */}
          <div className="form-footer">
            {/* Checkbox agreement */}
            <label className="terms-checkbox">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                required
              />
              <span>
                Saya menyetujui <a href="#terms" className="terms-link">Syarat & Ketentuan</a> dan <a href="#privacy" className="terms-link">Kebijakan Privasi</a> yang berlaku
              </span>
            </label>

            <button type="submit" className="btn-primary" disabled={isLoading}>
              {isLoading ? 'Mendaftarkan...' : 'Daftar Sekarang'}
            </button>
            
            <div className="redirect-prompt">
              Sudah punya akun? <Link to="/login" className="redirect-link">Masuk di sini</Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
