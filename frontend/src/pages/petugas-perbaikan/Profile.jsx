import React from 'react';
import ProfilePage from '../../components/profile/ProfilePage';

export default function Profile() {
  return (
    <ProfilePage
      role="petugas-perbaikan"
      defaultRoleName="Petugas Perbaikan"
      currentPath="/petugas-perbaikan/profile"
    />
  );
}
