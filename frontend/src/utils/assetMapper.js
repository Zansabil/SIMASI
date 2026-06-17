/**
 * Mengubah data tunggal dari format Laravel (API) ke format React (state)
 */
export const mapLaravelToReact = (item) => {
  if (!item) return null;
  const combinedLocation = item.unit && item.ruangan 
    ? `${item.unit} - ${item.ruangan}` 
    : (item.unit || item.ruangan || '');
  return {
    id: item.id,
    name: item.nama_aset,
    asset_code: item.kode_inventaris,
    location: combinedLocation,
    quantity: item.jumlah_aset,
    condition: item.kondisi_aset,
    source_of_funds: item.sumber_dana || item.source_of_funds || 'Dana Yayasan',
    price: item.harga_aset || item.price || 0,
    image_path: item.foto || item.image_path || null,
    unit: item.unit || '',
    room: item.ruangan || ''
  };
};

/**
 * Mengubah array data dari format Laravel ke format React
 */
export const mapLaravelListToReact = (list) => {
  if (!Array.isArray(list)) return [];
  return list.map(mapLaravelToReact).filter(Boolean);
};

/**
 * Mengubah format React (Form/State) ke format Request Payload yang dipahami Laravel
 */
export const mapReactToLaravel = (formData, existingAssetCode = null) => {
  const parsedPrice = typeof formData.price === 'string' 
    ? Number(formData.price.replace(/\D/g, '')) 
    : Number(formData.price);
  
  const resolvedDate = formData.purchaseDate || new Date().toISOString().split('T')[0];

  return {
    kode_inventaris: formData.code || existingAssetCode,
    nama_aset: formData.name,
    jenis_aset: 'Umum',
    unit: formData.unit,
    ruangan: formData.room,
    jumlah_aset: Number(formData.quantity) || 1,
    kondisi_aset: formData.condition,
    tgl_diperoleh: resolvedDate,
    harga_aset: parsedPrice,
    sumber_dana: formData.source,
    foto: formData.image || null
  };
};
