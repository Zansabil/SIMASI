import React from 'react';
import ProcurementListPage from '../../components/procurement/ProcurementListPage';

export default function PetugasPengadaanAset() {
  return (
    <ProcurementListPage
      role="petugas-perbaikan"
      currentPath="/petugas-perbaikan/pengadaan"
      hasWriteAccess={true}
    />
  );
}
