import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FiUsers } from 'react-icons/fi';
import './ManajemenPengguna.css';
import DashboardLayout from '../../components/layout/DashboardLayout';

// Helper to get default access based on role
const getRoleDefaultAccess = (role) => {
  switch (role) {
    case 'Administrator':
      return {
        dashboard: true,
        daftarAset: true,
        pengadaanAset: true,
        persetujuanPengadaan: true,
        perbaikanAset: true,
        manajemenPengguna: true
      };
    case 'Kepala Yayasan':
      return {
        dashboard: true,
        daftarAset: true,
        pengadaanAset: false,
        persetujuanPengadaan: true,
        perbaikanAset: true,
        manajemenPengguna: false
      };
    case 'Admin SD':
    case 'Admin SMP':
    case 'Admin SMA':
    case 'Admin MA':
      return {
        dashboard: true,
        daftarAset: true,
        pengadaanAset: true,
        persetujuanPengadaan: false,
        perbaikanAset: true,
        manajemenPengguna: false
      };
    case 'Petugas Perbaikan':
    case 'Guru':
      return {
        dashboard: true,
        daftarAset: true,
        pengadaanAset: true,
        persetujuanPengadaan: false,
        perbaikanAset: true,
        manajemenPengguna: false
      };
    default:
      return {
        dashboard: false,
        daftarAset: false,
        pengadaanAset: false,
        persetujuanPengadaan: false,
        perbaikanAset: false,
        manajemenPengguna: false
      };
  }
};

// Mock data matching the screenshot exactly
const initialMockUsers = [
  {
    id: 'mock-1',
    username: 'admin',
    name: 'Administrator Sistem',
    email: 'admin@simas.sch.id',
    role: 'Administrator',
    unit: '-',
    status: 'Aktif',
    is_current: true,
    access: getRoleDefaultAccess('Administrator')
  },
  {
    id: 'mock-2',
    username: 'kepalayayasan',
    name: 'Dr. H. Muhammad Rizki, M.Pd',
    email: 'kepala.yayasan@simas.sch.id',
    role: 'Kepala Yayasan',
    unit: '-',
    status: 'Aktif',
    is_current: false,
    access: getRoleDefaultAccess('Kepala Yayasan')
  },
  {
    id: 'mock-3',
    username: 'adminsd',
    name: 'Siti Aminah, S.Pd',
    email: 'admin.sd@simas.sch.id',
    role: 'Admin SD',
    unit: 'SD',
    status: 'Aktif',
    is_current: false,
    access: getRoleDefaultAccess('Admin SD')
  },
  {
    id: 'mock-4',
    username: 'teknisi',
    name: 'Joko Susilo',
    email: 'teknisi.sd@simas.sch.id',
    role: 'Petugas Perbaikan',
    unit: '-',
    status: 'Aktif',
    is_current: false,
    access: getRoleDefaultAccess('Petugas Perbaikan')
  }
];

