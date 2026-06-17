import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../config';
import { FiList, FiShoppingCart, FiTool, FiBell, FiCheck, FiTrash2, FiHelpCircle, FiLoader, FiCheckCircle } from 'react-icons/fi';
import DashboardLayout from '../layout/DashboardLayout';
import StatusModal from '../ui/StatusModal';
import './Notification.css';

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

export default function NotificationPage({ role, currentPath }) {
  const [notifications, setNotifications] = useState([]);
  const [activeTab, setActiveTab] = useState('all'); // 'all' or 'unread'
  const [isLoading, setIsLoading] = useState(true);
  const [isUsingBackend, setIsUsingBackend] = useState(false);
  const [statusModal, setStatusModal] = useState({ isOpen: false, type: 'success', title: '', message: '' });

  // Fetch data dari API backend
  const loadData = useCallback(async () => {
    setIsLoading(true);
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
      }
      setIsUsingBackend(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();

    // Listen to updates from NotificationBell
    window.addEventListener('notifications-updated', loadData);
    return () => {
      window.removeEventListener('notifications-updated', loadData);
    };
  }, [loadData]);

  // Tandai 1 notifikasi sebagai dibaca
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

  // Tandai semua sebagai dibaca
  const markAllAsRead = async () => {
    // Optimistic update
    const updated = notifications.map(n => ({ ...n, isRead: true }));
    setNotifications(updated);

    if (isUsingBackend) {
      try {
        const token = localStorage.getItem('auth_token');
        const config = {
          headers: { Authorization: `Bearer ${token}` }
        };
        await axios.post(`${API_BASE_URL}/api/notifikasi/baca-semua`, {}, config);
      } catch (err) {
        console.warn("Failed to mark all notifications as read on backend.", err);
      }
    } else {
      localStorage.setItem('simas_notifications', JSON.stringify(updated));
    }

    window.dispatchEvent(new Event('notifications-updated'));
  };

  // Hapus notifikasi (hanya lokal/UI, backend tidak punya endpoint delete)
  const deleteNotification = (id) => {
    const updated = notifications.filter(n => n.id !== id);
    setNotifications(updated);

    if (!isUsingBackend) {
      localStorage.setItem('simas_notifications', JSON.stringify(updated));
    }

    window.dispatchEvent(new Event('notifications-updated'));
  };

  const getIcon = (category) => {
    switch (category) {
      case 'pengadaan':
        return <FiShoppingCart size={18} />;
      case 'perbaikan':
        return <FiTool size={18} />;
      case 'aset':
        return <FiList size={18} />;
      default:
        return <FiBell size={18} />;
    }
  };

  const filteredNotifs = notifications.filter(n => {
    if (activeTab === 'unread') return !n.isRead;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <DashboardLayout role={role} currentPath={currentPath}>
      <main className="dashboard-body">
        {/* Page Header */}
        <div className="notification-page-header">
          <div className="notification-icon-badge">
            <FiBell size={22} color="#fff" />
          </div>
          <div style={{ flex: 1 }}>
            <h2 className="notification-page-title">Pemberitahuan</h2>
          </div>
          {unreadCount > 0 && (
            <button
              className="action-btn-notif read-btn"
              onClick={markAllAsRead}
              style={{ fontSize: '13px', padding: '8px 16px' }}
            >
              <FiCheckCircle style={{ marginRight: '4px' }} /> Tandai Semua Dibaca
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="notification-tabs">
          <button 
            className={`notification-tab-btn ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            Semua
          </button>
          <button 
            className={`notification-tab-btn ${activeTab === 'unread' ? 'active' : ''}`}
            onClick={() => setActiveTab('unread')}
          >
            Belum dibaca {unreadCount > 0 && `(${unreadCount})`}
          </button>
        </div>

        {/* Notification Card Container */}
        <div className="notification-card">
          {isLoading ? (
            <div className="notification-empty-state" style={{ flex: 1, minHeight: '220px' }}>
              <FiLoader size={32} className="spin-animation" style={{ color: '#6366f1' }} />
              <p className="empty-state-text">Memuat notifikasi...</p>
            </div>
          ) : filteredNotifs.length === 0 ? (
            <div className="notification-empty-state" style={{ flex: 1, minHeight: '220px' }}>
              <FiBell size={48} className="empty-state-bell-icon" />
              <p className="empty-state-text">
                {activeTab === 'unread' ? 'Semua notifikasi sudah dibaca.' : 'Belum ada notifikasi.'}
              </p>
            </div>
          ) : (
            <div className="notification-list-full">
              {filteredNotifs.map((notif) => (
                <div key={notif.id} className={`notification-row-full ${!notif.isRead ? 'unread' : ''}`}>
                  <div className="notification-row-left">
                    <div className="popover-item-icon" style={{ width: '38px', height: '38px' }}>
                      {getIcon(notif.category)}
                    </div>
                    <div className="notification-content-full">
                      <div className="notification-title-full">{notif.title}</div>
                      <div className="notification-desc-full">{notif.description}</div>
                      <div className="notification-meta-full">
                        <span>{notif.time}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="notification-actions-full">
                    {!notif.isRead && (
                      <button 
                        className="action-btn-notif read-btn"
                        onClick={() => markAsRead(notif.id)}
                        title="Tandai telah dibaca"
                      >
                        <FiCheck style={{ marginRight: '4px' }} /> Dibaca
                      </button>
                    )}
                    <button 
                      className="action-btn-notif delete-btn"
                      onClick={() => deleteNotification(notif.id)}
                      title="Hapus"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* User Guide Footer */}
        <a href="#guide" className="user-guide-footer" onClick={(e) => { e.preventDefault(); setStatusModal({ isOpen: true, type: 'warning', title: 'Segera Hadir', message: 'Panduan Pengguna akan segera tersedia.' }); }}>
          <FiHelpCircle size={16} /> Panduan Pengguna
        </a>

        {/* Status Modal */}
        <StatusModal
          isOpen={statusModal.isOpen}
          type={statusModal.type}
          title={statusModal.title}
          message={statusModal.message}
          onConfirm={() => setStatusModal({ ...statusModal, isOpen: false })}
          confirmText="OK"
        />
      </main>
    </DashboardLayout>
  );
}
