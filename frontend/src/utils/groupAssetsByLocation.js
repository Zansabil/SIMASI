export const UNKNOWN_LOCATION = 'Tidak Diketahui';

/**
 * Mengelompokkan daftar aset berdasarkan kombinasi Unit dan Ruangannya (Unit - Ruangan)
 * dan mengurutkannya secara alfabetis.
 * Fungsi ini juga melakukan pembersihan spasi (trim) dan normalisasi huruf kapital.
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
    const loc = rawLoc && rawLoc !== '-' ? rawLoc : UNKNOWN_LOCATION;
    
    // Normalisasi ruangan ke Title Case (Huruf besar di awal kata, sisanya huruf kecil)
    const cleanLoc = loc
      .split(/\s+/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');

    // Ambil nama unit jika tersedia
    const unitName = asset.unit && asset.unit !== '-' ? asset.unit.trim() : '';

    let groupKey = cleanLoc;
    if (unitName) {
      // Jika nama ruangan belum memuat nama unit di awal, gabungkan menjadi "[Unit] - [Ruangan]"
      if (!cleanLoc.toLowerCase().startsWith(unitName.toLowerCase())) {
        groupKey = `${unitName} - ${cleanLoc}`;
      }
    }

    if (!acc[groupKey]) acc[groupKey] = [];
    acc[groupKey].push(asset);
    return acc;
  }, {});

  return Object.entries(grouped).sort(([a], [b]) => 
    a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })
  );
}
