import React from 'react';
import UserListPage from '../../components/user/UserListPage';

export default function SuperManajemenPengguna() {
  return (
    <UserListPage
      role="super-admin"
      currentPath="/super-admin/manajemen-pengguna"
    />
  );
}
