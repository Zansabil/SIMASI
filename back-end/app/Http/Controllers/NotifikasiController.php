<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\notifikasi;

class NotifikasiController extends Controller
{
    // [FUNGSI TAMBAHAN] READ: Menarik daftar notifikasi untuk user yang sedang login
    public function index()
    {
        // Menarik notifikasi milik user yang login, diurutkan dari yang terbaru
        $notifikasi = notifikasi::where('id_pengguna', auth()->user()->id)
                                ->orderBy('id', 'desc') 
                                ->get();

        return response()->json([
            'success' => true,
            'message' => 'Daftar notifikasi berhasil diambil.',
            'data'    => $notifikasi
        ], 200);
    }

    // UPDATE: Fungsi untuk menandai 1 notifikasi sudah dibaca
    public function tandaiDibaca($id)
    {
        $notif = notifikasi::where('id', $id)
                           ->where('id_pengguna', auth()->user()->id)
                           ->first();
        
        if ($notif) {
            $notif->update(['terbaca' => 1]);
            
            return response()->json([
                'success' => true,
                'message' => 'Notifikasi berhasil ditandai sudah dibaca.',
                'data'    => $notif
            ], 200);
        }

        // Jika notifikasi tidak ada atau bukan milik user tersebut
        return response()->json([
            'success' => false,
            'message' => 'Notifikasi tidak ditemukan atau Anda tidak memiliki akses.'
        ], 404); // 404 Not Found
    }

    // UPDATE: Fungsi sapu jagat: Tandai semua sudah dibaca
    public function tandaiSemuaDibaca()
    {
        // Mengubah semua notifikasi yang belum terbaca (0) menjadi terbaca (1)
        $jumlahDiupdate = notifikasi::where('id_pengguna', auth()->user()->id)
                                    ->where('terbaca', 0)
                                    ->update(['terbaca' => 1]);

        return response()->json([
            'success' => true,
            'message' => 'Semua notifikasi telah ditandai sudah dibaca.',
            'jumlah_diupdate' => $jumlahDiupdate
        ], 200);
    }
}