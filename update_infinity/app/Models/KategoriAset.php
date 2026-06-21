<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class KategoriAset extends Model
{
    use HasFactory;

    // 👇 Letakkan di sini 👇
    public $timestamps = false;

    // Beri tahu Laravel nama tabel aslinya
    protected $table = 'kategori_aset';

    // Kolom yang boleh diisi melalui form
    protected $fillable = [
        'kode_kategori', 
        'nama_kategori'
    ];
}