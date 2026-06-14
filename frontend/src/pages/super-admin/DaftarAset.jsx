import React from 'react';
import AssetListPage from '../../components/asset/AssetListPage';

export default function DaftarAset() {
  return (
    <AssetListPage
      role="super-admin"
      hasWriteAccess={true}
      currentPath="/super-admin/daftar-aset"
    />
  );
}
