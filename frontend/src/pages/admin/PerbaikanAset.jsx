import React from 'react';
import RepairListPage from '../../components/repair/RepairListPage';

export default function PerbaikanAset() {
  return (
    <RepairListPage
      role="admin"
      hasWriteAccess={true}
      hasStaffAccess={false}
      currentPath="/admin/perbaikan"
    />
  );
}
