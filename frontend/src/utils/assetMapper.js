/**
 * Mengubah data tunggal dari format Laravel (API) ke format React (state)
 */
export const mapLaravelToReact = (item) => {
  if (!item) return null;
  const roomName = typeof item.ruangan === 'object' && item.ruangan !== null 
    ? item.ruangan.nama_ruangan 
    : (item.ruangan || '');
    
  const unitName = typeof item.lokasi_unit === 'object' && item.lokasi_unit !== null 
    ? item.lokasi_unit.nama_unit 
    : (item.unit || '');
  
  const combinedLocation = unitName && roomName 
    ? `${unitName} - ${roomName}` 
    : (unitName || roomName || '');
    
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
    unit_id: item.id_unit || '',
    unit: unitName,
    room_id: item.id_ruangan || '',
    room_name: roomName,
    category: item.jenis_aset || 'Umum',
    purchase_date: item.tgl_diperoleh || ''
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
    jenis_aset: formData.category || 'Umum',
    id_unit: formData.unit, // unit is now the id_unit from the select
    id_ruangan: formData.room, // room is now the id_ruangan from the select
    jumlah_aset: Number(formData.quantity) || 1,
    kondisi_aset: formData.condition,
    tgl_diperoleh: resolvedDate,
    harga_aset: parsedPrice,
    sumber_dana: formData.source,
    foto: formData.image || null
  };
};
