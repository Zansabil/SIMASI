<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();
$recent = Illuminate\Support\Facades\DB::table('riwayat_aset')->orderBy('id', 'desc')->limit(5)->get();
echo json_encode($recent);
