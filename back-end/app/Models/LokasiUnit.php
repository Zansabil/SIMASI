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

    public function aset()
    {
        return $this->hasMany(Aset::class, 'id_unit', 'id');
    }

    public function pengadaan()
    {
        return $this->hasMany(PengadaanAset::class, 'id_unit', 'id');
    }
}
