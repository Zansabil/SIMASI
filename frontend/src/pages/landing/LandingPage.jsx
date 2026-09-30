import React from 'react';
import { Link } from 'react-router-dom';
import { FiCheckSquare, FiShoppingCart, FiTool, FiPhone, FiMail, FiGlobe, FiMapPin } from 'react-icons/fi';
import { FaFacebookF, FaInstagram, FaYoutube } from 'react-icons/fa';
import logoWide from '../../assets/logo-wide.png';
import logoWhite from '../../assets/Simas Putih.png';
import gedung from '../../assets/Pondok-Pesantren-Ash-Shiddiiqi-Jambi-Hadirkan-Program-Tahfiz-hingga-Boarding-School.jpg';
import './LandingPage.css';

export default function LandingPage() {
  return (
    <div className="landing-page">
      {/* ===== MAIN CONTENT ===== */}
      <main className="landing-main">
        <div className="landing-content">

          {/* Logo — grid-area: header */}
          <div className="landing-header">
            <img src={logoWide} alt="SIMAS - Sistem Informasi Manajemen Aset" className="landing-logo-wide" />
          </div>

          {/* Hero Image — grid-area: image (spans all rows on desktop) */}
          <div className="landing-right">
            <div className="hero-image-wrapper">
              <img src={gedung} alt="Pondok Pesantren Ash-Shiddiiqi" className="hero-image" />
            </div>
          </div>

          {/* Info Box — grid-area: infobox */}
          <div className="landing-info-box">
            <div className="info-box-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1e6b3a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <div className="info-box-text">
              <h3>Khusus untuk Guru &amp; Staf Sekolah</h3>
              <p>Sistem ini hanya dapat diakses oleh pengguna internal sekolah.</p>
            </div>
          </div>

          {/* CTA Button — grid-area: cta */}
          <Link to="/login" className="landing-cta-btn">
            Masuk ke sistem
          </Link>

          {/* About Section — grid-area: about */}
          <section className="landing-about">
            <h2 className="about-title">Tentang SIMAS</h2>
            <p className="about-description">
              SIMAS (Sistem Informasi Manajemen Aset) adalah sistem berbasis web yang dirancang untuk membantu sekolah dalam mengelola seluruh aset secara terstruktur dan terintegrasi. Meliputi pencatatan aset, pengadaan aset, pelaporan kerusakan aset, monitoring dan pemeliharaan.
            </p>
          </section>

          {/* Features — grid-area: features */}
          <div className="landing-features">
            <div className="feature-item">
              <div className="feature-icon"><FiCheckSquare size={28} /></div>
              <span className="feature-label">Pencatatan Aset<br />Terstruktur</span>
            </div>
            <div className="feature-item">
              <div className="feature-icon"><FiShoppingCart size={28} /></div>
              <span className="feature-label">Pengadaan Aset</span>
            </div>
            <div className="feature-item">
              <div className="feature-icon"><FiTool size={28} /></div>
              <span className="feature-label">Pelaporan Kerusakan Aset</span>
            </div>
          </div>

        </div>
      </main>

      {/* ===== FOOTER ===== */}
      <footer className="landing-footer">
        <div className="footer-content">

          {/* Logo */}
          <div className="footer-brand">
            <img src={logoWhite} alt="SIMAS Logo" className="footer-logo" />
          </div>

          {/* Social Media */}
          <div className="footer-section footer-section--socials">
            <h4 className="footer-heading">Sosial Media Sekolah</h4>
            <div className="footer-socials">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="Facebook">
                <FaFacebookF size={16} />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="Instagram">
                <FaInstagram size={16} />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="YouTube">
                <FaYoutube size={16} />
              </a>
            </div>
          </div>

          {/* Address */}
          <div className="footer-section footer-section--address">
            <h4 className="footer-heading">Alamat</h4>
            <div className="footer-address">
              <FiMapPin size={14} className="footer-icon" />
              <p>Jl. Jambi – Ma. Bulian KM 36,<br />Jembatan Mas, Jambi</p>
            </div>
          </div>

          {/* Contact Info */}
          <div className="footer-section footer-section--contact">
            <h4 className="footer-heading">Info Kontak</h4>
            <div className="footer-contact-list">
              <div className="footer-contact-item">
                <FiPhone size={14} className="footer-icon" />
                <span>+62 813-6766-9111</span>
              </div>
              <div className="footer-contact-item">
                <FiMail size={14} className="footer-icon" />
                <span>media.shiddiq@gmail.com</span>
              </div>
              <div className="footer-contact-item">
                <FiGlobe size={14} className="footer-icon" />
                <span>ash-shiddiiqi.sch.id</span>
              </div>
            </div>
          </div>

        </div>
      </footer>
    </div>
  );
}
