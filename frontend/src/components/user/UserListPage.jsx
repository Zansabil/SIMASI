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
import './UserListPage.css';

const getRoleDefaultAccess = (role) => {
  switch (role) {
    case 'Super Admin':
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
    case 'Admin':
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
    role: 'Admin',
    unit: 'SD',
    status: 'Aktif',
    is_current: false,
    access: getRoleDefaultAccess('Admin')
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
  const [statusModal, setStatusModal] = useState({ isOpen: false, type: 'success', title: '', message: '' });
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
          `${API_BASE_URL}/api/pengguna`,
          config
        );

        if (response.data && Array.isArray(response.data.data)) {
          // Filter out locally if search query exists (or we can pass ?search=...)
          let rawData = response.data.data;
          if (searchQuery) {
            const q = searchQuery.toLowerCase();
            rawData = rawData.filter(u => 
              (u.nama_pengguna && u.nama_pengguna.toLowerCase().includes(q)) || 
              (u.email && u.email.toLowerCase().includes(q)) || 
              (u.nama && u.nama.toLowerCase().includes(q))
            );
          }

          const mapped = rawData.map(u => {
            let mappedRole = 'Super Admin';
            if (u.id_peran === 1) mappedRole = 'Super Admin';
            else if (u.id_peran === 2) mappedRole = 'Kepala Yayasan';
            else if (u.id_peran === 3) mappedRole = 'Admin';
            else if (u.id_peran === 4) mappedRole = 'Guru';
            else if (u.id_peran === 5) mappedRole = 'Petugas Perbaikan';
            
            let mappedAccess = getRoleDefaultAccess(mappedRole);

            return {
              id: u.id,
              username: u.nama_pengguna || u.email.split('@')[0],
              name: u.nama,
              email: u.email,
              role: mappedRole,
              unit: u.area || '-',
              status: u.status_aktif ? 'Aktif' : 'Non-Aktif',
              is_current: u.nama === userName,
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
      setStatusModal({ isOpen: true, type: 'error', title: 'Tidak Diizinkan', message: 'Anda tidak dapat menghapus akun Anda sendiri yang sedang aktif digunakan.' });
      return;
    }
    setUserToDelete(user);
    setIsDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    try {
      const token = localStorage.getItem('auth_token');
      await axios.delete(`${API_BASE_URL}/api/pengguna/${userToDelete.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      console.warn('Backend API error, deleting user locally for presentation.', err);
    }
    setAllUsers(prev => prev.filter(item => item.id !== userToDelete.id));
    setIsDeleteConfirmOpen(false);
    setUserToDelete(null);
    setStatusModal({ isOpen: true, type: 'success', title: 'Berhasil', message: 'Pengguna berhasil dihapus.' });
  };

  const handleTambahPenggunaClick = () => {
    setEditingUser(null);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    let id_peran = 1;
    if (formData.role === 'Super Admin' || formData.role === 'Administrator') id_peran = 1;
    else if (formData.role === 'Kepala Yayasan') id_peran = 2;
    else if (formData.role === 'Petugas Perbaikan') id_peran = 5;
    else if (formData.role === 'Guru') id_peran = 4;
    else if (formData.role === 'Admin') id_peran = 3;

    const payload = {
      nama: formData.name,
      email: formData.email,
      nama_pengguna: formData.username,
      id_peran: id_peran,
      area: formData.unit && formData.unit !== '-' ? formData.unit : null,
      status_aktif: formData.status === 'Aktif' ? 1 : 0
    };
    if (formData.password) {
      payload.password = formData.password;
    }

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

        const response = await axios.put(`${API_BASE_URL}/api/pengguna/${editingUser.id}`, payload, config);

        if (response.data && response.data.data) {
          const u = response.data.data;
          const mappedRole = u.id_peran === 1 ? 'Super Admin' : (u.id_peran === 2 ? 'Kepala Yayasan' : (u.id_peran === 5 ? 'Petugas Perbaikan' : (u.id_peran === 4 ? 'Guru' : 'Admin')));
          const mappedUser = {
            id: u.id,
            username: u.nama_pengguna,
            name: u.nama,
            email: u.email,
            role: mappedRole,
            unit: u.area || '-',
            status: u.status_aktif ? 'Aktif' : 'Non-Aktif',
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

        const response = await axios.post(`${API_BASE_URL}/api/pengguna`, payload, config);

        if (response.data && response.data.data) {
          const u = response.data.data;
          const mappedRole = u.id_peran === 1 ? 'Super Admin' : (u.id_peran === 2 ? 'Kepala Yayasan' : (u.id_peran === 5 ? 'Petugas Perbaikan' : (u.id_peran === 4 ? 'Guru' : 'Admin')));
          const mappedUser = {
            id: u.id,
            username: u.nama_pengguna,
            name: u.nama,
            email: u.email,
            role: mappedRole,
            unit: u.area || '-',
            status: u.status_aktif ? 'Aktif' : 'Non-Aktif',
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
    setStatusModal({ isOpen: true, type: 'success', title: 'Terima kasih', message: editingUser ? "Pengguna berhasil diperbarui" : "Pengguna baru berhasil ditambahkan" });
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
          © {new Date().getFullYear()} SIMAS - Sistem Informasi Manajemen Aset
        </footer>

        {/* Form Modal */}
        <UserFormModal
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSubmit={handleFormSubmit}
          editingUser={editingUser}
        />

        {/* Delete Confirmation Modal */}
        <StatusModal
          isOpen={isDeleteConfirmOpen}
          type="confirm"
          title="Konfirmasi Hapus"
          message={`Apakah Anda yakin ingin menghapus pengguna "${userToDelete?.name}" secara permanen?`}
          confirmText="Ya, Hapus"
          cancelText="Batal"
          onConfirm={handleConfirmDelete}
          onCancel={() => setIsDeleteConfirmOpen(false)}
        />

        {/* Status Alert Modal */}
        <StatusModal
          isOpen={statusModal.isOpen}
          type={statusModal.type}
          title={statusModal.title}
          message={statusModal.message}
          onConfirm={() => setStatusModal({ ...statusModal, isOpen: false })}
          confirmText={statusModal.type === 'error' ? 'Tutup' : 'OK'}
        />
      </main>
    </DashboardLayout>
  );
}
