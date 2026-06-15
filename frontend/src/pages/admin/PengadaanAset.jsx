import React from 'react';
import ProcurementListPage from '../../components/procurement/ProcurementListPage';

export default function AdminPengadaanAset() {
  return (
    <ProcurementListPage
      role="admin"
      currentPath="/admin/pengadaan"
      hasWriteAccess={true}
    />
  );
}
