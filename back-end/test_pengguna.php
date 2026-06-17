<?php
try {
    $penggunas = \App\Models\pengguna::with('peran')->get();
    echo "OK";
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
} catch (\Error $e) {
    echo "Fatal Error: " . $e->getMessage() . "\n";
}
