import React from 'react';
import AssetListPage from '../../components/asset/AssetListPage';

export default function DaftarAset() {
  return (
    <AssetListPage
      role="admin"
      hasWriteAccess={true}
      currentPath="/admin/daftar-aset"
    />
  );
}
