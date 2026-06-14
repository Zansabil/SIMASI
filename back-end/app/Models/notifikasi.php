<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class notifikasi extends Model
{
    use HasFactory;

    // 1. Definisikan nama tabel secara eksplisit
    protected $table = 'notifikasi';

    // 2. Nonaktifkan timestamps otomatis Laravel karena kita pakai nama kolom custom (tgl_dibuat)
    // dan tidak ada kolom updated_at di database Anda
    public $timestamps = false; 

    // 3. Tentukan kolom mana saja yang boleh diisi (Mass Assignment)
    protected $fillable = [
        'id_pengguna',
        'tipe',
        'pesan',
        'terbaca',
        'waktu_terkirim',
        'tgl_dibuat'
    ];

    // 4. Ubah tipe data saat ditarik dari database (Casting)
    protected $casts = [
        'terbaca' => 'boolean', // Mengubah 0/1 menjadi false/true
        'waktu_terkirim' => 'datetime',
        'tgl_dibuat' => 'datetime',
    ];

    // ==========================================
    // RELASI ANTAR TABEL
    // ==========================================

    /**
     * Relasi ke tabel pengguna (Notifikasi ini milik siapa?)
     * Hubungannya: Many-to-One (Banyak notifikasi untuk 1 pengguna)
     */
    public function pengguna()
    {
        return $this->belongsTo(pengguna::class, 'id_pengguna', 'id');
    }
}