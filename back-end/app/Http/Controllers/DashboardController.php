<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\aset;
use App\Models\laporan_kerusakan;
use App\Models\pengguna;

class DashboardController extends Controller
{
    public function index()
    {
        // Menghitung statistik untuk ditampilkan di Dashboard ReactJS
        $total_aset = aset::count(); // Menghitung total seluruh jenis aset
        $aset_rusak = aset::whereIn('kondisi_aset', ['Rusak Ringan', 'Rusak Berat'])->count();
        
        $total_laporan = laporan_kerusakan::count();
        $laporan_menunggu = laporan_kerusakan::where('status_kerusakan', 'Menunggu')->count();
        
        $total_pengguna = pengguna::count();

        // Mengirim data hitungan tersebut dalam bentuk JSON
        return response()->json([
            'success' => true,
            'message' => 'Data statistik dashboard berhasil diambil.',
            'data'    => [
                'total_aset'       => $total_aset,
                'aset_rusak'       => $aset_rusak,
                'total_laporan'    => $total_laporan,
                'laporan_menunggu' => $laporan_menunggu,
                'total_pengguna'   => $total_pengguna
            ]
        ], 200);
    }
}