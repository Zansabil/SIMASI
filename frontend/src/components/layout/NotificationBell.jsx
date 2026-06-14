import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiBell, FiUser, FiShoppingCart, FiTool, FiList } from 'react-icons/fi';
import '../notification/Notification.css';

// Default mock notifications to seed if empty
const DEFAULT_NOTIFICATIONS = [
  {
    id: 'notif-1',
    title: 'Pengadaan AC Baru Kelas 10A Disetujui',
    description: 'Pengajuan pengadaan AC Baru untuk Kelas 10A telah disetujui oleh Kepala Yayasan.',
    time: '1 jam yang lalu',
    isRead: false,
    category: 'pengadaan'
  },
  {
    id: 'notif-2',
    title: 'Perbaikan Meja Guru Sedang Dikerjakan',
    description: 'Petugas Perbaikan telah memulai pengerjaan perbaikan Meja Guru di Ruang 2.',
    time: '4 jam yang lalu',
    isRead: false,
    category: 'perbaikan'
  },
  {
    id: 'notif-3',
    title: 'Aset Baru Ditambahkan',
    description: 'Admin telah menambahkan 5 unit laptop Lenovo ThinkPad L14 ke dalam daftar aset.',
    time: 'Kemarin',
    isRead: true,
    category: 'aset'
  }
];

export default function NotificationBell({ role }) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const containerRef = useRef(null);

  // Initialize and load notifications
  const loadNotifications = () => {
    const stored = localStorage.getItem('simas_notifications');
    if (stored) {
      setNotifications(JSON.parse(stored));
    } else {
      localStorage.setItem('simas_notifications', JSON.stringify(DEFAULT_NOTIFICATIONS));
      setNotifications(DEFAULT_NOTIFICATIONS);
    }
  };

  useEffect(() => {
    loadNotifications();

    // Listen to local notifications changes in single page app
    const handleUpdate = () => {
      loadNotifications();
    };

    window.addEventListener('notifications-updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('notifications-updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  // Handle click outside to close popover
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const togglePopover = () => {
    setIsOpen(!isOpen);
  };

  const markAsRead = (id) => {
    const updated = notifications.map(n => {
      if (n.id === id) return { ...n, isRead: true };
      return n;
    });
    localStorage.setItem('simas_notifications', JSON.stringify(updated));
    setNotifications(updated);
    // Dispatch custom event to notify other header components or pages
    window.dispatchEvent(new Event('notifications-updated'));
  };

  const navigateToAll = () => {
    setIsOpen(false);
    navigate(`/${role}/notifikasi`);
  };

  const getIcon = (category) => {
    switch (category) {
      case 'pengadaan':
        return <FiShoppingCart size={14} />;
      case 'perbaikan':
        return <FiTool size={14} />;
      case 'aset':
        return <FiList size={14} />;
      default:
        return <FiBell size={14} />;
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="notification-bell-container" ref={containerRef}>
      <button 
        className="nav-notification-btn" 
        onClick={togglePopover}
        aria-label="Pemberitahuan"
        aria-expanded={isOpen}
      >
        <FiBell size={22} />
        {unreadCount > 0 && <span className="notification-badge-red" />}
      </button>

      {isOpen && (
        <div className="notification-popover">
          <div className="popover-header">
            Pemberitahuan
          </div>

          <div className="popover-list">
            {notifications.length === 0 ? (
              <div className="notification-empty-state">
                <FiBell size={36} className="empty-state-bell-icon" />
                <p className="empty-state-text">Belum ada notifikasi.</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div 
                  key={notif.id} 
                  className={`popover-item ${!notif.isRead ? 'unread' : ''}`}
                  onClick={() => {
                    if (!notif.isRead) markAsRead(notif.id);
                  }}
                >
                  <div className="popover-item-icon">
                    {getIcon(notif.category)}
                  </div>
                  <div className="popover-item-content">
                    <div className="popover-item-title">{notif.title}</div>
                    <div className="popover-item-desc">{notif.description}</div>
                    <div className="popover-item-time">{notif.time}</div>
                  </div>
                  {!notif.isRead && <div className="popover-item-dot" />}
                </div>
              ))
            )}
          </div>

          <div className="popover-footer">
            <button className="popover-footer-link" onClick={navigateToAll}>
              Lihat semua
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
