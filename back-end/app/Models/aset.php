<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes; // <--- 1. TAMBAHKAN BARIS INI DI ATAS

class Aset extends Model
{
    use HasFactory, SoftDeletes; // <--- 2. TAMBAHKAN 'SoftDeletes' DI SINI

    // 1. Menentukan nama tabel yang sesuai di database (phpMyAdmin)
    protected $table = 'aset';

    // 2. Memberitahu Laravel nama kolom timestamp custom buatanmu
    const CREATED_AT = 'tgl_dibuat';
    const UPDATED_AT = 'tgl_diperbaharui'; 

    // 3. Mendaftarkan kolom apa saja yang boleh diisi data (Mass Assignment)
    protected $fillable = [
        'kode_inventaris',
        'id_pengguna',
        'nama_aset',
        'jenis_aset',
        'lokasi_aset',
        'jumlah_aset',
        'kondisi_aset',
        'tgl_diperoleh',
        'harga_aset',
        'sumber_dana',
        'foto'
    ]; 
    //
    public function pengguna()
{
    // Aset ini "Milik" (belongsTo) seorang Pengguna
    return $this->belongsTo(Pengguna::class, 'id_pengguna', 'id');
}
}
