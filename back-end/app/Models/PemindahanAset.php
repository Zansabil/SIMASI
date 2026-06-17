<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PemindahanAset extends Model
{
    use HasFactory;

    // 1. Beri tahu Laravel nama tabel pastinya di database
    protected $table = 'pemindahan_aset';

    // 2. Sesuaikan nama kolom timestamp bawaan Laravel dengan milikmu
    const CREATED_AT = 'tgl_dibuat';
    const UPDATED_AT = 'tgl_diperbaharui';

    // 3. Daftarkan kolom-kolom yang boleh diisi data (Fillable)
    protected $fillable = [
        'id_aset',
        'lokasi_sebelumnya',
        'lokasi_baru',
        'id_pemindahan', // Sesuai dengan yang ada di gambar
        'tgl_pindah',
        'alasan_pemindahan',
        'status_aset',
        'id_pengguna'
    ];

    // 4. (Opsional tapi Penting) Relasi ke tabel Aset
    // Ini agar nanti kita bisa dengan mudah memanggil nama aset yang dipindah
    public function aset()
    {
        return $this->belongsTo(Aset::class, 'id_aset', 'id');
    }
// 👇 TAMBAHKAN FUNGSI RELASI INI 👇
    public function pengguna()
    {
        // Hubungannya: Pemindahan ini "Milik" (belongsTo) seorang Pengguna
        // belongsTo(ModelTujuan::class, 'foreign_key_di_tabel_ini', 'primary_key_di_tabel_tujuan')
        return $this->belongsTo(Pengguna::class, 'id_pengguna', 'id');
    }
}