import React, { useState, useEffect } from 'react';
import { FiList, FiShoppingCart, FiTool, FiBell, FiCheck, FiTrash2, FiHelpCircle } from 'react-icons/fi';
import DashboardLayout from '../layout/DashboardLayout';
import './Notification.css';

export default function NotificationPage({ role, currentPath }) {
  const [notifications, setNotifications] = useState([]);
  const [activeTab, setActiveTab] = useState('all'); // 'all' or 'unread'

  const loadData = () => {
    // Load notifications
    const stored = localStorage.getItem('simas_notifications');
    if (stored) {
      setNotifications(JSON.parse(stored));
    }
  };

  useEffect(() => {
    loadData();

    // Listen to updates
    window.addEventListener('notifications-updated', loadData);
    return () => {
      window.removeEventListener('notifications-updated', loadData);
    };
  }, []);

  const markAsRead = (id) => {
    const updated = notifications.map(n => {
      if (n.id === id) return { ...n, isRead: true };
      return n;
    });
    localStorage.setItem('simas_notifications', JSON.stringify(updated));
    setNotifications(updated);
    window.dispatchEvent(new Event('notifications-updated'));
  };

  const deleteNotification = (id) => {
    const updated = notifications.filter(n => n.id !== id);
    localStorage.setItem('simas_notifications', JSON.stringify(updated));
    setNotifications(updated);
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

  return (
    <DashboardLayout role={role} currentPath={currentPath}>
      <main className="dashboard-body">
        {/* Page Header */}
        <div className="notification-page-header">
          <div className="notification-icon-badge">
            <FiBell size={22} color="#fff" />
          </div>
          <div>
            <h2 className="notification-page-title">Pemberitahuan</h2>
          </div>
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
            Belum dibaca
          </button>
        </div>

        {/* Notification Card Container */}
        <div className="notification-card">
          {filteredNotifs.length === 0 ? (
            <div className="notification-empty-state" style={{ flex: 1, minHeight: '220px' }}>
              <FiBell size={48} className="empty-state-bell-icon" />
              <p className="empty-state-text">Belum ada notifikasi.</p>
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
        <a href="#guide" className="user-guide-footer" onClick={(e) => { e.preventDefault(); alert('Panduan Pengguna akan segera tersedia.'); }}>
          <FiHelpCircle size={16} /> Panduan Pengguna
        </a>
      </main>
    </DashboardLayout>
  );
}
