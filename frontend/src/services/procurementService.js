import api from './api';

/**
 * Ambil semua data pengadaan aset dari backend
 * GET /api/pengadaan_aset
 */
export const fetchProcurements = async () => {
  const response = await api.get('/api/pengadaan_aset');
  return response.data;
};

/**
 * Kirim pengajuan pengadaan aset baru (1 item = 1 request)
 * POST /api/pengadaan_aset
 */
export const createProcurement = async (data) => {
  const response = await api.post('/api/pengadaan_aset', data);
  return response.data;
};

/**
 * Setujui pengajuan pengadaan aset
 * PATCH /api/pengadaan_aset/{id}/setuju
 */
export const approveProcurement = async (id) => {
  const response = await api.patch(`/api/pengadaan_aset/${id}/setuju`);
  return response.data;
};

/**
 * Tolak pengajuan pengadaan aset
 * PATCH /api/pengadaan_aset/{id}/tolak
 */
export const rejectProcurement = async (id, catatan_penolakan) => {
  const response = await api.patch(`/api/pengadaan_aset/${id}/tolak`, { catatan_penolakan });
  return response.data;
};
