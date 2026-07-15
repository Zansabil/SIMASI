/**
 * Mengubah data tunggal dari format Laravel (API) ke format React (state)
 */
export const mapAssetResponse = (item) => {
  if (!item) return null;
  return {
    ...item,
    id: item.id,
    name: item.nama_aset,
    asset_code: item.kode_inventaris,
    location: item.ruangan?.nama_ruangan || item.lokasi_aset || '-',
    unit: item.lokasi_unit?.nama_unit || item.lokasiUnit?.nama_unit || '-',
    quantity: item.jumlah_aset,
    condition: item.kondisi_aset,
    source_of_funds: item.sumber_dana || item.source_of_funds || 'Dana Yayasan',
    price: item.harga_aset || item.price || 0,
    image_path: item.foto || item.image_path
  };
};

/**
 * Mengubah array data dari format Laravel ke format React
 */
export const mapAssetListResponse = (list) => {
  if (!Array.isArray(list)) return [];
  return list.map(mapAssetResponse).filter(Boolean);
};

/**
 * Mengubah format React (Form/State) ke format Request Payload yang dipahami Laravel
 */
export const mapAssetForRequest = (formData, existingAssetCode = null) => {
  const parsedPrice = typeof formData.price === 'string' 
    ? Number(formData.price.replace(/\D/g, '')) 
    : Number(formData.price);
  
  const resolvedDate = formData.purchaseDate || new Date().toISOString().split('T')[0];

  return {
    kode_inventaris: formData.code || existingAssetCode,
    nama_aset: formData.name,
    jenis_aset: formData.category || 'Umum',
    id_unit: formData.unit,
    id_ruangan: formData.room,
    lokasi_aset: formData.location, // still passing location just in case
    jumlah_aset: Number(formData.quantity) || 1,
    kondisi_aset: formData.condition,
    tgl_diperoleh: resolvedDate,
    harga_aset: parsedPrice,
    sumber_dana: formData.source,
    foto: formData.image,
  };
};
