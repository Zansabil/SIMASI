<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class riwayat_aset extends Model
{
    use HasFactory;

    // 1. Tentukan nama tabel secara spesifik
    protected $table = 'riwayat_aset';

    // 2. Karena Anda menggunakan kolom 'waktu' (bukan created_at/updated_at bawaan Laravel),
    // kita matikan fitur timestamps otomatisnya agar tidak error.
    public $timestamps = false;

    // 3. Daftarkan kolom yang boleh diisi (Fillable)
    protected $fillable = [
        'id_aset',
        'aksi',          // Contoh isi: 'Tambah', 'Ubah', 'Pindah', 'Hapus'
        'id_pengguna',   // ID admin/user yang melakukan aksi
        'keterangan',    // Penjelasan detail (Misal: "Memindahkan aset dari Gudang ke Lab")
        'waktu'          // Waktu terjadinya aksi
    ];

    // 4. Relasi ke tabel 'aset'
    // Membantu kita mengetahui riwayat ini milik aset yang mana
    public function aset()
    {
        return $this->belongsTo(aset::class, 'id_aset', 'id');
    }

    // 5. Relasi ke tabel 'pengguna'
    // Membantu kita mengetahui siapa nama admin/staf pelakunya
    public function pengguna()
    {
        return $this->belongsTo(pengguna::class, 'id_pengguna', 'id');
    }
}