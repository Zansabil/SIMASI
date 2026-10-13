import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../config';
import DashboardLayout from '../layout/DashboardLayout';
import PageHeader from '../ui/PageHeader';
import SearchBar from '../ui/SearchBar';
import StatusModal from '../ui/StatusModal';
import UserTable from './UserTable';
import UserFormModal from './UserFormModal';
import Pagination from '../asset/Pagination';
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

  const [allUsers, setAllUsers] = useState([]);
  const [users, setUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Check login authentication
  useEffect(() => {
    const storedName = localStorage.getItem('user_name');
    if (storedName) {
      setUserName(storedName);
    }
  }, []);

  // Reset pagination saat pencarian berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Fetch users from API
  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json'
        }
      };

      const response = await axios.get(
        `${API_BASE_URL}/api/pengguna`,
        config
      );

      if (response.data && Array.isArray(response.data.data)) {
        let rawData = response.data.data;
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          rawData = rawData.filter(u => 
            (u.nama_pengguna && u.nama_pengguna.toLowerCase().includes(q)) || 
            (u.email && u.email.toLowerCase().includes(q)) || 
            (u.nama && u.nama.toLowerCase().includes(q))
          );
        }

        const currentUserId = localStorage.getItem('user_id');
        const mapped = rawData.map(u => {
          let mappedRole = 'Super Admin';
          if (u.id_peran === 1) mappedRole = 'Super Admin';
          else if (u.id_peran === 2) mappedRole = 'Kepala Yayasan';
          else if (u.id_peran === 3) mappedRole = 'Admin';
          else if (u.id_peran === 4) mappedRole = 'Petugas Perbaikan';
          else if (u.id_peran === 5) mappedRole = 'Guru';
          
          let mappedAccess = getRoleDefaultAccess(mappedRole);
          const isCurrent = (currentUserId && String(u.id) === String(currentUserId)) || (u.nama === userName);

          return {
            id: u.id,
            username: u.nama_pengguna || (u.email ? u.email.split('@')[0] : 'user'),
            name: u.nama || 'Tanpa Nama',
            email: u.email || '-',
            role: mappedRole,
            unit: u.area || 'Yayasan / Global',
            status: u.status_aktif ? 'Aktif' : 'Non-Aktif',
            is_current: isCurrent,
            access: mappedAccess
          };
        });
        setUsers(mapped);
        setAllUsers(mapped);
      } else {
        setUsers([]);
        setAllUsers([]);
      }
    } catch (err) {
      console.error("Fetch Users Error Detail:", err);
      setUsers([]);
      setAllUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [searchQuery, userName]);

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
      setAllUsers(prev => prev.filter(item => item.id !== userToDelete.id));
      setUsers(prev => prev.filter(item => item.id !== userToDelete.id));
      setStatusModal({ isOpen: true, type: 'success', title: 'Berhasil', message: 'Pengguna berhasil dihapus.' });
    } catch (err) {
      console.error("Backend API error:", err);
      const errMsg = err.response?.data?.message || "Gagal menghapus pengguna dari server.";
      setStatusModal({ isOpen: true, type: 'error', title: 'Gagal', message: errMsg });
    } finally {
      setIsDeleteConfirmOpen(false);
      setUserToDelete(null);
    }
  };

  const handleTambahPenggunaClick = () => {
    setEditingUser(null);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    let id_peran = 1;
    if (formData.role === 'Administrator' || formData.role === 'Super Admin') id_peran = 1;
    else if (formData.role === 'Kepala Yayasan') id_peran = 2;
    else if (formData.role === 'Petugas Perbaikan') id_peran = 4;
    else if (formData.role === 'Guru') id_peran = 5;
    else if (formData.role === 'Admin' || formData.role.startsWith('Admin')) id_peran = 3;

    const payload = {
      nama: formData.name,
      email: formData.email,
      nama_pengguna: formData.username,
      id_peran: id_peran,
      area: formData.unit && formData.unit !== 'Yayasan / Global' ? formData.unit : null,
      status_aktif: formData.status === 'Aktif' ? 1 : 0
    };
    if (formData.password) {
      payload.password = formData.password;
    }

    if (editingUser) {
      // Edit Mode
      try {
        const token = localStorage.getItem('auth_token');
        const config = {
          headers: {
            Authorization: `Bearer ${token}`
          }
        };

        const response = await axios.patch(`${API_BASE_URL}/api/pengguna/${editingUser.id}`, payload, config);

        if (response.data && response.data.data) {
          const u = response.data.data;
          const mappedRole = u.id_peran === 1 ? 'Super Admin' : (u.id_peran === 2 ? 'Kepala Yayasan' : (u.id_peran === 4 ? 'Petugas Perbaikan' : (u.id_peran === 5 ? 'Guru' : 'Admin')));
          const mappedUser = {
            id: u.id,
            username: u.nama_pengguna,
            name: u.nama,
            email: u.email,
            role: mappedRole,
            unit: u.area || 'Yayasan / Global',
            status: u.status_aktif ? 'Aktif' : 'Non-Aktif',
            is_current: editingUser.is_current,
            access: { ...formData.access }
          };
          setAllUsers(prev => prev.map(item => item.id === editingUser.id ? mappedUser : item));
          setUsers(prev => prev.map(item => item.id === editingUser.id ? mappedUser : item));

          if (editingUser.is_current) {
            localStorage.setItem('user_name', u.nama);
            localStorage.setItem('user_email', u.email);
            localStorage.setItem('user_username', u.nama_pengguna);
            const roleSlug = mappedRole === 'Super Admin' ? 'super-admin' : (mappedRole === 'Kepala Yayasan' ? 'kepala-yayasan' : (mappedRole === 'Petugas Perbaikan' ? 'petugas-perbaikan' : (mappedRole === 'Guru' ? 'guru' : 'admin')));
            localStorage.setItem('user_role', roleSlug);
          }
        }
        await fetchUsers();
      } catch (err) {
        console.error("Backend API error:", err);
        throw err;
      }
    } else {
      // Add Mode
      try {
        const token = localStorage.getItem('auth_token');
        const config = {
          headers: {
            Authorization: `Bearer ${token}`
          }
        };

        await axios.post(`${API_BASE_URL}/api/pengguna`, payload, config);
        await fetchUsers();
      } catch (err) {
        console.error("Backend API error:", err);
        throw err;
      }
    }

    setIsFormOpen(false);
    setStatusModal({ isOpen: true, type: 'success', title: 'Berhasil', message: editingUser ? "Data pengguna berhasil diperbarui" : "Pengguna baru berhasil ditambahkan" });
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
          users={users.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)}
          isLoading={isLoading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
        {!isLoading && users.length > 0 && (
          <Pagination
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={(val) => { setItemsPerPage(val); setCurrentPage(1); }}
            hasMore={(currentPage * itemsPerPage) < users.length}
            totalPages={Math.ceil(users.length / itemsPerPage)}
            totalItems={users.length}
          />
        )}

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
