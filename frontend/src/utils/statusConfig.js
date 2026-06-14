/**
 * Memetakan nilai status dari database ke label Bahasa Indonesia
 * dan nama class CSS badge yang sesuai.
 *
 * @param {string} status - Nilai status dari API (e.g. 'pending', 'in_progress')
 * @returns {{ label: string, className: string }}
 */
export function getStatusConfig(status) {
  switch (status) {
    case 'pending':
      return { label: 'Menunggu Persetujuan', className: 'badge-pending' };
    case 'approved':
    case 'approved_by_admin':
    case 'approved_by_yayasan':
      return { label: 'Disetujui', className: 'badge-pending' };
    case 'in_progress':
      return { label: 'Sedang di Kerjakan', className: 'badge-progress' };
    case 'completed':
    case 'purchased':
      return { label: 'Selesai', className: 'badge-completed' };
    case 'rejected':
      return { label: 'Ditolak', className: 'badge-rejected' };
    default:
      return { label: status || 'Pending', className: 'badge-pending' };
  }
}

/**
 * Format angka ke format Bahasa Indonesia (titik sebagai pemisah ribuan).
 * Contoh: 1270 -> 1.270
 *
 * @param {number} num
 * @returns {string}
 */
export function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}
