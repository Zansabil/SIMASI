<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Gate; // <-- Wajib ditambahkan

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        // 1. Gerbang khusus Super Admin (Kelola User)
        Gate::define('kelola-user', function ($user) {
            return $user->id_peran == 1; 
        });

        // 2. Gerbang khusus Kepala Yayasan (Persetujuan Pengadaan)
        Gate::define('setuju-pengadaan', function ($user) {
            return $user->id_peran == 2;
        });

        // 3. Gerbang khusus Admin Unit (Kelola Fisik Aset)
        Gate::define('kelola-aset', function ($user) {
            return $user->id_peran == 3;
        });

        // 4. Gerbang khusus Petugas Perbaikan (Ubah Status Servis)
        Gate::define('update-perbaikan', function ($user) {
            return $user->id_peran == 4;
        });

        // Catatan: Guru (id_peran = 5) tidak perlu Gate khusus karena 
        // fitur dasar (lihat aset, lapor rusak, ajukan barang) bisa diakses oleh semua peran (id 2,3,4,5).
    }
}