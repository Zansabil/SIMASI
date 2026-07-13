import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../config';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import logo from '../../assets/logo.png';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import './Login.css'; // Reusing login styles for consistency

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [token, setToken] = useState('');
  const [email, setEmail] = useState('');
  
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    // Extract token and email from URL parameters
    const params = new URLSearchParams(location.search);
    const urlToken = params.get('token');
    const urlEmail = params.get('email');
    
    if (urlToken && urlEmail) {
      setToken(urlToken);
      setEmail(urlEmail);
    } else {
      setErrorMsg('Tautan pemulihan tidak valid atau tidak lengkap.');
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/reset-password`, {
        token: token,
        email: email,
        password: password,
        password_confirmation: passwordConfirmation
      });

      if (response.data && response.data.success) {
        setSuccessMsg(response.data.message);
        
        // Reset form
        setPassword('');
        setPasswordConfirmation('');
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setErrorMsg(response.data.message || 'Gagal mengatur ulang kata sandi.');
      }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setErrorMsg(err.response.data.message);
      } else if (err.response && err.response.data && err.response.data.errors) {
        const errors = err.response.data.errors;
        const firstErrorKey = Object.keys(errors)[0];
        setErrorMsg(errors[firstErrorKey][0]);
      } else {
        setErrorMsg('Terjadi kesalahan saat memproses permintaan Anda.');
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

        <div>
          <h2 className="section-title">Buat Kata Sandi Baru</h2>
          
          <div className="info-alert">
            Silakan buat kata sandi baru untuk akun Anda. Gunakan kombinasi huruf dan angka agar lebih aman (Minimal 8 karakter).
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            
            {/* Hidden inputs to keep autocomplete happy if needed */}
            <input type="hidden" name="email" value={email} />

            <div className="form-group">
              <label className="form-label" htmlFor="password">Kata Sandi Baru <span style={{ color: '#EF4444' }}>*</span></label>
              <div className="input-wrapper">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className="form-input"
                  placeholder="Masukkan kata sandi baru"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ paddingRight: '46px' }}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FiEye className="eye-icon" /> : <FiEyeOff className="eye-icon" />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="passwordConfirmation">Konfirmasi Kata Sandi Baru <span style={{ color: '#EF4444' }}>*</span></label>
              <div className="input-wrapper">
                <input
                  id="passwordConfirmation"
                  type={showConfirmPassword ? "text" : "password"}
                  className="form-input"
                  placeholder="Ulangi kata sandi baru"
                  required
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                  style={{ paddingRight: '46px' }}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <FiEye className="eye-icon" /> : <FiEyeOff className="eye-icon" />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn-primary" style={{ marginTop: '8px' }} disabled={isLoading || !token || !email}>
              {isLoading ? 'Menyimpan...' : 'Simpan Kata Sandi Baru'}
            </button>

            <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '14px' }}>
              <Link to="/login" style={{ color: '#6b7280', textDecoration: 'none' }}>Kembali ke Halaman Login</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
