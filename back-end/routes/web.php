<?php

use Illuminate\Support\Facades\Route;

// Rute dasar (Root) untuk mengecek apakah server Laravel hidup
Route::get('/', function () {
    return response()->json([
        'status' => 'OK',
        'message' => 'Server Backend Manajemen Aset Berjalan Lancar!',
        'waktu_server' => now()
    ]);
});

// Fallback Route: Menyerahkan semua URL yang tidak dikenal ke Frontend (React)
Route::fallback(function () {
    // Mengecek beberapa kemungkinan lokasi file index.html milik React di server
    $paths = [
        public_path('index.html'),
        base_path('index.html'),
        $_SERVER['DOCUMENT_ROOT'] . '/index.html'
    ];

    foreach ($paths as $path) {
        if (file_exists($path)) {
            // Karena kita membaca file HTML, pastikan Content-Type adalah text/html
            return response(file_get_contents($path))->header('Content-Type', 'text/html');
        }
    }

    return response()->json([
        'message' => 'File index.html React tidak ditemukan di server. Pastikan Anda sudah mengupload isi folder "dist" ke htdocs.'
    ], 404);
});