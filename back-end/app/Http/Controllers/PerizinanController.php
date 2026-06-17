<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Perizinan;

class PerizinanController extends Controller
{
    // 1. READ: Menampilkan semua data perizinan (Format JSON)
    public function index()
    {
        $perizinans = Perizinan::orderBy('tgl_dibuat', 'desc')->get();
        
        return response()->json([
            'success' => true,
            'message' => 'Daftar data perizinan pengajuan berhasil diambil.',
            'data'    => $perizinans
        ], 200);
    }

    // 2. STORE: Memproses pengajuan izin baru dari form di ReactJS
    public function store(Request $request)
    {
        $request->validate([
            'nama'      => 'required',
            'deskripsi' => 'required',
        ]);

        $perizinan = Perizinan::create([
            'nama'      => $request->nama,
            'aksi'      => 'Menunggu', // Default saat pertama kali diajukan
            'deskripsi' => $request->deskripsi,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Pengajuan pengadaan aset berhasil dikirim!',
            'data'    => $perizinan
        ], 201); // 201 Created
    }

    // 3. (Opsional) DETAIL: Menampilkan satu data perizinan spesifik
    public function show($id)
    {
        $perizinan = Perizinan::findOrFail($id);

        return response()->json([
            'success' => true,
            'message' => 'Detail data perizinan berhasil ditemukan.',
            'data'    => $perizinan
        ], 200);
    }

    // ======================================================
    // FUNGSI KHUSUS KEPALA YAYASAN (APPROVAL)
    // ======================================================

    // 4. UPDATE: Setujui Pengajuan
    public function setuju($id)
    {
        $izin = Perizinan::findOrFail($id);
        $izin->update(['aksi' => 'Disetujui']);

        return response()->json([
            'success' => true,
            'message' => 'Pengajuan Aset telah DISETUJUI.',
            'data'    => $izin
        ], 200);
    }

    // 5. UPDATE: Tolak Pengajuan
    public function tolak($id)
    {
        $izin = Perizinan::findOrFail($id);
        $izin->update(['aksi' => 'Ditolak']);

        return response()->json([
            'success' => true,
            'message' => 'Pengajuan Aset telah DITOLAK.',
            'data'    => $izin
        ], 200);
    }
}