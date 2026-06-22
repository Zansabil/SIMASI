import { API_BASE_URL } from '../config';
import defaultLaptopImage from '../assets/laptop.jpg';

/**
 * Nilai default gambar laptop dari folder assets.
 */
export const DEFAULT_ASSET_IMAGE = defaultLaptopImage;

/**
 * Menyusun URL gambar secara terpusat untuk aplikasi.
 * Jika path kosong, akan menggunakan gambar default laptop.jpg dari folder assets.
 * 
 * @param {string} path - Path gambar dari API (bisa URL penuh, base64, atau path relatif storage)
 * @returns {string} URL gambar lengkap yang siap dipakai
 */
export const resolveImageUrl = (path) => {
  if (!path) return DEFAULT_ASSET_IMAGE;
  
  if (path.startsWith('http') || path.startsWith('data:')) {
    return path;
  }
  
  return `${API_BASE_URL}/storage/${path}`;
};
