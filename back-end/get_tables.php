<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$tables = Illuminate\Support\Facades\DB::select('SHOW TABLES');
$names = array_map(fn($t) => $t->Tables_in_manajemen_asset, $tables);
echo "Tabel tersisa (" . count($names) . "):\n";
foreach ($names as $n) {
    echo "  - $n\n";
}
