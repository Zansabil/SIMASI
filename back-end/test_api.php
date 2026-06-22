<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$response = $kernel->handle(
    $request = Illuminate\Http\Request::capture()
);
$aset = App\Models\Aset::with('ruangan')->first();
echo json_encode($aset->toArray(), JSON_PRETTY_PRINT);
