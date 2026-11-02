<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens; // <-- 1. Tambahkan pemanggil Sanctum API Token di sini
use Illuminate\Database\Eloquent\SoftDeletes;

class Pengguna extends Authenticatable
{
    // 2. Tambahkan HasApiTokens ke dalam trait yang digunakan oleh class ini
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes; 

    // 1. Beritahu Laravel nama tabel yang benar di database
    protected $table = 'pengguna';

    // 2. Kolom apa saja yang diizinkan untuk diisi (Mass Assignment)
    protected $fillable = [
        'nama',
        'nama_pengguna',
        'email',
        'no_telepon',
        'password',
        'foto_profil',
        'area',
        'jabatan',
        'status_aktif',
        'id_peran',
        'id_kode_registrasi'
    ];

    // 2.5 Tambahkan attribute virtual 'jabatan' dan 'nama_jabatan' ke output JSON
    protected $appends = ['jabatan', 'nama_jabatan'];

    public function getNamaJabatanAttribute()
    {
        // Utamakan kolom jabatan yang tersimpan pada tabel pengguna (misal dari kode registrasi)
        $rawJabatan = $this->attributes['jabatan'] ?? null;
        if (!empty($rawJabatan)) {
            return $rawJabatan;
        }

        // Fallback ke jabatan pada kode registrasi jika relasi sudah dimuat
        if ($this->relationLoaded('kodeRegistrasi') && $this->kodeRegistrasi && !empty($this->kodeRegistrasi->jabatan)) {
            return $this->kodeRegistrasi->jabatan;
        }

        return $this->peran ? $this->peran->nama : 'Unknown';
    }

    public function getJabatanAttribute()
    {
        $baseJabatan = $this->nama_jabatan;

        if ($this->area && $this->area !== '-') {
            if ($baseJabatan === 'Admin Unit') {
                return 'Admin ' . $this->area;
            }
            if (!str_ends_with(strtolower($baseJabatan), ' ' . strtolower($this->area))) {
                return $baseJabatan . ' ' . $this->area;
            }
        }

        return $baseJabatan;
    }

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
        return $this->belongsTo(Peran::class, 'id_peran');
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



    public function aset()
    {
        // 1 Pengguna bisa memegang "Banyak" (hasMany) Aset
        return $this->hasMany(Aset::class, 'id_pengguna', 'id');
    }

    public function kodeRegistrasi()
    {
        return $this->belongsTo(KodeRegistrasi::class, 'id_kode_registrasi', 'id');
    }
}