<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

use Illuminate\Database\Eloquent\SoftDeletes;

class KodeRegistrasi extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'kode_registrasi';

    protected $fillable = [
        'kode',
        'keterangan',
        'id_peran',
        'status_aktif'
    ];

    public function pengguna()
    {
        return $this->hasMany(Pengguna::class, 'id_kode_registrasi', 'id');
    }

    // Peran (role) yang akan diberikan kepada akun yang mendaftar dengan kode ini
    public function peran()
    {
        return $this->belongsTo(Peran::class, 'id_peran', 'id');
    }
}
