import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';

// Default mock data untuk mode demo / fallback ketika backend tidak aktif
const DEFAULT_STATS = {
  total_aset: 1270,
  aset_aktif: 1200,
  perbaikan: 70,
  elektronik: 300,
  furnitur: 650,
};

const getTodayDateString = () => {
  const today = new Date();
  const day = String(today.getDate()).padStart(2, '0');
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const year = today.getFullYear();
  return `${day}-${month}-${year}`;
};

const getYesterdayDateString = () => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const day = String(yesterday.getDate()).padStart(2, '0');
  const month = String(yesterday.getMonth() + 1).padStart(2, '0');
  const year = yesterday.getFullYear();
  return `${day}-${month}-${year}`;
};

const todayStr = getTodayDateString();
const yesterdayStr = getYesterdayDateString();

const DEFAULT_ACTIVITIES = [
  { id: 'mock-1', type: 'Pengadaan', title: 'Pengadaan - Kipas Angin',   date: todayStr, status: 'pending'     },
  { id: 'mock-2', type: 'Perbaikan', title: 'Perbaikan - Meja Guru',      date: todayStr, status: 'in_progress' },
  { id: 'mock-3', type: 'Perbaikan', title: 'Perbaikan - Stop Kontak Mati', date: todayStr, status: 'completed'   },
  { id: 'mock-4', type: 'Pengadaan', title: 'Pengadaan - Proyektor Kelas',  date: todayStr, status: 'approved'    },
  { id: 'mock-5', type: 'Perbaikan', title: 'Perbaikan - AC Kelas 10',      date: todayStr, status: 'in_progress' },
  { id: 'mock-6', type: 'Pengadaan', title: 'Pengadaan - Papan Tulis',     date: todayStr, status: 'pending'     },
  { id: 'mock-7', type: 'Perbaikan', title: 'Perbaikan - Pintu Toilet',     date: todayStr, status: 'completed'   },
  { id: 'mock-8', type: 'Pengadaan', title: 'Pengadaan - Kursi Guru',      date: yesterdayStr, status: 'rejected'  },
  { id: 'mock-9', type: 'Perbaikan', title: 'Perbaikan - Lampu Koridor',    date: yesterdayStr, status: 'completed' },
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
          `${API_BASE_URL}/api/dashboard/stats`,
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
