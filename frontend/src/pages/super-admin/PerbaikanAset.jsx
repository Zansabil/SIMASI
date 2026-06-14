import React from 'react';
import RepairListPage from '../../components/repair/RepairListPage';

export default function SuperPerbaikanAset() {
  return (
    <RepairListPage
      role="super-admin"
      hasWriteAccess={true}
      hasStaffAccess={false}
      currentPath="/super-admin/perbaikan"
    />
  );
}
