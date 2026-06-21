<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LokasiUnit extends Model
{
    use HasFactory;

    protected $table = 'lokasi_unit';

    protected $fillable = [
        'nama_unit',
        'keterangan'
    ];
}
