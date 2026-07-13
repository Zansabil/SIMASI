<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

try {
    $user = \App\Models\Pengguna::where('nama_pengguna', 'zansabil')->first();
    if ($user) {
        $user->delete();
        echo "User deleted successfully.\n";
    } else {
        echo "User not found.\n";
    }
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
