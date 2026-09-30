import React from 'react';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';

const getRoleBadgeClass = (role) => {
  switch (role) {
    case 'Super Admin':
    case 'Administrator':
      return 'role-admin';
    case 'Kepala Yayasan':
      return 'role-yayasan';
    case 'Admin':
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

export default function UserTable({ users, isLoading, onEdit, onDelete }) {
  return (
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
              <td colSpan="7" style={{ textAlign: 'center', padding: '32px 0', color: '#64748b' }}>
                Memuat data pengguna...
              </td>
            </tr>
          ) : users.length === 0 ? (
            <tr>
              <td colSpan="7" style={{ textAlign: 'center', padding: '32px 0', color: '#64748b' }}>
                Tidak ada pengguna yang ditemukan.
              </td>
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
                    <button 
                      className="btn-action-edit" 
                      onClick={() => onEdit(user)} 
                      title="Edit Pengguna"
                      aria-label="Edit Pengguna"
                    >
                      <FiEdit2 size={16} color="#f59e0b" strokeWidth={2.5} />
                    </button>
                    <button 
                      className={`btn-action-delete ${user.is_current ? 'disabled' : ''}`} 
                      onClick={() => onDelete(user)} 
                      title="Hapus Pengguna"
                      aria-label="Hapus Pengguna"
                      disabled={user.is_current}
                    >
                      <FiTrash2 size={16} color={user.is_current ? '#cbd5e1' : '#ef4444'} strokeWidth={2.5} />
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
  );
}
