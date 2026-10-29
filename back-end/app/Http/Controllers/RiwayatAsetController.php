<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\RiwayatAset;

class RiwayatAsetController extends Controller
{
    // 1. READ: Menampilkan daftar riwayat aset untuk semua role (dengan search & filter)
    public function index(Request $request)
    {
        $query = RiwayatAset::with([
            'pengguna:id,nama,nama_pengguna,email,area,id_peran',
            'pengguna.peran:id,nama',
            'aset' => function ($q) {
                $q->withTrashed()->with(['lokasiUnit:id,nama_unit', 'ruangan:id,nama_ruangan']);
            }
        ]);

        // Filter pencarian teks
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('aksi', 'like', "%{$search}%")
                  ->orWhere('keterangan', 'like', "%{$search}%")
                  ->orWhereHas('aset', function ($sub) use ($search) {
                      $sub->withTrashed()
                          ->where('nama_aset', 'like', "%{$search}%")
                          ->orWhere('kode_inventaris', 'like', "%{$search}%");
                  })
                  ->orWhereHas('pengguna', function ($sub) use ($search) {
                      $sub->withTrashed()
                          ->where('nama', 'like', "%{$search}%")
                          ->orWhere('nama_pengguna', 'like', "%{$search}%");
                  });
            });
        }

        // Filter berdasarkan jenis aksi (Penambahan, Perubahan, Penghapusan, dll)
        if ($request->filled('aksi') && $request->aksi !== 'semua') {
            $query->where('aksi', $request->aksi);
        }

        // Filter berdasarkan unit kerja
        if ($request->filled('unit') && $request->unit !== 'semua') {
            $unit = $request->unit;
            $query->whereHas('aset', function ($sub) use ($unit) {
                $sub->withTrashed()->whereHas('lokasiUnit', function ($lu) use ($unit) {
                    $lu->where('nama_unit', $unit);
                });
            });
        }

        $perPage = (int) $request->input('per_page', 10);
        if ($perPage <= 0) $perPage = 10;
        
        $riwayats = $query->orderBy('waktu', 'desc')->paginate($perPage);

        return response()->json([
            'success' => true,
            'message' => 'Daftar riwayat aset berhasil diambil.',
            'data'    => $riwayats
        ], 200);
    }

    // 2. DELETE: Menghapus data riwayat aset (Khusus Super Admin / id_peran = 1)
    public function destroy($id)
    {
        // Proteksi: Hanya Super Admin (id_peran = 1) yang boleh menghapus riwayat
        if (auth()->user()->id_peran != 1) {
            return response()->json([
                'success' => false,
                'message' => 'Akses Ditolak! Hanya Super Admin yang boleh menghapus log riwayat aset.'
            ], 403);
        }

        $riwayat = RiwayatAset::find($id);
        if (!$riwayat) {
            return response()->json([
                'success' => false,
                'message' => 'Data riwayat tidak ditemukan.'
            ], 404);
        }

        $riwayat->delete();

        return response()->json([
            'success' => true,
            'message' => 'Data riwayat aset berhasil dihapus permanen.'
        ], 200);
    }
}