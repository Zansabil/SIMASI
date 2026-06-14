import React from 'react';
import { useNavigate } from 'react-router-dom';
import logoWide from '../../assets/logo-wide.png';
import { FiHome, FiList, FiShoppingCart, FiTool, FiUsers } from 'react-icons/fi';

// Sidebar Menu Configuration based on Role
const MENU_CONFIG = {
  'guru': [
    { path: '/guru/dashboard', label: 'Dashboard', icon: FiHome },
    { path: '/guru/daftar-aset', label: 'Daftar Aset', icon: FiList },
    { path: '/guru/pengadaan', label: 'Pengadaan Aset', icon: FiShoppingCart },
    { path: '/guru/perbaikan', label: 'Perbaikan Aset', icon: FiTool }
  ],
  'admin': [
    { path: '/admin/dashboard', label: 'Dashboard', icon: FiHome },
    { path: '/admin/daftar-aset', label: 'Daftar Aset', icon: FiList },
    { path: '/admin/pengadaan', label: 'Pengadaan Aset', icon: FiShoppingCart },
    { path: '/admin/perbaikan', label: 'Perbaikan Aset', icon: FiTool }
  ],
  'petugas-perbaikan': [
    { path: '/petugas-perbaikan/dashboard', label: 'Dashboard', icon: FiHome },
    { path: '/petugas-perbaikan/daftar-aset', label: 'Daftar Aset', icon: FiList },
    { path: '/petugas-perbaikan/pengadaan', label: 'Pengadaan Aset', icon: FiShoppingCart },
    { path: '/petugas-perbaikan/perbaikan', label: 'Perbaikan Aset', icon: FiTool }
  ],
  'kepala-yayasan': [
    { path: '/kepala-yayasan/dashboard', label: 'Dashboard', icon: FiHome },
    { path: '/kepala-yayasan/daftar-aset', label: 'Daftar Aset', icon: FiList },
    { path: '/kepala-yayasan/persetujuan', label: 'Persetujuan Pengadaan', icon: FiShoppingCart },
    { path: '/kepala-yayasan/perbaikan', label: 'Perbaikan Aset', icon: FiTool }
  ],
  'super-admin': [
    { path: '/super-admin/dashboard', label: 'Dashboard', icon: FiHome },
    { path: '/super-admin/daftar-aset', label: 'Daftar Aset', icon: FiList },
    { path: '/super-admin/pengadaan', label: 'Pengadaan Aset', icon: FiShoppingCart },
    { path: '/super-admin/perbaikan', label: 'Perbaikan Aset', icon: FiTool },
    { path: '/super-admin/manajemen-pengguna', label: 'Manajemen Pengguna', icon: FiUsers }
  ]
};

const LogoutIcon = (props) => (
  <svg stroke="currentColor" fill="none" strokeWidth="2.2" viewBox="0 0 24 24" 
  strokeLinecap="round" strokeLinejoin="round" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg" 
  className={props.className}>
    <path d="M10 3h9a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-9" />
    <polyline points="8 17 3 12 8 7" />
    <line x1="16" y1="12" x2="3" y2="12" />
  </svg>
);

export default function Sidebar({ role, currentPath, isMobileOpen, onCloseMobile }) {
  const navigate = useNavigate();
  
  // Normalize role string to match config keys
  const normalizedRole = role ? role.toLowerCase() : 'admin';
  const menus = MENU_CONFIG[normalizedRole] || MENU_CONFIG['admin'];

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <aside className={`sidebar ${isMobileOpen ? 'mobile-open' : ''}`}>
      <div className="sidebar-top">
        {/* Logo Header */}
        <div className="sidebar-logo-container">
          <img src={logoWide} alt="SIMAS Logo" className="sidebar-logo" />
        </div>

        {/* Navigation Links */}
        <nav className="sidebar-menu">
          {menus.map((menu) => {
            const Icon = menu.icon;
            // Check if active (either exact match or starting with path)
            const isActive = currentPath === menu.path;
            
            return (
              <a 
                key={menu.path}
                href={menu.path}
                className={`nav-link-item ${isActive ? 'active' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  navigate(menu.path);
                  if (onCloseMobile) onCloseMobile();
                }}
              >
                <Icon className="nav-icon" />
                {menu.label}
              </a>
            );
          })}
        </nav>
      </div>

      {/* Sidebar Logout Button */}
      <div className="logout-container">
        <button className="logout-link" onClick={handleLogout}>
          <LogoutIcon className="nav-icon" />
          Log Out
        </button>
      </div>
    </aside>
  );
}
