import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import DashboardHeader from '../../components/dashboard/DashboardHeader';
import axios from 'axios';
import { API_BASE_URL } from '../../config';

export default function KelolaKodeRegistrasi() {
  const [kodes, setKodes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newKode, setNewKode] = useState('');
  const [newKeterangan, setNewKeterangan] = useState('');

  // Log Modal states
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [logs, setLogs] = useState([]);
  const [selectedKodeName, setSelectedKodeName] = useState('');
  const [isLogLoading, setIsLogLoading] = useState(false);

  // Delete Modal states
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [kodeToDelete, setKodeToDelete] = useState(null);

  // Fetch data on mount
  useEffect(() => {
    fetchKodes();
  }, []);

  const fetchKodes = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await axios.get(`${API_BASE_URL}/api/kode-registrasi`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setKodes(response.data.data);
    } catch (err) {
      setErrorMsg('Gagal mengambil data kode registrasi.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const token = localStorage.getItem('auth_token');
      await axios.post(`${API_BASE_URL}/api/kode-registrasi`, {
        kode: newKode,
        keterangan: newKeterangan
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccessMsg('Kode registrasi berhasil dibuat.');
      setIsModalOpen(false);
      setNewKode('');
      setNewKeterangan('');
      fetchKodes();
    } catch (err) {
      const msg = err.response?.data?.message || 'Gagal membuat kode baru.';
      setErrorMsg(msg);
    }
  };

  const handleToggleStatus = async (id) => {
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const token = localStorage.getItem('auth_token');
      await axios.patch(`${API_BASE_URL}/api/kode-registrasi/${id}/status`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccessMsg('Status berhasil diubah.');
      fetchKodes();
    } catch (err) {
      setErrorMsg('Gagal mengubah status.');
    }
  };

  const handleDelete = (id) => {
    setKodeToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!kodeToDelete) return;
    setErrorMsg('');
    setSuccessMsg('');
    setIsDeleteModalOpen(false);
    try {
      const token = localStorage.getItem('auth_token');
      await axios.delete(`${API_BASE_URL}/api/kode-registrasi/${kodeToDelete}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccessMsg('Kode berhasil dihapus.');
      fetchKodes();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Gagal menghapus kode.');
    } finally {
      setKodeToDelete(null);
    }
  };

  const handleViewLogs = async (kodeObj) => {
    setSelectedKodeName(kodeObj.kode);
    setIsLogModalOpen(true);
    setIsLogLoading(true);
    setLogs([]);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await axios.get(`${API_BASE_URL}/api/kode-registrasi/${kodeObj.id}/logs`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLogs(response.data.data);
    } catch (err) {
      setErrorMsg('Gagal mengambil log pengguna.');
    } finally {
      setIsLogLoading(false);
    }
  };

  return (
    <DashboardLayout role="super-admin" currentPath="/super-admin/kelola-kode-registrasi">
      <main className="dashboard-body">
        <DashboardHeader
          title="Kelola Kode Registrasi"
          subtitle="Manajemen kode unik yang digunakan untuk registrasi pengguna baru"
        />

        <div className="content-container" style={{ padding: '20px', background: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          {errorMsg && <div style={{ color: 'red', marginBottom: '10px' }}>{errorMsg}</div>}
          {successMsg && <div style={{ color: 'green', marginBottom: '10px' }}>{successMsg}</div>}

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold' }}>Daftar Kode Registrasi</h2>
            <button 
              className="btn-primary" 
              style={{ padding: '8px 16px', background: '#3b82f6', color: 'white', borderRadius: '4px', border: 'none', cursor: 'pointer' }}
              onClick={() => setIsModalOpen(true)}
            >
              + Buat Kode Baru
            </button>
          </div>

          {isLoading ? (
            <p>Memuat data...</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                  <th style={{ padding: '10px' }}>Kode</th>
                  <th style={{ padding: '10px' }}>Keterangan</th>
                  <th style={{ padding: '10px' }}>Status</th>
                  <th style={{ padding: '10px' }}>Pengguna</th>
                  <th style={{ padding: '10px' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {kodes.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ padding: '10px', textAlign: 'center' }}>Tidak ada data kode registrasi.</td>
                  </tr>
                ) : (
                  kodes.map(kode => (
                    <tr key={kode.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '10px', fontWeight: 'bold' }}>{kode.kode}</td>
                      <td style={{ padding: '10px' }}>{kode.keterangan || '-'}</td>
                      <td style={{ padding: '10px' }}>
                        <span style={{ 
                          padding: '4px 8px', 
                          borderRadius: '12px', 
                          fontSize: '12px',
                          background: kode.status_aktif ? '#d1fae5' : '#fee2e2',
                          color: kode.status_aktif ? '#065f46' : '#991b1b'
                        }}>
                          {kode.status_aktif ? 'Aktif' : 'Nonaktif'}
                        </span>
                      </td>
                      <td style={{ padding: '10px' }}>{kode.pengguna_count} Orang</td>
                      <td style={{ padding: '10px', display: 'flex', gap: '8px' }}>
                        <button 
                          onClick={() => handleViewLogs(kode)}
                          style={{ padding: '4px 8px', background: '#10b981', color: 'white', borderRadius: '4px', border: 'none', cursor: 'pointer', fontSize: '12px' }}
                        >
                          Lihat Log
                        </button>
                        <button 
                          onClick={() => handleToggleStatus(kode.id)}
                          style={{ padding: '4px 8px', background: kode.status_aktif ? '#f59e0b' : '#3b82f6', color: 'white', borderRadius: '4px', border: 'none', cursor: 'pointer', fontSize: '12px' }}
                        >
                          {kode.status_aktif ? 'Nonaktifkan' : 'Aktifkan'}
                        </button>
                        <button 
                          onClick={() => handleDelete(kode.id)}
                          style={{ padding: '4px 8px', background: '#ef4444', color: 'white', borderRadius: '4px', border: 'none', cursor: 'pointer', fontSize: '12px' }}
                          disabled={kode.pengguna_count > 0}
                          title={kode.pengguna_count > 0 ? "Tidak bisa dihapus karena sudah digunakan" : ""}
                        >
                          Hapus
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </main>

      {/* Modal Tambah Kode */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ background: 'white', padding: '24px', borderRadius: '8px', width: '400px' }}>
            <h3 style={{ marginTop: 0, fontSize: '18px', fontWeight: 'bold' }}>Buat Kode Registrasi Baru</h3>
            <form onSubmit={handleCreate}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Kode Registrasi</label>
                <input 
                  type="text" 
                  value={newKode} 
                  onChange={e => setNewKode(e.target.value)} 
                  required 
                  placeholder="Misal: ASH-GURU-2027"
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #d1d5db', boxSizing: 'border-box' }}
                />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Keterangan</label>
                <input 
                  type="text" 
                  value={newKeterangan} 
                  onChange={e => setNewKeterangan(e.target.value)} 
                  placeholder="Opsional (Misal: Kode untuk tahun ajaran baru)"
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #d1d5db', boxSizing: 'border-box' }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ padding: '8px 16px', borderRadius: '4px', border: '1px solid #d1d5db', background: 'white', cursor: 'pointer' }}>Batal</button>
                <button type="submit" style={{ padding: '8px 16px', borderRadius: '4px', border: 'none', background: '#3b82f6', color: 'white', cursor: 'pointer' }}>Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Lihat Log */}
      {isLogModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ background: 'white', padding: '24px', borderRadius: '8px', width: '600px', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ marginTop: 0, fontSize: '18px', fontWeight: 'bold' }}>Log Pengguna - Kode: {selectedKodeName}</h3>
            
            <div style={{ overflowY: 'auto', flex: 1, marginBottom: '20px' }}>
              {isLogLoading ? (
                <p>Memuat log pengguna...</p>
              ) : logs.length === 0 ? (
                <p>Belum ada pengguna yang mendaftar dengan kode ini.</p>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                      <th style={{ padding: '8px' }}>Nama</th>
                      <th style={{ padding: '8px' }}>Email</th>
                      <th style={{ padding: '8px' }}>Tanggal Daftar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map(user => (
                      <tr key={user.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                        <td style={{ padding: '8px' }}>{user.nama}</td>
                        <td style={{ padding: '8px' }}>{user.email}</td>
                        <td style={{ padding: '8px' }}>{new Date(user.tgl_dibuat).toLocaleString('id-ID')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setIsLogModalOpen(false)} style={{ padding: '8px 16px', borderRadius: '4px', border: '1px solid #d1d5db', background: 'white', cursor: 'pointer' }}>Tutup</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus */}
      {isDeleteModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ background: 'white', padding: '24px', borderRadius: '8px', width: '400px', textAlign: 'center' }}>
            <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'center' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="24" height="24" fill="none" stroke="#ef4444" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                </svg>
              </div>
            </div>
            <h3 style={{ marginTop: 0, fontSize: '18px', fontWeight: 'bold', color: '#111827' }}>Konfirmasi Hapus</h3>
            <p style={{ color: '#4b5563', marginBottom: '24px' }}>Apakah Anda yakin ingin menghapus kode ini? Tindakan ini tidak dapat dibatalkan.</p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
              <button 
                onClick={() => { setIsDeleteModalOpen(false); setKodeToDelete(null); }} 
                style={{ padding: '8px 16px', borderRadius: '4px', border: '1px solid #d1d5db', background: 'white', cursor: 'pointer', fontWeight: '500', color: '#374151' }}
              >
                Batal
              </button>
              <button 
                onClick={confirmDelete} 
                style={{ padding: '8px 16px', borderRadius: '4px', border: 'none', background: '#ef4444', color: 'white', cursor: 'pointer', fontWeight: '500' }}
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
