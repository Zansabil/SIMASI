<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\pengguna;

class laporan_kerusakan extends Model
{
   use HasFactory;

    // 1. Menentukan nama tabel yang sesuai di database (phpMyAdmin)
    protected $table = 'laporan_kerusakan';

    // 2. Memberitahu Laravel nama kolom timestamp custom buatanmu
    const CREATED_AT = 'tgl_dibuat';
    const UPDATED_AT = 'tgl_diperbaharui'; 

    // 3. Mendaftarkan kolom apa saja yang boleh diisi data (Mass Assignment)
    protected $fillable = [
        'id_aset',
        'id_pelapor',
        'deskripsi',
        'kategori_aset',
        'tgl_laporan',
        'status_kerusakan',
        'id_validasi',
        'tgl_validasi',
        'lampiran',
        'alasan_penolakan'
    ]; 
 

// 1. Relasi ke tabel Aset
    public function aset()
    {
        return $this->belongsTo(aset::class, 'id_aset');
    }

    // 2. Relasi ke tabel pengguna (sebagai Pelapor)
    public function pelapor()
    {
        return $this->belongsTo(pengguna::class, 'id_pelapor');
    }

    // 3. Relasi ke tabel pengguna (sebagai Pemvalidasi/Admin)
    public function validator()
    {
        return $this->belongsTo(pengguna::class, 'id_validasi');
    }
}