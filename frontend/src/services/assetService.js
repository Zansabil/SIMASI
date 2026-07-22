import api from './api';
console.log("Asset service loaded!");

/**
 * Mengambil daftar aset dari server dengan filter pencarian opsional
 */
export const fetchAssets = async (params = {}, signal) => {
  const response = await api.get('/api/aset', { params, signal });
  return response.data;
};

/**
 * Menambahkan aset baru ke server
 */
export const createAsset = async (payload) => {
  const response = await api.post('/api/aset', payload);
  return response.data;
};

/**
 * Memperbarui data aset yang sudah ada di server
 */
export const updateAsset = async (id, payload) => {
  const response = await api.put(`/api/aset/${id}`, payload);
  return response.data;
};

/**
 * Menghapus data aset secara permanen dari server
 */
export const deleteAsset = async (id) => {
  const response = await api.delete(`/api/aset/${id}`);
  return response.data;
};

/**
 * Mengambil data pilihan lokasi unit (dropdown)
 */
export const fetchUnits = async () => {
  const response = await api.get('/api/lokasi_unit');
  return response.data;
};

/**
 * Mengambil data pilihan kategori aset (dropdown)
 */
export const fetchCategories = async () => {
  const response = await api.get('/api/kategori_aset');
  return response.data;
};

/**
 * Mengambil data pilihan ruangan (dropdown)
 */
export const fetchRooms = async () => {
  const response = await api.get('/api/ruangan');
  return response.data;
};

/**
 * Memperbarui kondisi spesifik untuk sub-aset
 */
export const updateSubAssetCondition = async (id, payload) => {
  const response = await api.patch(`/api/sub_aset/${id}/kondisi`, payload);
  return response.data;
};

/**
 * Menghapus satu unit spesifik (sub-aset) dari server
 */
export const deleteSubAsset = async (id) => {
  const response = await api.delete(`/api/sub_aset/${id}`);
  return response.data;
};
