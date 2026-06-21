/**
 * Utilitas pemformatan tanggal untuk aplikasi SIMASI.
 * Memformat string tanggal (seperti YYYY-MM-DD) menjadi format bahasa Indonesia yang mudah dibaca.
 * Contoh: "2026-06-21" -> "21 Juni 2026"
 * 
 * @param {string|Date} dateString - String tanggal atau objek Date
 * @returns {string} Tanggal terformat atau '-' jika kosong
 */
export const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  
  // Periksa apakah objek tanggal valid
  if (isNaN(date.getTime())) return '-';
  
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

export default formatDate;
