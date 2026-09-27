<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();
$ids = Illuminate\Support\Facades\DB::table('pengguna')->pluck('id')->toArray();
echo json_encode($ids);
