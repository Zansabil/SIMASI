<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\RiwayatAset;

class RiwayatAsetController extends Controller
{
    // 1. READ: Menampilkan daftar riwayat dengan sistem halaman / pagination (Format JSON)
    public function index()
    {
        // 👇 SATPAM BACKEND: Cek apakah yang login ini BUKAN Admin (id_peran != 1)
        if (auth()->user()->id_peran != 1) {
            // Jika bukan admin, tolak aksesnya dan kembalikan status 403 Forbidden ke ReactJS
            return response()->json([
                'success' => false,
                'message' => 'Akses Ditolak! Anda tidak memiliki izin untuk melihat Log Riwayat Sistem.'
            ], 403);
        }

        // Jika dia Admin, silakan masuk dan muat datanya (Menggunakan pagination 50 data per halaman)
        $riwayats = RiwayatAset::with(['pengguna', 'aset'])->orderBy('waktu', 'desc')->paginate(50);
        
        return response()->json([
            'success' => true,
            'message' => 'Daftar riwayat sistem berhasil diambil.',
            'data'    => $riwayats // <-- Akan menghasilkan JSON berisi data beserta info link pagination
        ], 200);
    }

    // 2. DELETE: Fungsi menghapus riwayat (KHUSUS ADMIN)
    public function destroy($id)
    {
        // Proteksi ganda: Pastikan hanya peran Admin (id_peran = 1) yang bisa mengeksekusi lewat API
        if (auth()->user()->id_peran != 1) {
            return response()->json([
                'success' => false,
                'message' => 'Akses Ditolak! Hanya Admin yang boleh menghapus log riwayat.'
            ], 403);
        }

        $riwayat = RiwayatAset::findOrFail($id);
        $riwayat->delete();

        return response()->json([
            'success' => true,
            'message' => 'Data riwayat berhasil dihapus permanen.'
        ], 200);
    }
}