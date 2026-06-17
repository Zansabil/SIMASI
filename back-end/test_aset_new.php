<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$aset = App\Models\Aset::orderBy('id', 'desc')->first();
echo json_encode($aset);
