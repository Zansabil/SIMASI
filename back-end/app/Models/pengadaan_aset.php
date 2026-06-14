<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class pengadaan_aset extends Model
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
        'tgl_pengajuan',
        'lokasi_penempatan',
        'jumlah_barang',
        'harga_barang',
        'alasan',             
        'status_pengajuan',
        'catatan_penolakan'   // <--- Tambahkan baris ini
    ];

    // 5. Relasi: Panggil data pemohon (pengguna)
    public function pengguna()
    {
        return $this->belongsTo(pengguna::class, 'idpengguna', 'id');
    }
}