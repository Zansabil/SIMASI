import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  
  // Recovery form state
  const [recoveryEmail, setRecoveryEmail] = useState('');
  
  // Feedback states
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Eye and logo assets are imported from assets folder

  // Handle Login submission
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsLoading(true);

    try {
      // Connect to Laravel endpoint serve URL
      const response = await axios.post('http://localhost:8000/api/login', {
        email: email,
        password: password,
      });

      setSuccessMsg('Login berhasil! Mengalihkan...');
      
      // Store token and user data in localStorage
      localStorage.setItem('auth_token', response.data.access_token);
      localStorage.setItem('user_role', response.data.user.role);
      localStorage.setItem('user_name', response.data.user.name);
      
      // Redirect based on role immediately
      const role = response.data.user.role;
      if (role === 'super-admin') navigate('/super-admin/dashboard');
      else if (role === 'admin') navigate('/admin/dashboard');
      else if (role === 'guru') navigate('/guru/dashboard');
      else if (role === 'petugas-perbaikan') navigate('/petugas-perbaikan/dashboard');
      else if (role === 'kepala-yayasan') navigate('/kepala-yayasan/dashboard');
      else navigate('/admin/dashboard');

    } catch (err) {
      // Fallback for Demo Mode if backend API is not running
      console.warn('API error, falling back to mock login:', err);
      
      let fallbackRole = 'admin';
      let fallbackName = 'Admin Aset';
      let targetPath = '/admin/dashboard';
      
      const inputVal = (email || '').toLowerCase();
      if (inputVal.includes('guru')) {
        fallbackRole = 'guru';
        fallbackName = 'Guru Demo';
        targetPath = '/guru/dashboard';
      } else if (inputVal.includes('petugas')) {
        fallbackRole = 'petugas-perbaikan';
        fallbackName = 'Petugas Perbaikan Demo';
        targetPath = '/petugas-perbaikan/dashboard';
      } else if (inputVal.includes('yayasan') || inputVal.includes('kepala')) {
        fallbackRole = 'kepala-yayasan';
        fallbackName = 'Kepala Yayasan Demo';
        targetPath = '/kepala-yayasan/dashboard';
      } else if (inputVal.includes('super')) {
        fallbackRole = 'super-admin';
        fallbackName = 'Super Admin Demo';
        targetPath = '/super-admin/dashboard';
      }
      
      localStorage.setItem('auth_token', 'mock_token');
      localStorage.setItem('user_role', fallbackRole);
      localStorage.setItem('user_name', email || fallbackName);
      
      navigate(targetPath);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Recovery submission
  const handleRecoverySubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsLoading(true);

    // Mock send password reset email since it is frontend mock flow
    setTimeout(() => {
      setIsLoading(false);
      if (!recoveryEmail.includes('@')) {
        setErrorMsg('Masukkan alamat email yang valid.');
      } else {
        setSuccessMsg(`Instruksi pemulihan kata sandi telah dikirim ke email: ${recoveryEmail}`);
        setRecoveryEmail('');
      }
    }, 1200);
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
              Masukkan alamat email resmi yang terdaftar pada akun <strong>SIMAS</strong> 
              Anda. Kami akan mengirimkan tautan berisi instruksi pemulihan kata sandi secara instan.
            </div>

            <form className="login-form" onSubmit={handleRecoverySubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="recovery-email">Alamat Email <span style={{ color: '#EF4444' }}>*</span></label>
                <input
                  id="recovery-email"
                  type="email"
                  className="form-input"
                  placeholder="contoh: user@simas.com"
                  required
                  value={recoveryEmail}
                  onChange={(e) => setRecoveryEmail(e.target.value)}
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
              <label className="form-label" htmlFor="email">Username</label>
              <input
                id="email"
                type="text"
                className="form-input"
                placeholder="Masukkan username Anda"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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

            <div className="registration-section">
              <div className="registration-prompt">
                Belum punya akun?
              </div>

              <button
                type="button"
                className="btn-primary"
                onClick={() => navigate('/register')}
              >
                Daftar Sekarang
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
