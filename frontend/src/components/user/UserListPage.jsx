import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../config';
import { FiPlus } from 'react-icons/fi';
import DashboardLayout from '../layout/DashboardLayout';
import PageHeader from '../ui/PageHeader';
import SearchBar from '../ui/SearchBar';
import StatusModal from '../ui/StatusModal';
import UserTable from './UserTable';
import UserFormModal from './UserFormModal';
import UserDeleteModal from './UserDeleteModal';
import './UserListPage.css';

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

export default function UserListPage({ role, currentPath }) {
  const [userName, setUserName] = useState('User');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [editingUser, setEditingUser] = useState(null);

  const [allUsers, setAllUsers] = useState(initialMockUsers);
  const [users, setUsers] = useState(initialMockUsers);

  // Check login authentication
  useEffect(() => {
    const storedName = localStorage.getItem('user_name');
    if (storedName) {
      setUserName(storedName);
    }
  }, []);

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
          `${API_BASE_URL}/api/users?search=${searchQuery}`,
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
      await axios.delete(`${API_BASE_URL}/api/users/${userToDelete.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      console.warn('Backend API error, deleting user locally for presentation.', err);
    }
    setAllUsers(prev => prev.filter(item => item.id !== userToDelete.id));
    setIsDeleteConfirmOpen(false);
    setUserToDelete(null);
  };

  const handleTambahPenggunaClick = () => {
    setEditingUser(null);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    const roleValue = formData.role === 'Administrator' ? 'super-admin' : (formData.role === 'Kepala Yayasan' ? 'kepala-yayasan' : (formData.role === 'Petugas Perbaikan' ? 'petugas-perbaikan' : (formData.role === 'Guru' ? 'guru' : 'admin')));

    if (editingUser) {
      // Edit Mode
      const updatedUser = {
        ...editingUser,
        username: formData.username,
        name: formData.name,
        email: formData.email,
        role: formData.role,
        unit: formData.unit,
        status: formData.status,
        access: { ...formData.access }
      };

      try {
        const token = localStorage.getItem('auth_token');
        const config = {
          headers: {
            Authorization: `Bearer ${token}`
          }
        };

        const response = await axios.put(`${API_BASE_URL}/api/users/${editingUser.id}`, {
          name: formData.name,
          email: formData.email,
          username: formData.username,
          password: formData.password || undefined,
          role: roleValue,
          unit_kerja: formData.unit,
          permissions: JSON.stringify(formData.access)
        }, config);

        if (response.data && response.data.user) {
          const u = response.data.user;
          const mappedUser = {
            id: u.id,
            username: u.username,
            name: u.name,
            email: u.email,
            role: formData.role,
            unit: u.unit_kerja || '-',
            status: formData.status,
            is_current: editingUser.is_current,
            access: { ...formData.access }
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
        username: formData.username,
        name: formData.name,
        email: formData.email,
        role: formData.role || 'Administrator',
        unit: formData.unit || '-',
        status: formData.status,
        is_current: false,
        access: { ...formData.access }
      };

      try {
        const token = localStorage.getItem('auth_token');
        const config = {
          headers: {
            Authorization: `Bearer ${token}`
          }
        };

        const response = await axios.post(`${API_BASE_URL}/api/users`, {
          name: formData.name,
          email: formData.email,
          username: formData.username,
          password: formData.password,
          role: roleValue,
          unit_kerja: formData.unit,
          permissions: JSON.stringify(formData.access)
        }, config);

        if (response.data && response.data.user) {
          const u = response.data.user;
          const mappedUser = {
            id: u.id,
            username: u.username,
            name: u.name,
            email: u.email,
            role: formData.role,
            unit: u.unit_kerja || '-',
            status: 'Aktif',
            is_current: false,
            access: { ...formData.access }
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

  const PlusIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M12 5v14" />
    </svg>
  );

  return (
    <DashboardLayout role={role} currentPath={currentPath}>
      <main className="dashboard-body">
        {/* Top Header Section */}
        <PageHeader
          title="Manajemen Pengguna"
          subtitle="Kelola akun pengguna dan atur hak akses sistem"
          actionLabel="Tambah Pengguna"
          onActionClick={handleTambahPenggunaClick}
          actionIcon={PlusIcon}
          actionClassName="btn-tambah-pengguna"
        >
          {/* Search bar input row */}
          <div className="users-filter-row">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Cari pengguna (username, email, nama lengkap)..."
            />
          </div>
        </PageHeader>

        {/* Users List Table Card */}
        <UserTable
          users={users}
          isLoading={isLoading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        {/* Footer copyright */}
        <footer className="footer-copyright-text" style={{ marginTop: '40px' }}>
          © 2025 SIMAS - Sistem Informasi Manajemen Aset
        </footer>

        {/* Form Modal */}
        <UserFormModal
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSubmit={handleFormSubmit}
          editingUser={editingUser}
        />

        {/* Delete Confirmation Modal */}
        <UserDeleteModal
          isOpen={isDeleteConfirmOpen}
          onClose={() => setIsDeleteConfirmOpen(false)}
          onConfirm={handleConfirmDelete}
          user={userToDelete}
        />

        {/* Success Alert Modal */}
        <StatusModal
          isOpen={isSuccessOpen}
          type="success"
          title="Terima kasih"
          message={editingUser ? "Pengguna berhasil diperbarui" : "Pengguna baru berhasil ditambahkan"}
          onConfirm={() => setIsSuccessOpen(false)}
        />
      </main>
    </DashboardLayout>
  );
}
