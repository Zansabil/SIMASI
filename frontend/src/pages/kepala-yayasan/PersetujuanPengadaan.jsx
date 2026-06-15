import React from 'react';
import ProcurementListPage from '../../components/procurement/ProcurementListPage';

export default function PersetujuanPengadaan() {
  return (
    <ProcurementListPage
      role="kepala-yayasan"
      currentPath="/kepala-yayasan/persetujuan"
      hasWriteAccess={false}
      hasApprovalAccess={true}
    />
  );
}
