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

/**
 * Helper untuk memicu unduh file (Blob) di browser
 */
export const triggerBlobDownload = (blobData, filename = 'download.pdf') => {
  const blob = blobData instanceof Blob ? blobData : new Blob([blobData]);
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.parentNode.removeChild(link);
  window.URL.revokeObjectURL(url);
};

/**
 * Mengunduh laporan PDF data aset berdasarkan parameter/periode
 */
export const exportAssetPDF = async (params = {}) => {
  const response = await api.get('/api/aset/cetak/pdf', {
    params,
    responseType: 'blob'
  });
  return response.data;
};

/**
 * Mengunduh template Excel untuk impor data aset
 */
export const downloadAssetTemplate = async () => {
  try {
    const response = await api.get('/api/aset/import/template', {
      responseType: 'blob'
    });
    return response.data;
  } catch (err) {
    // Fallback: Jika endpoint backend belum dibuat, buatkan file template CSV yang kompatibel dengan Excel
    console.warn("Backend template endpoint not yet available, using client-side CSV template fallback.", err);
    const csvContent = "\uFEFF" + [
      "Nama Aset,Jenis Aset,Unit,Ruangan,Jumlah,Kondisi,Tanggal Diperoleh (YYYY-MM-DD),Harga Aset,Sumber Dana",
      "Laptop ASUS ExpertBook,Elektronik,SMA,Laboratorium Komputer,5,Baik,2026-10-01,8500000,BOS",
      "Meja Siswa Kayu Jati,Mebel / Furnitur,SMP,Kelas 7A,20,Baik,2026-09-15,350000,Yayasan"
    ].join("\r\n");
    return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  }
};

/**
 * Mengunggah file Excel untuk diimpor ke sistem
 */
export const importAssetExcel = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post('/api/aset/import', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};
