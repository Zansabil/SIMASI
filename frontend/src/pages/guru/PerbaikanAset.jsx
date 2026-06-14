import React from 'react';
import RepairListPage from '../../components/repair/RepairListPage';

export default function GuruPerbaikanAset() {
  return (
    <RepairListPage
      role="guru"
      hasWriteAccess={true}
      hasStaffAccess={false}
      currentPath="/guru/perbaikan"
    />
  );
}
