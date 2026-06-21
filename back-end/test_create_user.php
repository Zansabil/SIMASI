<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

try {
    $pengguna = \App\Models\Pengguna::create([
        'nama'          => 'budi gusnaidi',
        'nama_pengguna' => 'budi',
        'email'         => 'budi@gmail.com',
        'password'      => \Illuminate\Support\Facades\Hash::make('12345678'),
        'id_peran'      => 3,
        'status_aktif'  => 1,
        'area'          => 'SMP'
    ]);
    echo "SUCCESS: " . $pengguna->id;
} catch (\Exception $e) {
    echo "ERROR: " . $e->getMessage();
}
