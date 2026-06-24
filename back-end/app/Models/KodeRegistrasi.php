<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class KodeRegistrasi extends Model
{
    use HasFactory;

    protected $table = 'kode_registrasi';

    protected $fillable = [
        'kode',
        'keterangan',
        'status_aktif'
    ];

    public function pengguna()
    {
        return $this->hasMany(Pengguna::class, 'id_kode_registrasi', 'id');
    }
}
