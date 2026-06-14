import React from 'react';
import ProfilePage from '../../components/profile/ProfilePage';

export default function Profile() {
  return (
    <ProfilePage
      role="kepala-yayasan"
      defaultRoleName="Kepala Yayasan"
      currentPath="/kepala-yayasan/profile"
    />
  );
}
