import React from 'react';
import AssetListPage from '../../components/asset/AssetListPage';

export default function DaftarAset() {
  return (
    <AssetListPage
      role="kepala-yayasan"
      hasWriteAccess={false}
      currentPath="/kepala-yayasan/daftar-aset"
    />
  );
}
