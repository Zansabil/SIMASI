export const API_BASE_URL = import.meta.env.MODE === 'production' 
  ? (import.meta.env.VITE_API_URL || '') 
  : (import.meta.env.VITE_API_URL || 'http://localhost:8000');

export const DEFAULT_UNITS = ['SD', 'SMP', 'SMA', 'MA', 'TK'];
export const DEFAULT_CATEGORIES = [
  'Mebelair',
  'Elektronik',
  'Kelistrikan',
  'Kebersihan',
  'Alat Tulis Kantor / Perlengkapan',
  'Umum'
];


