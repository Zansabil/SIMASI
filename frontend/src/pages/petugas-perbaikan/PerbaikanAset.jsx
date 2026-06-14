import React from 'react';
import RepairListPage from '../../components/repair/RepairListPage';

export default function PetugasPerbaikanAset() {
  return (
    <RepairListPage
      role="petugas-perbaikan"
      hasWriteAccess={false}
      hasStaffAccess={true}
      currentPath="/petugas-perbaikan/perbaikan"
    />
  );
}
