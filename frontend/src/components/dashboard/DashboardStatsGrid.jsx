import React from 'react';
import {
  FiDatabase,
  FiCheckCircle,
  FiTool,
  FiMonitor,
  FiTable,
  FiZap,
  FiDroplet,
  FiBriefcase,
  FiLayers,
  FiTag,
} from 'react-icons/fi';
import StatCard from './StatCard';

/**
 * Konfigurasi kartu statistik utama (status aset).
 */
const MAIN_STAT_CARDS = [
  { key: 'total_aset', label: 'Total Aset', icon: FiDatabase,    colorClass: 'stat-total'  },
  { key: 'aset_aktif', label: 'Aset Aktif', icon: FiCheckCircle, colorClass: 'stat-active' },
  { key: 'perbaikan',  label: 'Perbaikan',  icon: FiTool,        colorClass: 'stat-repair' },
];

const FALLBACK_COLORS = [
  'stat-computer',
  'stat-furniture',
  'stat-electric',
  'stat-cleaning',
  'stat-office',
  'stat-general',
];

/**
 * Menentukan ikon dan warna kartu berdasarkan nama kategori aset.
 */
function resolveCategoryVisual(namaKategori = '', index = 0) {
  const lower = namaKategori.toLowerCase();

  if (lower.includes('elektronik') || lower.includes('komputer')) {
    return { icon: FiMonitor, colorClass: 'stat-computer' };
  }
  if (lower.includes('mebel') || lower.includes('furnitur')) {
    return { icon: FiTable, colorClass: 'stat-furniture' };
  }
  if (lower.includes('listrik') || lower.includes('kelistrikan')) {
    return { icon: FiZap, colorClass: 'stat-electric' };
  }
  if (lower.includes('bersih') || lower.includes('kebersihan')) {
    return { icon: FiDroplet, colorClass: 'stat-cleaning' };
  }
  if (lower.includes('kantor') || lower.includes('tulis')) {
    return { icon: FiBriefcase, colorClass: 'stat-office' };
  }
  if (lower.includes('umum')) {
    return { icon: FiLayers, colorClass: 'stat-general' };
  }

  return {
    icon: FiTag,
    colorClass: FALLBACK_COLORS[index % FALLBACK_COLORS.length],
  };
}

/**
 * Grid kartu statistik untuk halaman dashboard.
 * Menampilkan 3 kartu ringkasan utama serta seluruh kategori aset
 * yang tersimpan di database (termasuk kategori yang diinput manual).
 *
 * @param {object} props
 * @param {object} props.stats - Objek data statistik dari useDashboardData
 */
export default function DashboardStatsGrid({ stats }) {
  const kategoriList = Array.isArray(stats?.kategori) ? stats.kategori : [];

  return (
    <section className="statistics-grid">
      {MAIN_STAT_CARDS.map(({ key, label, icon, colorClass }) => (
        <StatCard
          key={key}
          label={label}
          value={stats?.[key] ?? 0}
          icon={icon}
          colorClass={colorClass}
        />
      ))}

      {kategoriList.map((kat, idx) => {
        const { icon, colorClass } = resolveCategoryVisual(kat.nama, idx);
        return (
          <StatCard
            key={`kat-${kat.id ?? kat.nama}`}
            label={kat.nama}
            value={kat.jumlah ?? 0}
            icon={icon}
            colorClass={colorClass}
          />
        );
      })}
    </section>
  );
}