export default function SuperManajemenPengguna() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('Super Admin');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Modal display states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  // Form states
  const [formUsername, setFormUsername] = useState('');
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formRole, setFormRole] = useState('');
  const [formUnit, setFormUnit] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formStatus, setFormStatus] = useState('Aktif');
  const [formAccess, setFormAccess] = useState({
    dashboard: false,
    daftarAset: false,
    pengadaanAset: false,
    persetujuanPengadaan: false,
    perbaikanAset: false,
    manajemenPengguna: false
  });

  const [editingUser, setEditingUser] = useState(null);
  const [allUsers, setAllUsers] = useState(initialMockUsers);
  const [users, setUsers] = useState(initialMockUsers);

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingUser(null);
  };

  const handleSuccessOk = () => {
    setIsSuccessOpen(false);
    setEditingUser(null);
  };

  // Check login authentication
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const storedName = localStorage.getItem('user_name');
    if (storedName) {
      setUserName(storedName);
    }
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  // Local filtering helper for offline demo
  const filterMockData = () => {
    let filtered = [...allUsers];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(u =>
        u.username.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.name.toLowerCase().includes(q)
      );
    }

    setUsers(filtered);
  };

  // Fetch users from API
  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('auth_token');
        const config = {
          headers: {
            Authorization: `Bearer ${token}`
          }
        };

        const response = await axios.get(
          `http://localhost:8000/api/users?search=${searchQuery}`,
          config
        );

        if (response.data && response.data.data && response.data.data.length > 0) {
          const mapped = response.data.data.map(u => {
            const mappedRole = u.role === 'super-admin' ? 'Administrator' : (u.role === 'kepala-yayasan' ? 'Kepala Yayasan' : (u.role === 'petugas-perbaikan' ? 'Petugas Perbaikan' : (u.role === 'guru' ? 'Guru' : (['SD', 'SMP', 'SMA', 'MA'].includes(u.unit_kerja) ? `Admin ${u.unit_kerja}` : 'Admin SD'))));
            
            let mappedAccess = null;
            if (u.access) {
              mappedAccess = typeof u.access === 'string' ? JSON.parse(u.access) : u.access;
            } else if (u.permissions) {
              mappedAccess = typeof u.permissions === 'string' ? JSON.parse(u.permissions) : u.permissions;
            } else {
              mappedAccess = getRoleDefaultAccess(mappedRole);
            }

            return {
              id: u.id,
              username: u.username || u.email.split('@')[0],
              name: u.name,
              email: u.email,
              role: mappedRole,
              unit: u.unit_kerja || '-',
              status: u.status || 'Aktif',
              is_current: u.name === userName,
              access: mappedAccess
            };
          });
          setUsers(mapped);
        } else {
          filterMockData();
        }
      } catch (err) {
        console.warn("Backend API not reachable. Using locally filtered mock data for presentation.", err);
        filterMockData();
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [searchQuery, allUsers, userName]);

  // Actions handlers
  const handleEdit = (user) => {
    setEditingUser(user);
    setFormUsername(user.username);
    setFormName(user.name);
    setFormEmail(user.email);
    setFormRole(user.role);
    setFormUnit(user.unit || '-');
    setFormPassword(''); // Optional on edit
    setFormStatus(user.status || 'Aktif');
    
    // Load saved custom access, or fall back to default based on role
    if (user.access) {
      setFormAccess({ ...user.access });
    } else {
      setFormAccess(getRoleDefaultAccess(user.role));
    }
    
    setIsFormOpen(true);
  };

  const handleDelete = (user) => {
    if (user.is_current) {
      alert("Anda tidak dapat menghapus akun Anda sendiri yang sedang aktif digunakan.");
      return;
    }
    setUserToDelete(user);
    setIsDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    try {
      const token = localStorage.getItem('auth_token');
      await axios.delete(`http://localhost:8000/api/users/${userToDelete.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      console.warn('Backend API error, deleting user locally for presentation.', err);
    }
    setAllUsers(prev => prev.filter(item => item.id !== userToDelete.id));
    setIsDeleteConfirmOpen(false);
    setUserToDelete(null);
  };

  const handleCancelDelete = () => {
    setIsDeleteConfirmOpen(false);
    setUserToDelete(null);
  };

  const handleTambahPenggunaClick = () => {
    setEditingUser(null);
    setFormUsername('');
    setFormName('');
    setFormEmail('');
    setFormRole('');
    setFormUnit('');
    setFormPassword('');
    setFormStatus('Aktif');
    setFormAccess({
      dashboard: false,
      daftarAset: false,
      pengadaanAset: false,
      persetujuanPengadaan: false,
      perbaikanAset: false,
      manajemenPengguna: false
    });
    setIsFormOpen(true);
  };

  const handleRoleChange = (role) => {
    setFormRole(role);
    
    // Auto-select menu access rights based on selected role
    const defaults = getRoleDefaultAccess(role);
    setFormAccess(defaults);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    const roleValue = formRole === 'Administrator' ? 'super-admin' : (formRole === 'Kepala Yayasan' ? 'kepala-yayasan' : (formRole === 'Petugas Perbaikan' ? 'petugas-perbaikan' : (formRole === 'Guru' ? 'guru' : 'admin')));

    if (editingUser) {
      // Edit Mode
      const updatedUser = {
        ...editingUser,
        username: formUsername,
        name: formName,
        email: formEmail,
        role: formRole,
        unit: formUnit,
        status: formStatus,
        access: { ...formAccess } // Preserve the checkboxes entered in the form
      };

      try {
        const token = localStorage.getItem('auth_token');
        const config = {
          headers: {
            Authorization: `Bearer ${token}`
          }
        };

        const response = await axios.put(`http://localhost:8000/api/users/${editingUser.id}`, {
          name: formName,
          email: formEmail,
          username: formUsername,
          password: formPassword || undefined, // optional on edit
          role: roleValue,
          unit_kerja: formUnit,
          permissions: JSON.stringify(formAccess)
        }, config);

        if (response.data && response.data.user) {
          const u = response.data.user;
          const mappedUser = {
            id: u.id,
            username: u.username,
            name: u.name,
            email: u.email,
            role: formRole,
            unit: u.unit_kerja || '-',
            status: formStatus,
            is_current: editingUser.is_current,
            access: { ...formAccess }
          };
          setAllUsers(prev => prev.map(item => item.id === editingUser.id ? mappedUser : item));
        } else {
          setAllUsers(prev => prev.map(item => item.id === editingUser.id ? updatedUser : item));
        }
      } catch (err) {
        console.warn("Backend API error, updating user locally for presentation.", err);
        setAllUsers(prev => prev.map(item => item.id === editingUser.id ? updatedUser : item));
      }
    } else {
      // Add Mode
      const newUser = {
        id: 'local-' + Date.now(),
        username: formUsername,
        name: formName,
        email: formEmail,
        role: formRole || 'Administrator',
        unit: formUnit || '-',
        status: formStatus,
        is_current: false,
        access: { ...formAccess } // Preserve the checkboxes entered in the form
      };

      try {
        const token = localStorage.getItem('auth_token');
        const config = {
          headers: {
            Authorization: `Bearer ${token}`
          }
        };

        const response = await axios.post('http://localhost:8000/api/users', {
          name: formName,
          email: formEmail,
          username: formUsername,
          password: formPassword,
          role: roleValue,
          unit_kerja: formUnit,
          permissions: JSON.stringify(formAccess)
        }, config);

        if (response.data && response.data.user) {
          const u = response.data.user;
          const mappedUser = {
            id: u.id,
            username: u.username,
            name: u.name,
            email: u.email,
            role: formRole,
            unit: u.unit_kerja || '-',
            status: 'Aktif',
            is_current: false,
            access: { ...formAccess }
          };
          setAllUsers(prev => [mappedUser, ...prev]);
        } else {
          setAllUsers(prev => [newUser, ...prev]);
        }
      } catch (err) {
        console.warn("Backend API error, adding user locally for presentation.", err);
        setAllUsers(prev => [newUser, ...prev]);
      }
    }

    setIsFormOpen(false);
    setIsSuccessOpen(true);
  };

  // SVGs for layout & action icons
  const SearchIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );

  const PlusIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M12 5v14" />
    </svg>
  );

  const EditIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );

  const DeleteIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );

  const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );

  const SuccessCheckmarkIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="16 9 11 14 8 11" />
    </svg>
  );

  // Role Badge Class Generator
  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'Administrator':
        return 'role-admin';
      case 'Kepala Yayasan':
        return 'role-yayasan';
      case 'Admin SD':
      case 'Admin SMA':
      case 'Admin SMP':
      case 'Admin Unit':
        return 'role-adminsd';
      case 'Petugas Perbaikan':
        return 'role-petugas';
      case 'Guru':
        return 'role-guru';
      default:
        return 'role-admin';
    }
  };

  return (
    <DashboardLayout role="super-admin" currentPath="/super-admin/manajemen-pengguna">
      {/* Content Body */}
      <main className="dashboard-body">
          {/* Top Header Section */}
          <div className="users-header-row">
            <div className="header-text-group">
              <h2 className="users-page-title">Manajemen Pengguna</h2>
              <p className="users-page-subtitle">Kelola akun pengguna dan atur hak akses sistem</p>
            </div>
            <button className="btn-tambah-pengguna" onClick={handleTambahPenggunaClick}>
              <PlusIcon />
              Tambah Pengguna
            </button>
          </div>

          {/* Search bar input row */}
          <div className="users-filter-row">
            <div className="users-search-container">
              <span className="search-icon-wrapper">
                <SearchIcon />
              </span>
              <input
                type="text"
                className="users-search-input"
                placeholder="Cari pengguna (username, email, nama lengkap)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Users List Table Card */}
          <div className="users-table-wrapper">
            <table className="users-table-el">
              <thead>
                <tr>
                  <th style={{ width: '150px' }}>Username</th>
                  <th style={{ width: '200px' }}>Nama Lengkap</th>
                  <th style={{ width: '220px' }}>Email</th>
                  <th style={{ width: '160px' }}>Role</th>
                  <th style={{ width: '70px' }}>Unit</th>
                  <th style={{ width: '90px' }}>Status</th>
                  <th style={{ width: '80px', textAlign: 'center' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '32px 0', color: '#64748b' }}>Memuat data pengguna...</td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '32px 0', color: '#64748b' }}>Tidak ada pengguna yang ditemukan.</td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id}>
                      <td style={{ fontWeight: '600', color: '#0f172a' }}>
                        {user.username}
                        {user.is_current && <span className="badge-current-user">Anda</span>}
                      </td>
                      <td style={{ color: '#1e293b' }}>{user.name}</td>
                      <td>{user.email}</td>
                      <td>
                        <span className={`role-badge ${getRoleBadgeClass(user.role)}`}>
                          {user.role}
                        </span>
                      </td>
                      <td>
                        {user.unit && user.unit !== '-' ? (
                          <span className="unit-badge">{user.unit}</span>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td>
                        <span className={user.status === 'Aktif' ? 'status-active' : 'status-inactive'}>
                          {user.status}
                        </span>
                      </td>
                      <td>
                        <div className="user-actions" style={{ justifyContent: 'center' }}>
                          <button className="btn-action-edit" onClick={() => handleEdit(user)} title="Edit Pengguna">
                            <EditIcon />
                          </button>
                          <button 
                            className={`btn-action-delete ${user.is_current ? 'disabled' : ''}`} 
                            onClick={() => handleDelete(user)} 
                            title="Hapus Pengguna"
                            disabled={user.is_current}
                          >
                            <DeleteIcon />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            <div className="users-table-footer">
              Total: {users.length} pengguna
            </div>
          </div>

          {/* Footer copyright */}
          <footer className="footer-copyright-text" style={{ marginTop: '40px' }}>
            © 2025 SIMAS - Sistem Informasi Manajemen Aset
          </footer>

          {/* MODAL 1: ADD USER FORM */}
          {isFormOpen && (
            <div className="modal-overlay-bg">
              <div className="modal-form-container">
                {/* Modal Header */}
                <div className="modal-header-row">
                  <h3 className="modal-header-title">{editingUser ? 'Edit Pengguna' : 'Tambah Pengguna'}</h3>
                  <button className="modal-close-btn" onClick={handleCloseForm} aria-label="Tutup">
                    <CloseIcon />
                  </button>
                </div>

                {/* Scrollable Form Body */}
                <form onSubmit={handleFormSubmit} className="modal-form-body">
                  <div className="modal-form-group">
                    <label className="modal-form-label">Username <span className="req-star">*</span></label>
                    <input
                      type="text"
                      className="modal-form-input"
                      required
                      value={formUsername}
                      onChange={(e) => setFormUsername(e.target.value)}
                      placeholder="contoh: adminunit"
                      autoComplete="new-username"
                    />
                  </div>

                  <div className="modal-form-group">
                    <label className="modal-form-label">Nama Lengkap <span className="req-star">*</span></label>
                    <input
                      type="text"
                      className="modal-form-input"
                      required
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="contoh: Budi Setiawan, S.Pd"
                    />
                  </div>

                  <div className="modal-form-group">
                    <label className="modal-form-label">Email <span className="req-star">*</span></label>
                    <input
                      type="email"
                      className="modal-form-input"
                      required
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      placeholder="contoh: budi@simas.sch.id"
                    />
                  </div>

                  <div className="modal-form-group">
                    <label className="modal-form-label">Role Akses <span className="req-star">*</span></label>
                    <select
                      className="modal-form-select"
                      required
                      value={formRole}
                      onChange={(e) => handleRoleChange(e.target.value)}
                    >
                      <option value="">Pilih Role Akses</option>
                      <option value="Administrator">Administrator</option>
                      <option value="Kepala Yayasan">Kepala Yayasan</option>
                      <option value="Admin SD">Admin SD</option>
                      <option value="Admin SMP">Admin SMP</option>
                      <option value="Admin SMA">Admin SMA</option>
                      <option value="Admin MA">Admin MA</option>
                      <option value="Petugas Perbaikan">Petugas Perbaikan</option>
                      <option value="Guru">Guru</option>
                    </select>
                  </div>

                  <div className="modal-form-group">
                    <label className="modal-form-label">Unit Kerja</label>
                    <select
                      className="modal-form-select"
                      value={formUnit}
                      onChange={(e) => setFormUnit(e.target.value)}
                    >
                      <option value="-">- (Yayasan / Global)</option>
                      <option value="SD">SD</option>
                      <option value="SMP">SMP</option>
                      <option value="SMA">SMA</option>
                      <option value="MA">MA</option>
                      <option value="TK">TK</option>
                    </select>
                  </div>

                  <div className="modal-form-group">
                    <label className="modal-form-label">Password {!editingUser && <span className="req-star">*</span>}</label>
                    <input
                      type="password"
                      className="modal-form-input"
                      required={!editingUser}
                      value={formPassword}
                      onChange={(e) => setFormPassword(e.target.value)}
                      placeholder={editingUser ? "Kosongkan jika tidak ingin diubah" : "Masukkan kata sandi awal"}
                      autoComplete="new-password"
                    />
                  </div>

                  <div className="modal-form-group">
                    <label className="modal-form-label">Status Akun</label>
                    <select
                      className="modal-form-select"
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value)}
                    >
                      <option value="Aktif">Aktif</option>
                      <option value="Non-Aktif">Non-Aktif</option>
                    </select>
                  </div>

                  {/* Hak Akses Menu Section */}
                  <div className="modal-form-group full-width">
                    <h4 className="access-rights-title">Hak Akses Menu</h4>
                    <p className="access-rights-subtitle">Pilih menu yang dapat diakses oleh pengguna ini</p>
                    <div className="access-rights-card">
                      <label className="access-checkbox-label">
                        <input
                          type="checkbox"
                          checked={formAccess.dashboard}
                          onChange={(e) => setFormAccess({ ...formAccess, dashboard: e.target.checked })}
                        />
                        <span>Dashboard</span>
                      </label>
                      <label className="access-checkbox-label">
                        <input
                          type="checkbox"
                          checked={formAccess.daftarAset}
                          onChange={(e) => setFormAccess({ ...formAccess, daftarAset: e.target.checked })}
                        />
                        <span>Daftar Aset</span>
                      </label>
                      <label className="access-checkbox-label">
                        <input
                          type="checkbox"
                          checked={formAccess.pengadaanAset}
                          onChange={(e) => setFormAccess({ ...formAccess, pengadaanAset: e.target.checked })}
                        />
                        <span>Pengadaan Aset</span>
                      </label>
                      <label className="access-checkbox-label">
                        <input
                          type="checkbox"
                          checked={formAccess.persetujuanPengadaan}
                          onChange={(e) => setFormAccess({ ...formAccess, persetujuanPengadaan: e.target.checked })}
                        />
                        <span>Persetujuan Pengadaan</span>
                      </label>
                      <label className="access-checkbox-label">
                        <input
                          type="checkbox"
                          checked={formAccess.perbaikanAset}
                          onChange={(e) => setFormAccess({ ...formAccess, perbaikanAset: e.target.checked })}
                        />
                        <span>Perbaikan Aset</span>
                      </label>
                      <label className="access-checkbox-label">
                        <input
                          type="checkbox"
                          checked={formAccess.manajemenPengguna}
                          onChange={(e) => setFormAccess({ ...formAccess, manajemenPengguna: e.target.checked })}
                        />
                        <span>Manajemen Pengguna</span>
                      </label>
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="modal-action-buttons-wrapper">
                    <button type="button" className="modal-btn-batal" onClick={handleCloseForm}>
                      Batal
                    </button>
                    <button type="submit" className="modal-btn-tambahan">
                      {editingUser ? 'Simpan Perubahan' : 'Simpan Pengguna'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* MODAL 2: SUCCESS DIALOG */}
          {isSuccessOpen && (
            <div className="modal-overlay-bg">
              <div className="modal-success-card">
                <div className="success-icon-wrapper">
                  <SuccessCheckmarkIcon />
                </div>

                <h3 className="success-modal-title">Terima kasih</h3>
                <p className="success-modal-subtitle">
                  {editingUser ? 'Pengguna berhasil diperbarui' : 'Pengguna baru berhasil ditambahkan'}
                </p>

                <button className="success-modal-ok-btn" onClick={handleSuccessOk}>
                  OK
                </button>
              </div>
            </div>
          )}

          {/* MODAL 3: DELETE CONFIRM DIALOG */}
          {isDeleteConfirmOpen && userToDelete && (
            <div className="modal-overlay-bg" onClick={handleCancelDelete}>
              <div className="modal-delete-confirm-card" onClick={(e) => e.stopPropagation()}>
                <h3 className="delete-confirm-title">Konfirmasi Hapus Akun</h3>
                <p className="delete-confirm-body">
                  Apakah Anda yakin ingin menghapus akun{' '}
                  <strong className="delete-confirm-name">{userToDelete.name}</strong>?
                </p>
                <div className="delete-confirm-actions">
                  <button
                    className="delete-btn-batal"
                    onClick={handleCancelDelete}
                  >
                    Batal
                  </button>
                  <button
                    className="delete-btn-hapus"
                    onClick={handleConfirmDelete}
                  >
                    Hapus
                  </button>
                </div>
              </div>
            </div>
          )}
      </main>
    </DashboardLayout>
  );
}
