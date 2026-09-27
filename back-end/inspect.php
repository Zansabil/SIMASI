<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$cols = Illuminate\Support\Facades\Schema::getColumnListing('pemindahan_aset');
$riwayat_cols = Illuminate\Support\Facades\Schema::getColumnListing('riwayat_aset');

echo "pemindahan_aset cols: \n";
print_r($cols);

echo "\nriwayat_aset cols: \n";
print_r($riwayat_cols);
