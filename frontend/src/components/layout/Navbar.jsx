import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUser } from 'react-icons/fi';
import NotificationBell from './NotificationBell';
import logoWide from '../../assets/logo-wide.png';

const MenuIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" 
  fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="12" x2="21" y2="12"/>
    <line x1="3" y1="6" x2="21" y2="6"/>
    <line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
);

export default function Navbar({ role, onToggleMobileMenu }) {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('User');

  useEffect(() => {
    const storedName = localStorage.getItem('user_name');
    if (storedName) {
      setUserName(storedName);
    }
  }, []);

  const handleProfileClick = () => {
    const normalizedRole = role ? role.toLowerCase() : 'admin';
    navigate(`/${normalizedRole}/profile`);
  };

  return (
    <header className="dashboard-navbar">
      {/* Hamburger Menu Toggle (Mobile only) */}
      <button 
        className="hamburger-toggle" 
        onClick={onToggleMobileMenu} 
        aria-label="Toggle Menu"
      >
        <MenuIcon />
      </button>

      {/* Logo on Mobile Header */}
      <div className="mobile-logo-header">
        <img src={logoWide} alt="SIMAS Logo" className="mobile-logo-img" />
      </div>

      {/* Right Action Icons */}
      <div className="nav-actions">
        <NotificationBell role={role} />
        <div 
          className="nav-profile-circle" 
          title={userName} 
          aria-label="Profil" 
          style={{ cursor: 'pointer' }} 
          onClick={handleProfileClick}
        >
          <FiUser size={22} />
        </div>
      </div>
    </header>
  );
}
