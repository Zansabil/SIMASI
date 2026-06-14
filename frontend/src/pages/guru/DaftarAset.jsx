import React from 'react';
import AssetListPage from '../../components/asset/AssetListPage';

export default function DaftarAset() {
  return (
    <AssetListPage
      role="guru"
      hasWriteAccess={false}
      currentPath="/guru/daftar-aset"
    />
  );
}
