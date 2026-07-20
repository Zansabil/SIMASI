<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SubAset extends Model
{
    use HasFactory;

    protected $table = 'sub_aset';

    const CREATED_AT = 'tgl_dibuat';
    const UPDATED_AT = 'tgl_diperbaharui';

    protected $fillable = [
        'id_aset',
        'kode_sub_aset',
        'id_ruangan',
        'kondisi_aset',
        'status_penggunaan'
    ];

    public function aset()
    {
        return $this->belongsTo(Aset::class, 'id_aset', 'id');
    }

    public function ruangan()
    {
        return $this->belongsTo(Ruangan::class, 'id_ruangan', 'id');
    }
}
