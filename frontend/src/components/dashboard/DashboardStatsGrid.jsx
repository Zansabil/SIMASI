import React from 'react';
import {
  FiDatabase, FiCheckCircle, FiTool, FiMonitor, FiTable,
} from 'react-icons/fi';
import StatCard from './StatCard';

/**
 * Konfigurasi kartu statistik — daftar yang mendefinisikan urutan dan
 * properti setiap kartu pada grid statistik dashboard.
 */
const STAT_CARD_CONFIG = [
  { key: 'total_aset',  label: 'Total Aset',    icon: FiDatabase,    colorClass: 'stat-total'     },
  { key: 'aset_aktif',  label: 'Aset Aktif',    icon: FiCheckCircle, colorClass: 'stat-active'    },
  { key: 'perbaikan',   label: 'Perbaikan',      icon: FiTool,        colorClass: 'stat-repair'    },
  { key: 'komputer',    label: 'Komputer',       icon: FiMonitor,     colorClass: 'stat-computer'  },
  { key: 'meja_kursi',  label: 'Meja dan Kursi', icon: FiTable,       colorClass: 'stat-furniture' },
];

/**
 * Grid berisi 5 kartu statistik untuk halaman dashboard.
 * Menerima objek `stats` dan merender semua kartu secara otomatis
 * berdasarkan STAT_CARD_CONFIG di atas.
 *
 * @param {object} props
 * @param {object} props.stats - Objek data statistik dari useDashboardData
 */
export default function DashboardStatsGrid({ stats }) {
  return (
    <section className="statistics-grid">
      {STAT_CARD_CONFIG.map(({ key, label, icon, colorClass }) => (
        <StatCard
          key={key}
          label={label}
          value={stats[key] ?? 0}
          icon={icon}
          colorClass={colorClass}
        />
      ))}
    </section>
  );
}
