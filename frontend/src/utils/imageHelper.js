import { API_BASE_URL } from '../config';
import defaultPlaceholder from '../assets/placeholder.svg';

/**
 * Nilai default gambar placeholder dari folder assets.
 */
export const DEFAULT_ASSET_IMAGE = defaultPlaceholder;

/**
 * Menyusun URL gambar secara terpusat untuk aplikasi.
 * Jika path kosong, akan menggunakan gambar default placeholder.svg dari folder assets.
 * 
 * @param {string} path - Path gambar dari API (bisa URL penuh, base64, atau path relatif storage)
 * @returns {string} URL gambar lengkap yang siap dipakai
 */
export const resolveImageUrl = (path) => {
  if (!path) return DEFAULT_ASSET_IMAGE;
  
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path;
  }
  
  // Normalisasi jika path sudah memiliki awalan 'storage/' atau '/'
  const cleanPath = path.replace(/^\/+/, '').replace(/^storage\//, '');

  return `${API_BASE_URL}/storage/${cleanPath}`;
};
