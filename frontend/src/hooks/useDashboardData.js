import { useState, useEffect } from 'react';
import axios from 'axios';

// Default mock data untuk mode demo / fallback ketika backend tidak aktif
const DEFAULT_STATS = {
  total_aset: 1270,
  aset_aktif: 1200,
  perbaikan: 70,
  elektronik: 300,
  furnitur: 650,
};

const DEFAULT_ACTIVITIES = [
  { id: 'mock-1', type: 'Pengadaan', title: 'Pengadaan - Kipas Angin',   date: '18-10-2025', status: 'pending'     },
  { id: 'mock-2', type: 'Perbaikan', title: 'Perbaikan - Meja Guru',      date: '25-10-2025', status: 'in_progress' },
  { id: 'mock-3', type: 'Perbaikan', title: 'Perbaikan - Stop Kontak Mati', date: '10-10-2025', status: 'completed'   },
];

/**
 * Custom hook untuk mengambil data statistik aset dan aktivitas terbaru
 * dari endpoint dashboard backend Laravel.
 *
 * Secara otomatis menggunakan data mock apabila backend tidak dapat dijangkau
 * (mode demo / offline prototype).
 *
 * @returns {{ stats: object, activities: Array, isLoading: boolean }}
 */
export default function useDashboardData() {
  const [stats, setStats]           = useState(DEFAULT_STATS);
  const [activities, setActivities] = useState(DEFAULT_ACTIVITIES);
  const [isLoading, setIsLoading]   = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const config = {
          headers: { Authorization: `Bearer ${token}` },
        };

        const response = await axios.get(
          'http://localhost:8000/api/dashboard/stats',
          config
        );

        if (response.data) {
          // Update stats dari response API
          setStats({
            total_aset:  response.data.stats?.total_aset  || 0,
            aset_aktif:  response.data.stats?.aset_aktif  || 0,
            perbaikan:   response.data.stats?.perbaikan   || 0,
            elektronik:  response.data.stats?.elektronik  || 0,
            furnitur:    response.data.stats?.furnitur    || 0,
          });

          // Update aktivitas hanya jika API mengembalikan data
          if (response.data.activities?.length > 0) {
            setActivities(response.data.activities);
          }
        }
      } catch (err) {
        console.warn(
          'Backend API tidak dapat dijangkau. Menggunakan data mock untuk demo.',
          err
        );
        // Biarkan state default (mock data) tetap aktif
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return { stats, activities, isLoading };
}
