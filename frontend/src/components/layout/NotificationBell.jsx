import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../../config';
import { FiBell, FiShoppingCart, FiTool, FiList, FiLoader } from 'react-icons/fi';
import '../notification/Notification.css';

// Default mock notifications to seed if empty (fallback jika backend tidak tersedia)
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

// Helper: Format waktu relatif dari timestamp backend
const formatRelativeTime = (dateStr) => {
  if (!dateStr) return '';
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Baru saja';
  if (diffMins < 60) return `${diffMins} menit yang lalu`;
  if (diffHours < 24) return `${diffHours} jam yang lalu`;
  if (diffDays === 1) return 'Kemarin';
  if (diffDays < 7) return `${diffDays} hari yang lalu`;
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
};

// Helper: Tentukan kategori dari tipe notifikasi backend
const mapCategory = (tipe) => {
  if (!tipe) return 'general';
  const lower = tipe.toLowerCase();
  if (lower.includes('pengadaan') || lower.includes('pengajuan')) return 'pengadaan';
  if (lower.includes('perbaikan') || lower.includes('kerusakan')) return 'perbaikan';
  if (lower.includes('aset') || lower.includes('pemindahan')) return 'aset';
  return 'general';
};

// Helper: Map data backend ke format frontend
const mapBackendNotification = (notif) => ({
  id: notif.id,
  title: notif.tipe || 'Notifikasi',
  description: notif.pesan || '',
  time: formatRelativeTime(notif.waktu_terkirim),
  isRead: notif.terbaca === true || notif.terbaca === 1,
  category: mapCategory(notif.tipe)
});

export default function NotificationBell({ role }) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [isUsingBackend, setIsUsingBackend] = useState(false);
  const containerRef = useRef(null);

  // Fetch notifications dari API backend
  const loadNotifications = useCallback(async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      const response = await axios.get(`${API_BASE_URL}/api/notifikasi`, config);

      if (response.data && response.data.success && response.data.data) {
        const mapped = response.data.data.map(mapBackendNotification);
        setNotifications(mapped);
        setIsUsingBackend(true);
      } else {
        setNotifications([]);
        setIsUsingBackend(true);
      }
    } catch (err) {
      console.warn("Backend notification API not reachable. Using local data.", err);
      // Fallback ke localStorage
      const stored = localStorage.getItem('simas_notifications');
      if (stored) {
        setNotifications(JSON.parse(stored));
      } else {
        localStorage.setItem('simas_notifications', JSON.stringify(DEFAULT_NOTIFICATIONS));
        setNotifications(DEFAULT_NOTIFICATIONS);
      }
      setIsUsingBackend(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();

    // Listen to local notifications changes in single page app
    const handleUpdate = () => {
      loadNotifications();
    };

    window.addEventListener('notifications-updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    // Poll setiap 30 detik untuk notifikasi baru
    const interval = setInterval(loadNotifications, 30000);

    return () => {
      window.removeEventListener('notifications-updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
      clearInterval(interval);
    };
  }, [loadNotifications]);

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

  const markAsRead = async (id) => {
    // Optimistic update
    const updated = notifications.map(n => {
      if (n.id === id) return { ...n, isRead: true };
      return n;
    });
    setNotifications(updated);

    if (isUsingBackend) {
      try {
        const token = localStorage.getItem('auth_token');
        const config = {
          headers: { Authorization: `Bearer ${token}` }
        };
        await axios.patch(`${API_BASE_URL}/api/notifikasi/${id}/baca`, {}, config);
      } catch (err) {
        console.warn("Failed to mark notification as read on backend.", err);
      }
    } else {
      localStorage.setItem('simas_notifications', JSON.stringify(updated));
    }

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
              notifications.slice(0, 5).map((notif) => (
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
