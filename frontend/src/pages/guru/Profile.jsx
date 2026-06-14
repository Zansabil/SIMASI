import React from 'react';
import ProfilePage from '../../components/profile/ProfilePage';

export default function Profile() {
  return (
    <ProfilePage
      role="guru"
      defaultRoleName="Guru"
      currentPath="/guru/profile"
    />
  );
}
