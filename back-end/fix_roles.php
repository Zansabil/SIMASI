<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$petugas = \App\Models\Pengguna::where('email', 'petugasperbaikan@gmail.com')->first();
if ($petugas) {
    $petugas->id_peran = 4; // Petugas Perbaikan
    $petugas->save();
}

$guru = \App\Models\Pengguna::where('email', 'guru@gmail.com')->first();
if ($guru) {
    $guru->id_peran = 5; // Guru
    $guru->save();
}

echo "Roles fixed successfully.\n";
