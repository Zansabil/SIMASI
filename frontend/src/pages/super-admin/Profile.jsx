import React from 'react';
import ProfilePage from '../../components/profile/ProfilePage';

export default function Profile() {
  return (
    <ProfilePage
      role="super-admin"
      defaultRoleName="Super Admin"
      currentPath="/super-admin/profile"
    />
  );
}
