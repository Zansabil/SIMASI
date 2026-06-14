<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class perbaikan_aset extends Model
{
    use HasFactory;

    // 1. Tentukan nama tabel secara spesifik
    protected $table = 'perbaikan_aset';

    // 2. Sesuaikan nama kolom timestamp
    const CREATED_AT = 'tgl_dibuat';
    const UPDATED_AT = 'tgl_diperbaharui';

    // 3. Daftarkan kolom yang boleh diisi (Fillable)
    protected $fillable = [
        'id_laporan',
        'id_petugas',
        'tanggal_mulai',
        'tanggal_selesai',
        'status_perbaikan',
        'hasil',
        'biaya'
    ];

    // 4. Relasi ke Laporan Kerusakan
    // Agar kita bisa tahu perbaikan ini untuk laporan yang mana dan aset apa
    public function laporan()
    {
        return $this->belongsTo(laporan_kerusakan::class, 'id_laporan', 'id');
    }

    // 5. Relasi ke Pengguna (Petugas/Teknisi)
    // Agar kita bisa memanggil nama petugas yang mengerjakan perbaikan ini
    public function petugas()
    {
        return $this->belongsTo(pengguna::class, 'id_petugas', 'id');
    }
}