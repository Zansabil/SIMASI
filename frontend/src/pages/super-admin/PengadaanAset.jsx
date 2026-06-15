import React from 'react';
import ProcurementListPage from '../../components/procurement/ProcurementListPage';

export default function SuperPengadaanAset() {
  return (
    <ProcurementListPage
      role="super-admin"
      currentPath="/super-admin/pengadaan"
      hasWriteAccess={true}
    />
  );
}
