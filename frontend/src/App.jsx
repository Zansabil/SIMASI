import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/admin/Dashboard';
import DaftarAset from './pages/admin/DaftarAset';
import PerbaikanAset from './pages/admin/PerbaikanAset';
import AdminProfile from './pages/admin/Profile';
import AdminNotifikasi from './pages/admin/Notifikasi';
import GuruDashboard from './pages/guru/Dashboard';
import GuruDaftarAset from './pages/guru/DaftarAset';
import GuruPerbaikanAset from './pages/guru/PerbaikanAset';
import GuruProfile from './pages/guru/Profile';
import GuruNotifikasi from './pages/guru/Notifikasi';
import PetugasDashboard from './pages/petugas-perbaikan/Dashboard';
import PetugasDaftarAset from './pages/petugas-perbaikan/DaftarAset';
import PetugasProfile from './pages/petugas-perbaikan/Profile';
import PetugasNotifikasi from './pages/petugas-perbaikan/Notifikasi';
import PetugasPerbaikanAset from './pages/petugas-perbaikan/PerbaikanAset';
import AdminPengadaanAset from './pages/admin/PengadaanAset';
import GuruPengadaanAset from './pages/guru/PengadaanAset';
import PetugasPengadaanAset from './pages/petugas-perbaikan/PengadaanAset';

import YayasanDashboard from './pages/kepala-yayasan/Dashboard';
import YayasanDaftarAset from './pages/kepala-yayasan/DaftarAset';
import YayasanPerbaikanAset from './pages/kepala-yayasan/PerbaikanAset';
import YayasanProfile from './pages/kepala-yayasan/Profile';
import YayasanNotifikasi from './pages/kepala-yayasan/Notifikasi';
import YayasanPersetujuanPengadaan from './pages/kepala-yayasan/PersetujuanPengadaan';
import SuperDashboard from './pages/super-admin/Dashboard';
import SuperDaftarAset from './pages/super-admin/DaftarAset';
import SuperPengadaanAset from './pages/super-admin/PengadaanAset';
import SuperPerbaikanAset from './pages/super-admin/PerbaikanAset';
import SuperManajemenPengguna from './pages/super-admin/ManajemenPengguna';
import SuperProfile from './pages/super-admin/Profile';
import SuperNotifikasi from './pages/super-admin/Notifikasi';

import ProtectedRoute from './routes/ProtectedRoute';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Guru Routes */}
        <Route element={<ProtectedRoute allowedRoles={['guru']} />}>
          <Route path="/guru/dashboard" element={<GuruDashboard/>} />
          <Route path="/guru/daftar-aset" element={<GuruDaftarAset />} />
          <Route path="/guru/pengadaan" element={<GuruPengadaanAset />} />
          <Route path="/guru/perbaikan" element={<GuruPerbaikanAset />} />
          <Route path="/guru/profile" element={<GuruProfile />} />
          <Route path="/guru/notifikasi" element={<GuruNotifikasi />} />
        </Route>

        {/* Admin Unit Routes */}
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route path="/admin/dashboard" element={<Dashboard />} />
          <Route path="/admin/daftar-aset" element={<DaftarAset />} />
          <Route path="/admin/pengadaan" element={<AdminPengadaanAset />} />
          <Route path="/admin/perbaikan" element={<PerbaikanAset />} />
          <Route path="/admin/profile" element={<AdminProfile />} />
          <Route path="/admin/notifikasi" element={<AdminNotifikasi />} />
        </Route>

        {/* Petugas Perbaikan Routes */}
        <Route element={<ProtectedRoute allowedRoles={['petugas-perbaikan']} />}>
          <Route path="/petugas-perbaikan/dashboard" element={<PetugasDashboard />} />
          <Route path="/petugas-perbaikan/daftar-aset" element={<PetugasDaftarAset />} />
          <Route path="/petugas-perbaikan/pengadaan" element={<PetugasPengadaanAset />} />
          <Route path="/petugas-perbaikan/profile" element={<PetugasProfile />} />
          <Route path="/petugas-perbaikan/notifikasi" element={<PetugasNotifikasi />} />
          <Route path="/petugas-perbaikan/perbaikan" element={<PetugasPerbaikanAset />} />
        </Route>

        {/* Kepala Yayasan Routes */}
        <Route element={<ProtectedRoute allowedRoles={['kepala-yayasan']} />}>
          <Route path="/kepala-yayasan/dashboard" element={<YayasanDashboard />} />
          <Route path="/kepala-yayasan/daftar-aset" element={<YayasanDaftarAset />} />
          <Route path="/kepala-yayasan/persetujuan" element={<YayasanPersetujuanPengadaan />} />
          <Route path="/kepala-yayasan/perbaikan" element={<YayasanPerbaikanAset />} />
          <Route path="/kepala-yayasan/profile" element={<YayasanProfile />} />
          <Route path="/kepala-yayasan/notifikasi" element={<YayasanNotifikasi />} />
        </Route>

        {/* Super Admin Routes */}
        <Route element={<ProtectedRoute allowedRoles={['super-admin']} />}>
          <Route path="/super-admin/dashboard" element={<SuperDashboard />} />
          <Route path="/super-admin/daftar-aset" element={<SuperDaftarAset />} />
          <Route path="/super-admin/pengadaan" element={<SuperPengadaanAset />} />
          <Route path="/super-admin/perbaikan" element={<SuperPerbaikanAset />} />
          <Route path="/super-admin/manajemen-pengguna" element={<SuperManajemenPengguna />} />
          <Route path="/super-admin/profile" element={<SuperProfile />} />
          <Route path="/super-admin/notifikasi" element={<SuperNotifikasi />} />
        </Route>

        {/* Redirect Root to /login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* Catch-all Route redirects to /login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

