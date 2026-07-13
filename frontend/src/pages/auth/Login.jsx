import React, { useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../config';
import { useNavigate, Link } from 'react-router-dom';
import logo from '../../assets/logo.png';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import './Login.css';

export default function Login() {
  const navigate = useNavigate();
  
  // State management
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Login form state
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  
  // Recovery form state
  const [recoveryIdentifier, setRecoveryIdentifier] = useState('');
  
  // Feedback states
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Eye and logo assets are imported from assets folder

  // Helper to map numeric role ID from backend to string role name for frontend
  const mapRoleIdToRoleName = (idPeran) => {
    switch (Number(idPeran)) {
      case 1:
        return 'super-admin';
      case 2:
        return 'kepala-yayasan';
      case 3:
        return 'admin';
      case 4:
        return 'petugas-perbaikan';
      case 5:
      default:
        return 'guru';
    }
  };

  // Handle Login submission
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsLoading(true);

    try {
      // Connect to Laravel endpoint serve URL
      const response = await axios.post(`${API_BASE_URL}/api/login`, {
        identifier: identifier,
        password: password,
      });

      if (response.data && response.data.success) {
        setSuccessMsg('Login berhasil! Mengalihkan...');
        
        const token = response.data.access_token;
        const user = response.data.data_user;
        const role = mapRoleIdToRoleName(user.id_peran);
        const name = user.nama;

        // Store token and user data in localStorage
        localStorage.setItem('auth_token', token);
        localStorage.setItem('user_role', role);
        localStorage.setItem('user_jabatan', user.jabatan || role);
        localStorage.setItem('user_name', name);
        localStorage.setItem('user_email', user.email);
        localStorage.setItem('user_username', user.nama_pengguna);
        localStorage.setItem('user_id', user.id);
        localStorage.setItem('user_avatar', user.foto_profil_url || '');
        
        // Redirect based on role immediately
        if (role === 'super-admin') navigate('/super-admin/dashboard');
        else if (role === 'admin') navigate('/admin/dashboard');
        else if (role === 'guru') navigate('/guru/dashboard');
        else if (role === 'petugas-perbaikan') navigate('/petugas-perbaikan/dashboard');
        else if (role === 'kepala-yayasan') navigate('/kepala-yayasan/dashboard');
        else navigate('/admin/dashboard');
      } else {
        setErrorMsg(response.data.message || 'Login gagal.');
      }

    } catch (err) {
      console.error('API login error:', err);
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

  // Handle Recovery submission
  const handleRecoverySubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/forgot-password`, {
        identifier: recoveryIdentifier
      });

      if (response.data && response.data.success) {
        setSuccessMsg(response.data.message);
        setRecoveryIdentifier('');
      } else {
        setErrorMsg(response.data.message || 'Gagal mengirim instruksi pemulihan.');
      }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setErrorMsg(err.response.data.message);
      } else {
        setErrorMsg('Terjadi kesalahan jaringan atau server tidak merespons.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        {/* Header Section */}
        <div className="login-header">
          <img src={logo} alt="SIMAS Logo" className="login-logo-img" />
        </div>

        {/* Display Alerts */}
        {errorMsg && (
          <div style={{ background: '#FEE2E2', borderLeft: '4px solid #EF4444', borderRadius: '4px', 
          color: '#991B1B', fontSize: '13px', padding: '12px', marginBottom: '20px', textAlign: 'left', fontWeight: '500' }}>
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div style={{ background: '#D1FAE5', borderLeft: '4px solid #10B981', borderRadius: '4px', 
          color: '#065F46', fontSize: '13px', padding: '12px', marginBottom: '20px', textAlign: 'left', fontWeight: '500' }}>
            {successMsg}
          </div>
        )}

        {/* Condition State: Forgot Password (Recovery Mode) */}
        {isRecoveryMode ? (
          <div>
            <h2 className="section-title">Pemulihan Akun</h2>
            
            <div className="info-alert">
              Masukkan <strong>Email, Username, atau No. HP</strong> yang terdaftar pada akun <strong>SIMAS</strong> Anda. Kami akan mengirimkan tautan pemulihan ke alamat email Anda.
            </div>

            <form className="login-form" onSubmit={handleRecoverySubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="recovery-identifier">Email / Username / No. HP <span style={{ color: '#EF4444' }}>*</span></label>
                <input
                  id="recovery-identifier"
                  type="text"
                  className="form-input"
                  placeholder="Masukkan salah satu data di atas"
                  required
                  value={recoveryIdentifier}
                  onChange={(e) => setRecoveryIdentifier(e.target.value)}
                />
              </div>

              <button type="submit" className="btn-primary" style={{ marginTop: '8px' }} disabled={isLoading}>
                {isLoading ? 'Mengirim...' : 'Kirim Instruksi Pemulihan'}
              </button>

              <button type="button" className="btn-secondary" style={{ marginTop: '4px' }} onClick={() => 
                { setIsRecoveryMode(false); setErrorMsg(''); setSuccessMsg(''); }}>
                Kembali ke Login
              </button>
            </form>
          </div>
        ) : (
          /* Condition State: Default Login Mode */
          <form className="login-form" onSubmit={handleLoginSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="identifier">Email / Username / No. HP</label>
              <input
                id="identifier"
                type="text"
                className="form-input"
                placeholder="Masukkan email, username, atau No. HP Anda"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">Password</label>
              <div className="input-wrapper">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className="form-input"
                  placeholder="Masukkan password Anda"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ paddingRight: '46px' }}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                >
                  {showPassword ? <FiEye className="eye-icon" /> : <FiEyeOff className="eye-icon" />}
                </button>
              </div>
            </div>

            <div className="form-options">
              <label className="remember-checkbox">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                Ingat Saya
              </label>
              <a
                href="#forgot-password"
                className="forgot-password-link"
                onClick={(e) => {
                  e.preventDefault();
                  setIsRecoveryMode(true);
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
              >
                Lupa Password?
              </a>
            </div>

            <button type="submit" className="btn-primary" style={{ marginTop: '8px' }} disabled={isLoading}>
              {isLoading ? 'Sedang Masuk...' : 'Masuk'}
            </button>

            <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '14px', color: '#4b5563' }}>
              Belum punya akun? <Link to="/register" style={{ color: '#2563eb', fontWeight: '600', textDecoration: 'none' }}>Daftar di sini</Link>
            </div>


          </form>
        )}
      </div>
    </div>
  );
}
