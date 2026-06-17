import axios from 'axios';
import { API_BASE_URL } from '../config';

/**
 * Helper: Ambil config header authorization dari token di localStorage
 */
const getAuthConfig = () => {
  const token = localStorage.getItem('auth_token');
  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
};

/**
 * Ambil semua data pengadaan aset dari backend
 * GET /api/pengadaan_aset
 */
export const fetchProcurements = async () => {
  const response = await axios.get(
    `${API_BASE_URL}/api/pengadaan_aset`,
    getAuthConfig()
  );
  return response.data;
};

/**
 * Kirim pengajuan pengadaan aset baru (1 item = 1 request)
 * POST /api/pengadaan_aset
 */
export const createProcurement = async (data) => {
  const response = await axios.post(
    `${API_BASE_URL}/api/pengadaan_aset`,
    data,
    getAuthConfig()
  );
  return response.data;
};

/**
 * Setujui pengajuan pengadaan aset
 * PATCH /api/pengadaan_aset/{id}/setuju
 */
export const approveProcurement = async (id) => {
  const response = await axios.patch(
    `${API_BASE_URL}/api/pengadaan_aset/${id}/setuju`,
    {},
    getAuthConfig()
  );
  return response.data;
};

/**
 * Tolak pengajuan pengadaan aset
 * PATCH /api/pengadaan_aset/{id}/tolak
 */
export const rejectProcurement = async (id, catatan_penolakan) => {
  const response = await axios.patch(
    `${API_BASE_URL}/api/pengadaan_aset/${id}/tolak`,
    { catatan_penolakan },
    getAuthConfig()
  );
  return response.data;
};
