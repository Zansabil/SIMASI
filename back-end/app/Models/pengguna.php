<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens; // <-- 1. Tambahkan pemanggil Sanctum API Token di sini

class Pengguna extends Authenticatable
{
    // 2. Tambahkan HasApiTokens ke dalam trait yang digunakan oleh class ini
    use HasApiTokens, HasFactory, Notifiable; 

    // 1. Beritahu Laravel nama tabel yang benar di database
    protected $table = 'pengguna';

    // 2. Kolom apa saja yang diizinkan untuk diisi (Mass Assignment)
    protected $fillable = [
        'nama',
        'nama_pengguna',
        'email',
        'password',
        'area',
        'status_aktif',
        'id_peran',
    ];

    // 3. Sembunyikan kolom sensitif agar tidak bocor saat data dipanggil via API
    protected $hidden = [
        'password',
    ];

    // (Opsional tapi disarankan) Beritahu Laravel kalau kolom tanggalmu bernama lain
    const CREATED_AT = 'tgl_dibuat';
    const UPDATED_AT = 'tgl_diperbaharui';

    // ==========================================
    // RELASI ANTAR TABEL
    // ==========================================

    // Relasi ke tabel Peran (1 Pengguna punya 1 Peran)
    public function peran()
    {
        return $this->belongsTo(peran::class, 'id_peran');
    }

    // Relasi ke tabel Laporan (1 Pengguna bisa membuat banyak Laporan)
    public function laporan_dibuat()
    {
        return $this->hasMany(LaporanKerusakan::class, 'id_pelapor');
    }

    // Relasi ke tabel Laporan (1 Admin bisa memvalidasi banyak Laporan)
    public function laporan_divalidasi()
    {
        return $this->hasMany(LaporanKerusakan::class, 'id_validasi');
    }

    public function pemindahan_aset()
    {
        // Hubungannya: 1 Pengguna "Memiliki Banyak" (hasMany) catatan pemindahan
        return $this->hasMany(PemindahanAset::class, 'id_pengguna', 'id');
    }

    public function aset()
    {
        // 1 Pengguna bisa memegang "Banyak" (hasMany) Aset
        return $this->hasMany(Aset::class, 'id_pengguna', 'id');
    }
}