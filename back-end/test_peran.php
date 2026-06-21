<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "PERAN:\n";
echo json_encode(\App\Models\Peran::all()->toArray(), JSON_PRETTY_PRINT);
