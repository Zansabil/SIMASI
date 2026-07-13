import api from './api';

export const fetchRepairs = async (searchQuery = '', status = 'all') => {
  const response = await api.get('/api/laporan_kerusakan');
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
      const assetName = item.aset ? item.aset.nama_aset : '';
      const reporterName = item.pelapor ? item.pelapor.nama : '';
      return assetName.toLowerCase().includes(query) || reporterName.toLowerCase().includes(query);
    });
  }
  
  return data;
};

export const createRepair = async (formData) => {
  const response = await api.post('/api/laporan_kerusakan', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

export const validateRepair = async (id) => {
  const response = await api.patch(`/api/laporan_kerusakan/${id}/validasi`);
  return response.data;
};

export const rejectRepair = async (id, reason = 'Ditolak oleh petugas') => {
  const response = await api.patch(`/api/laporan-kerusakan/${id}/tolak`, { alasan_penolakan: reason });
  return response.data;
};

export const completeRepair = async (idLaporan, idPetugas, hasil = 'Perbaikan telah diselesaikan secara otomatis.', biaya = 0) => {
  const today = new Date().toISOString().split('T')[0];
  const response = await api.post('/api/perbaikan_aset', {
    id_laporan: idLaporan,
    id_petugas: idPetugas,
    tanggal_mulai: today,
    tanggal_selesai: today,
    status_perbaikan: 'Selesai',
    hasil: hasil,
    biaya: biaya
  });
  return response.data;
};

export const deleteRepair = async (id) => {
  const response = await api.delete(`/api/laporan_kerusakan/${id}`);
  return response.data;
};

export const updateRepairProgress = async (id, status, keterangan) => {
  const response = await api.patch(`/api/laporan_kerusakan/${id}/progress`, {
    status_kerusakan: status,
    keterangan_perbaikan: keterangan
  });
  return response.data;
};
