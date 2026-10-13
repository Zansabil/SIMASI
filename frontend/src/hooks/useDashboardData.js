import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';

const EMPTY_STATS = {
  total_aset: 0,
  aset_aktif: 0,
  perbaikan: 0,
  elektronik: 0,
  furnitur: 0,
};

/**
 * Custom hook untuk mengambil data statistik aset dan aktivitas terbaru
 * dari endpoint dashboard backend Laravel.
 *
 * @returns {{ stats: object, activities: Array, isLoading: boolean }}
 */
export default function useDashboardData() {
  const [stats, setStats]           = useState(EMPTY_STATS);
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading]   = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const config = {
          headers: { 
            Authorization: `Bearer ${token}`,
            Accept: 'application/json'
          },
        };

        const response = await axios.get(
          `${API_BASE_URL}/api/dashboard/stats`,
          config
        );

        if (response.data) {
          // Update stats dari response API
          setStats({
            total_aset:  Number(response.data.stats?.total_aset)  || 0,
            aset_aktif:  Number(response.data.stats?.aset_aktif)  || 0,
            perbaikan:   Number(response.data.stats?.perbaikan)   || 0,
            elektronik:  Number(response.data.stats?.elektronik)  || 0,
            furnitur:    Number(response.data.stats?.furnitur)    || 0,
          });

          // Update aktivitas dari response API jika ada
          if (Array.isArray(response.data.activities)) {
            setActivities(response.data.activities);
          } else {
            setActivities([]);
          }
        }
      } catch (err) {
        console.warn('Gagal memuat data statistik dashboard dari API:', err);
        setStats(EMPTY_STATS);
        setActivities([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return { stats, activities, isLoading };
}
