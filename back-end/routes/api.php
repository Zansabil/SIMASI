<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\PenggunaController;
use App\Http\Controllers\AsetController;
use App\Http\Controllers\LaporanKerusakanController;
use App\Http\Controllers\PemindahanAsetController;
use App\Http\Controllers\PerbaikanAsetController;
use App\Http\Controllers\PerizinanController;
use App\Http\Controllers\PengadaanAsetController;
use App\Http\Controllers\RiwayatAsetController;
use App\Http\Controllers\NotifikasiController;
use App\Http\Controllers\KategoriAsetController;
use App\Http\Controllers\RuanganController;
use App\Http\Controllers\LokasiUnitController;
use App\Http\Controllers\KodeRegistrasiController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\SubAsetController;

// Rute awal (Opsional: Biasanya di API hanya digunakan untuk mengecek apakah server hidup)
Route::get('/', function () {
    return response()->json(['message' => 'API Sistem Manajemen Aset Berjalan Lancar', 'status' => 200]);
});

// =========================================================
// JALUR PUBLIK (Bisa diakses dari ReactJS tanpa token)
// =========================================================
// Rute GET /login & /register dihapus karena React yang akan membuat formnya.
// API hanya butuh rute POST untuk menerima datanya.
Route::post('/login', [AuthController::class, 'authenticate']);
Route::post('/register', [AuthController::class, 'storeRegister']);
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);

// Data Master Publik
Route::get('/lokasi_unit', [LokasiUnitController::class, 'index']);

// Trik cepat untuk membuat password acak (Bcrypt)
Route::get('/buat-password', function() {
    return \Illuminate\Support\Facades\Hash::make('12345678');
});

// =========================================================
// JALUR TERTUTUP (WAJIB MENYERTAKAN TOKEN API / SANCTUM)
// =========================================================
Route::middleware('auth:sanctum')->group(function () {
    
    // Logout dipindah ke sini karena butuh token untuk melakukan proses penghapusan sesi
    Route::post('/logout', [AuthController::class, 'logout']);

    // Rute Dashboard
    Route::get('/dashboard/stats', [DashboardController::class, 'index']);
    
    // Rute Profile
    Route::post('/profile', [ProfileController::class, 'updateProfile']);
    Route::put('/profile/password', [ProfileController::class, 'updatePassword']);
    
    // Route khusus Kelola Pengguna (Super Admin)
    Route::get('/pengguna', [PenggunaController::class, 'index']);
    Route::post('/pengguna', [PenggunaController::class, 'store']);
    Route::patch('/pengguna/{id}', [PenggunaController::class, 'update']);
    Route::delete('/pengguna/{id}', [PenggunaController::class, 'destroy']);
    Route::patch('/pengguna/{id}/reset-password', [PenggunaController::class, 'resetPassword']);
    
    // Route Cetak PDF & Excel (ReactJS akan memanggil rute ini untuk mengunduh file)
    Route::get('/aset/cetak/pdf', [AsetController::class, 'cetakPDF']);
    Route::get('/aset/cetak/excel', [AsetController::class, 'cetakExcel']);
    
    // Rute untuk tabel Aset (Menggunakan apiResource)
    Route::apiResource('aset', AsetController::class);
    
    // Route Edit Sub-Aset Kondisi
    Route::patch('/sub_aset/{id}/kondisi', [SubAsetController::class, 'updateKondisi']);
    Route::delete('/sub_aset/{id}', [SubAsetController::class, 'destroy']);
    
    // Route Pemindahan Aset
    Route::apiResource('pemindahan_aset', PemindahanAsetController::class);

    // Rute untuk tabel Laporan Kerusakan
    Route::apiResource('laporan_kerusakan', LaporanKerusakanController::class);
    // Rute khusus untuk memvalidasi/menolak laporan
    Route::patch('/laporan_kerusakan/{id}/validasi', [LaporanKerusakanController::class, 'validasi']);
    Route::patch('/laporan-kerusakan/{id}/tolak', [LaporanKerusakanController::class, 'tolak']);
    Route::patch('/laporan_kerusakan/{id}/progress', [LaporanKerusakanController::class, 'updateProgress']);
    
    // Route Perbaikan Aset
    Route::apiResource('perbaikan_aset', PerbaikanAsetController::class);
    
    // Route Kelola Perizinan (Hak Akses)
    Route::patch('/perizinan/{id}/setuju', [PerizinanController::class, 'setuju']);
    Route::patch('/perizinan/{id}/tolak', [PerizinanController::class, 'tolak']);
    Route::apiResource('perizinan', PerizinanController::class);
    
    // Route Pengadaan Aset & Approval
    Route::patch('/pengadaan_aset/{id}/setuju', [PengadaanAsetController::class, 'setuju']);
    Route::patch('/pengadaan_aset/{id}/tolak', [PengadaanAsetController::class, 'tolak']);
    Route::apiResource('pengadaan_aset', PengadaanAsetController::class);
    
    // Route Riwayat Aset
    Route::apiResource('riwayat_aset', RiwayatAsetController::class)->only(['index', 'destroy']);
    
    // Route Notifikasi
    // Rute untuk mengambil data notifikasi
    Route::get('/notifikasi', [NotifikasiController::class, 'index']);
    Route::patch('/notifikasi/{id}/baca', [NotifikasiController::class, 'tandaiDibaca']);
    Route::post('/notifikasi/baca-semua', [NotifikasiController::class, 'tandaiSemuaDibaca']);
    
    // Route Data Master
    Route::apiResource('kategori_aset', KategoriAsetController::class);
    Route::apiResource('ruangan', RuanganController::class);
    
    // Route Kode Registrasi (Super Admin)
    Route::get('/kode-registrasi', [KodeRegistrasiController::class, 'index']);
    Route::post('/kode-registrasi', [KodeRegistrasiController::class, 'store']);
    Route::patch('/kode-registrasi/{id}/status', [KodeRegistrasiController::class, 'updateStatus']);
    Route::delete('/kode-registrasi/{id}', [KodeRegistrasiController::class, 'destroy']);
    Route::get('/kode-registrasi/{id}/logs', [KodeRegistrasiController::class, 'logs']);
});