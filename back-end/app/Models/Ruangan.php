<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Ruangan extends Model
{
    use HasFactory;

    // 👇 Letakkan di sini 👇
    public $timestamps = false;

    protected $table = 'ruangan';

    protected $fillable = [
        'kode_ruangan', 
        'nama_ruangan'
    ];

    public function aset()
    {
        return $this->hasMany(Aset::class, 'id_ruangan', 'id');
    }
}