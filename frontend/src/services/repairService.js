import axios from 'axios';
import { API_BASE_URL } from '../config';

const getAuthConfig = () => {
  const token = localStorage.getItem('auth_token');
  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
};

export const fetchRepairs = async (searchQuery = '', status = 'all') => {
  const response = await axios.get(`${API_BASE_URL}/api/laporan_kerusakan`, getAuthConfig());
  let data = response.data.data || [];
  
  // Custom filter on frontend if API doesn't support query params yet
  if (status !== 'all') {
    // Map frontend status to backend status
    const statusMap = {
      'pending': 'Menunggu',
      'in_progress': 'Diproses',
      'completed': 'Selesai',
      'rejected': 'Ditolak'
    };
    data = data.filter(item => item.status_kerusakan === statusMap[status]);
  }
  
  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    data = data.filter(item => {
      const assetName = item.aset ? item.aset.nama_barang : '';
      const reporterName = item.pelapor ? item.pelapor.nama : '';
      return assetName.toLowerCase().includes(query) || reporterName.toLowerCase().includes(query);
    });
  }
  
  return data;
};

export const createRepair = async (formData) => {
  // formData expects FormData object for file upload
  const config = getAuthConfig();
  config.headers['Content-Type'] = 'multipart/form-data';
  
  const response = await axios.post(`${API_BASE_URL}/api/laporan_kerusakan`, formData, config);
  return response.data;
};

export const validateRepair = async (id) => {
  const response = await axios.patch(`${API_BASE_URL}/api/laporan_kerusakan/${id}/validasi`, {}, getAuthConfig());
  return response.data;
};

export const rejectRepair = async (id, reason = 'Ditolak oleh petugas') => {
  const response = await axios.patch(`${API_BASE_URL}/api/laporan-kerusakan/${id}/tolak`, { alasan_penolakan: reason }, getAuthConfig());
  return response.data;
};

export const completeRepair = async (idLaporan, idPetugas, hasil = 'Perbaikan telah diselesaikan secara otomatis.', biaya = 0) => {
  // Create a record in perbaikan_aset to trigger the completion sync
  const today = new Date().toISOString().split('T')[0];
  const response = await axios.post(`${API_BASE_URL}/api/perbaikan_aset`, {
    id_laporan: idLaporan,
    id_petugas: idPetugas,
    tanggal_mulai: today,
    tanggal_selesai: today,
    status_perbaikan: 'Selesai',
    hasil: hasil,
    biaya: biaya
  }, getAuthConfig());
  return response.data;
};

export const deleteRepair = async (id) => {
  const response = await axios.delete(`${API_BASE_URL}/api/laporan_kerusakan/${id}`, getAuthConfig());
  return response.data;
};

export const updateRepairProgress = async (id, status, keterangan) => {
  const response = await axios.patch(`${API_BASE_URL}/api/laporan_kerusakan/${id}/progress`, {
    status_kerusakan: status,
    keterangan_perbaikan: keterangan
  }, getAuthConfig());
  return response.data;
};
