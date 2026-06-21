/**
 * Memeriksa apakah terdapat perbedaan nilai antara objek form saat ini dengan objek acuan (original/default).
 * Mengembalikan true jika ada perbedaan (form kotor/dirty), dan false jika sama (form bersih/clean).
 * 
 * @param {Object} current - Objek state form saat ini (key-value)
 * @param {Object} reference - Objek nilai pembanding/acuan (key-value)
 * @returns {boolean}
 */
export function checkValuesDirty(current, reference) {
  if (!current || !reference) return false;

  return Object.keys(current).some(key => {
    let currVal = current[key];
    let refVal = reference[key];

    // Normalisasi nilai null/undefined menjadi string kosong
    if (currVal === null || currVal === undefined) currVal = '';
    if (refVal === null || refVal === undefined) refVal = '';

    // Normalisasi string untuk perbandingan toleran spasi dan huruf besar/kecil
    if (typeof currVal === 'string' && typeof refVal === 'string') {
      // Khusus untuk field 'condition' / 'kondisi', bandingkan case-insensitive
      if (key.toLowerCase().includes('condition') || key.toLowerCase().includes('kondisi')) {
        return currVal.toLowerCase().trim() !== refVal.toLowerCase().trim();
      }
      return currVal.trim() !== refVal.trim();
    }

    return currVal.toString() !== refVal.toString();
  });
}
