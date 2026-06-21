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