import React from 'react';
import ProcurementListPage from '../../components/procurement/ProcurementListPage';

export default function GuruPengadaanAset() {
  return (
    <ProcurementListPage
      role="guru"
      currentPath="/guru/pengadaan"
      hasWriteAccess={true}
    />
  );
}
