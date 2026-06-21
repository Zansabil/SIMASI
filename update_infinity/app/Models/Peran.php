<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Peran extends Model
{
    use HasFactory;

    // 1. Nama tabel
    protected $table = 'peran';

    const CREATED_AT = 'tgl_dibuat';
    const UPDATED_AT = 'tgl_diperbaharui';

    // 3. Kolom yang boleh diisi
    protected $fillable = [
        'nama',
        'deskripsi',
    ];
}
