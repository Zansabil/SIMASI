import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import '../dashboard/Dashboard.css';

export default function DashboardLayout({ role, currentPath, children }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Kunci scroll body saat sidebar mobile terbuka supaya halaman
  // di belakang tidak ikut ter-scroll
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    // Cleanup saat komponen di-unmount
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="dashboard-layout">
      {/* Mobile Drawer Overlay */}
      {isMobileMenuOpen && (
        <div className="sidebar-overlay" onClick={closeMobileMenu} />
      )}

      {/* Sidebar Navigation */}
      <Sidebar
        role={role}
        currentPath={currentPath}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={closeMobileMenu}
      />

      {/* Main Content Wrapper */}
      <div className="main-wrapper">
        {/* Sticky Top Navbar */}
        <Navbar
          role={role}
          onToggleMobileMenu={toggleMobileMenu}
        />

        {/* Content Body */}
        {children}

        {/* Footer Copyright */}
        <footer className="footer-copyright-text">
          © {new Date().getFullYear()} SIMAS - Sistem Informasi Manajemen Aset
        </footer>
      </div>
    </div>
  );
}
