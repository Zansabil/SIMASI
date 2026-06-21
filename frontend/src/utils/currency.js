/**
 * Utilitas pemformatan mata uang Rupiah (IDR) untuk aplikasi SIMASI.
 */

/**
 * Memformat input teks mentah menjadi format Rupiah real-time untuk input form.
 * Membersihkan semua karakter non-angka dan memformat dengan pemisah ribuan.
 * Contoh: "50000abc" -> "Rp 50.000"
 * 
 * @param {string|number} value - Nilai input mentah
 * @returns {string} String format Rupiah
 */
export const formatToRupiah = (value) => {
  if (value === null || value === undefined || value === '') return '';
  const cleanNumber = value.toString().replace(/[^0-9]/g, '');
  if (!cleanNumber) return '';
  return 'Rp ' + Number(cleanNumber).toLocaleString('id-ID');
};

/**
 * Memformat angka nominal menjadi format Rupiah statis untuk tabel dan detail tampilan.
 * Contoh: 4500000 -> "Rp 4.500.000"
 * 
 * @param {number|string} price - Nominal harga
 * @returns {string} String tampilan Rupiah
 */
export const formatPrice = (price) => {
  if (price === null || price === undefined || price === '') return '-';
  const cleanNumber = Math.round(Number(price));
  return 'Rp ' + cleanNumber.toLocaleString('id-ID');
};
