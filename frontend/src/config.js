export const API_BASE_URL = import.meta.env.MODE === 'production' 
  ? (import.meta.env.VITE_API_URL || '') 
  : (import.meta.env.VITE_API_URL || 'http://localhost:8000');

export const DEFAULT_UNITS = ['TK 1', 'TK 2', 'SD 1', 'SD 2', 'SMP 1', 'SMP 2', 'SMA', 'MA'];
export const DEFAULT_CATEGORIES = ['Elektronik', 'Mebel / Furnitur', 'Kelistrikan', 'Kebersihan', 'Alat Kantor'];


