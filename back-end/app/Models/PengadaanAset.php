<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PengadaanAset extends Model
{
    use HasFactory;

    // 1. Tentukan nama tabel
    protected $table = 'pengadaan_aset';

    // 2. Primary Key kustom Anda
    protected $primaryKey = 'idpengadaan_aset';

    // 3. Matikan timestamps jika Anda tidak memakai tgl_dibuat/tgl_diperbaharui bawaan Laravel
    public $timestamps = false; 

    // 4. Daftarkan kolom yang boleh diisi
    protected $fillable = [
        'idpengguna',         
        'nama_barang',
        'id_unit',            // Relasi ke tabel lokasi_unit
        'tgl_pengajuan',
        'lokasi_penempatan',
        'jumlah_barang',
        'harga_barang',
        'alasan',             
        'status_pengajuan',
        'catatan_penolakan'
    ];

    // 5. Relasi: Panggil data pemohon (pengguna)
    public function pengguna()
    {
        return $this->belongsTo(Pengguna::class, 'idpengguna', 'id');
    }

    public function lokasiUnit()
    {
        return $this->belongsTo(LokasiUnit::class, 'id_unit', 'id');
    }
}