import React from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import DashboardHeader from '../../components/dashboard/DashboardHeader';
import DashboardStatsGrid from '../../components/dashboard/DashboardStatsGrid';
import ActivityList from '../../components/dashboard/ActivityList';
import useDashboardData from '../../hooks/useDashboardData';

export default function SuperDashboard() {
  const { stats, activities, isLoading } = useDashboardData();

  return (
    <DashboardLayout role="super-admin" currentPath="/super-admin/dashboard">
      <main className="dashboard-body">
        <DashboardHeader
          title="Dashboard"
          subtitle="Selamat datang di Sistem Informasi Manajemen Aset Sekolah (Super Admin)"
        />
        <DashboardStatsGrid stats={stats} />
        <ActivityList activities={activities} />
      </main>
    </DashboardLayout>
  );
}
