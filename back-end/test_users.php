<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();
$users = \App\Models\Pengguna::all();
foreach($users as $u) {
    echo $u->email . ' - id_peran: ' . $u->id_peran . "\n";
}
