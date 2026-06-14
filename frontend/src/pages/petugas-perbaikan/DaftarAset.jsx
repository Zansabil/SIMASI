import React from 'react';
import AssetListPage from '../../components/asset/AssetListPage';

export default function DaftarAset() {
  return (
    <AssetListPage
      role="petugas-perbaikan"
      hasWriteAccess={true}
      currentPath="/petugas-perbaikan/daftar-aset"
    />
  );
}
