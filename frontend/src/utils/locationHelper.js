/**
 * Memecah data lokasi menjadi unit dan ruangan terpisah.
 * Mendukung input berupa objek aset (dari API) maupun string lokasi langsung secara fleksibel.
 * 
 * @param {Object|string} input - Objek aset atau string lokasi langsung (misal: "TK - Ruang Kelas A")
 * @returns {Object} Objek berisi { unit, room }
 */
export function parseLocation(input) {
  if (!input) {
    return { unit: '', room: '' };
  }

  // Jika input berupa string lokasi langsung
  if (typeof input === 'string') {
    if (input.includes(' - ')) {
      const parts = input.split(' - ');
      return {
        unit: parts[0] || '',
        room: parts.slice(1).join(' - ') || ''
      };
    }
    return {
      unit: input,
      room: ''
    };
  }

  // Jika input berupa objek dengan field unit/room terpisah secara native
  if (input.unit || input.room) {
    return {
      unit: input.unit || '',
      room: input.room || ''
    };
  }

  // Fallback untuk model penamaan field lokasi gabungan (mendukung 'location' dan 'lokasi_aset')
  const locStr = input.location || input.lokasi_aset || '';
  if (locStr.includes(' - ')) {
    const parts = locStr.split(' - ');
    return {
      unit: parts[0] || '',
      room: parts.slice(1).join(' - ') || ''
    };
  }

  return {
    unit: locStr,
    room: ''
  };
}
