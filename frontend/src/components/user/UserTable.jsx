import React from 'react';

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
                      <EditIcon />
                    </button>
                    <button 
                      className={`btn-action-delete ${user.is_current ? 'disabled' : ''}`} 
                      onClick={() => onDelete(user)} 
                      title="Hapus Pengguna"
                      aria-label="Hapus Pengguna"
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
  );
}
