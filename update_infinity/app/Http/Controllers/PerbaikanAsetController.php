<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\PerbaikanAset;
use App\Models\LaporanKerusakan;
use App\Models\Pengguna;
use App\Models\Aset;

class PerbaikanAsetController extends Controller
{
    // 1. READ: Menampilkan semua data riwayat perbaikan (Format JSON)
    public function index()
    {
        // Mengambil data perbaikan beserta relasi laporan, aset terkait, dan petugas teknisi
        $perbaikans = PerbaikanAset::with(['laporan.aset', 'petugas'])->orderBy('tgl_dibuat', 'desc')->get();
        
        return response()->json([
            'success' => true,
            'message' => 'Daftar riwayat perbaikan aset berhasil diambil.',
            'data'    => $perbaikans
        ], 200);
    }

    // 2. STORE: Menyimpan data perbaikan baru dari inputan form di ReactJS
    public function store(Request $request)
    {
        // 1. Validasi input dari API
        $request->validate([
            'id_laporan'       => 'required',
            'id_petugas'       => 'required',
            'tanggal_mulai'    => 'required|date',
            'status_perbaikan' => 'required',
            'biaya'            => 'nullable|numeric' 
        ]);

        // 2. Simpan ke tabel perbaikan_aset
        $perbaikan = PerbaikanAset::create([
            'id_laporan'       => $request->id_laporan,
            'id_petugas'       => $request->id_petugas,
            'tanggal_mulai'    => $request->tanggal_mulai,
            'tanggal_selesai'  => $request->tanggal_selesai,
            'status_perbaikan' => $request->status_perbaikan,
            'hasil'            => $request->hasil,
            'biaya'            => $request->biaya ?? 0, 
        ]);

        // 3. LOGIKA SINKRONISASI otomatis jika perbaikan langsung dinyatakan 'Selesai'
        if ($request->status_perbaikan == 'Selesai') {
            
            // Cari data laporan kerusakan terkait
            $laporan = LaporanKerusakan::findOrFail($request->id_laporan);
            
            // A. Ubah status laporan jadi Selesai
            $laporan->update(['status_kerusakan' => 'Selesai']);
            
            // B. Kembalikan status kondisi aset utama menjadi "Baik"
            $aset = Aset::findOrFail($laporan->id_aset);
            $aset->update(['kondisi_aset' => 'Baik']);
        }

        return response()->json([
            'success' => true,
            'message' => 'Data perbaikan berhasil dicatat dan status sinkronisasi berhasil diproses!',
            'data'    => $perbaikan
        ], 201); // 201 Created
    }

    // 3. (Opsional) DETAIL: Menampilkan satu data perbaikan berdasarkan ID
    public function show($id)
    {
        $perbaikan = PerbaikanAset::with(['laporan.aset', 'petugas'])->findOrFail($id);

        return response()->json([
            'success' => true,
            'message' => 'Detail data perbaikan berhasil ditemukan.',
            'data'    => $perbaikan
        ], 200);
    }
}