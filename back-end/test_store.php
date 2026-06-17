<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$req = new Illuminate\Http\Request();
$req->merge([
    'kode_inventaris' => 'TEST-002',
    'nama_aset' => 'TEST',
    'jenis_aset' => 'Umum',
    'unit' => 'MA',
    'ruangan' => 'Ruang Guru',
    'jumlah_aset' => 1,
    'kondisi_aset' => 'Baik',
    'tgl_diperoleh' => '2026-01-01',
    'harga_aset' => 1000
]);

$user = App\Models\Pengguna::find(15) ?? App\Models\Pengguna::first();
auth()->login($user);

$controller = app()->make(App\Http\Controllers\AsetController::class);
try {
    $response = $controller->store($req);
    echo $response->getContent();
} catch (\Exception $e) {
    echo "ERROR: " . $e->getMessage();
}
