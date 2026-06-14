<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class perizinan extends Model
{
    use HasFactory;

    // 1. Tentukan nama tabel secara spesifik agar Laravel tidak mencari tabel 'perizinans'
    protected $table = 'perizinan';

    // 2. Sesuaikan nama kolom timestamp bawaan dengan yang ada di database Anda
    const CREATED_AT = 'tgl_dibuat';
    const UPDATED_AT = 'tgl_diperbaharui';

    // 3. Daftarkan kolom yang boleh diisi (Fillable)
    protected $fillable = [
        'nama',
        'aksi',
        'deskripsi'
    ];

    // 4. (Opsional tapi Penting) Relasi Many-to-Many ke tabel Peran
    // Saya melihat ada tabel 'perizinan_peran' di daftar database Anda.
    // Relasi ini akan sangat berguna nanti untuk mengecek apakah suatu 'Peran' memiliki 'Perizinan' tertentu.
    public function peran()
    {
        return $this->belongsToMany(peran::class, 'perizinan_peran', 'id_perizinan', 'id_peran');
    }
}