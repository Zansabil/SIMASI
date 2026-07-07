export const UNKNOWN_LOCATION = 'Tidak Diketahui';

/**
 * Mengelompokkan daftar aset berdasarkan lokasinya dan mengurutkannya secara alfabetis.
 * Fungsi ini juga melakukan pembersihan spasi (trim) dan normalisasi huruf kapital (Title Case).
 * 
 * @param {Array} assets - Daftar aset mentah dari backend
 * @returns {Array} Array berisi pasangan entry [location, items] yang terurut secara alfabetis
 */
export function groupAssetsByLocation(assets) {
  if (!assets || !Array.isArray(assets)) {
    return [];
  }

  const grouped = assets.reduce((acc, asset) => {
    const rawLoc = asset.location ? asset.location.trim() : '';
    const loc = rawLoc || UNKNOWN_LOCATION;
    
    // Normalisasi ke Title Case (Huruf besar di awal kata, sisanya huruf kecil)
    const cleanLoc = loc
      .split(/\s+/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');

    if (!acc[cleanLoc]) acc[cleanLoc] = [];
    acc[cleanLoc].push(asset);
    return acc;
  }, {});

  return Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b));
}
