import React from 'react';
import RepairListPage from '../../components/repair/RepairListPage';

export default function YayasanPerbaikanAset() {
  return (
    <RepairListPage
      role="kepala-yayasan"
      hasWriteAccess={false}
      hasStaffAccess={false}
      currentPath="/kepala-yayasan/perbaikan"
    />
  );
}
