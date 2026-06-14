import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import '../dashboard/Dashboard.css';

export default function DashboardLayout({ role, currentPath, children }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
      </div>
    </div>
  );
}
