<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\PemindahanAset;
use App\Models\Aset;

class PemindahanAsetController extends Controller
{
    // 1. READ: Menampilkan semua data pemindahan
    public function index()
    {
        // Mengambil semua data pemindahan, beserta data aset yang terkait (relasi)
        // Diurutkan dari yang terbaru dipindah
        // Memanggil relasi 'pengguna' agar nama admin yang mencatat bisa ditampilkan di ReactJS
        $pemindahans = PemindahanAset::with(['aset', 'pengguna'])->orderBy('tgl_dibuat', 'desc')->get();
        
        return response()->json([
            'success' => true,
            'message' => 'Daftar riwayat pemindahan aset berhasil diambil.',
            'data'    => $pemindahans
        ], 200);
    }
    
    // 2. STORE: Menyimpan data pemindahan ke database dari inputan ReactJS
    public function store(Request $request)
    {
        // 1. Validasi inputan
        $request->validate([
            'id_aset'           => 'required',
            'lokasi_sebelumnya' => 'required',
            'lokasi_baru'       => 'required',
            'tgl_pindah'        => 'required|date',
            'alasan_pemindahan' => 'required',
            'status_aset'       => 'required'
        ]);

        // 2. Buat ID Pemindahan otomatis (Misal: MUT-202603291015)
        $kode_mutasi = 'MUT-' . date('YmdHis');

        // 3. Simpan riwayat ke tabel pemindahan_aset
        $pemindahan = PemindahanAset::create([
            'id_aset'           => $request->id_aset,
            'lokasi_sebelumnya' => $request->lokasi_sebelumnya,
            'lokasi_baru'       => $request->lokasi_baru,
            'id_pemindahan'     => $kode_mutasi,
            'tgl_pindah'        => $request->tgl_pindah,
            'alasan_pemindahan' => $request->alasan_pemindahan,
            'status_aset'       => $request->status_aset,
            'id_pengguna'       => auth()->user()->id // <--- KUNCI PENTING: Otomatis dari token Sanctum
        ]);

        $aset = Aset::findOrFail($request->id_aset);
        
        $locStr = $request->lokasi_baru ?? '';
        $unit = $locStr;
        $ruangan = '';
        if (str_contains($locStr, ' - ')) {
            $parts = explode(' - ', $locStr, 2);
            $unit = $parts[0];
            $ruangan = $parts[1];
        }

        $aset->update([
            'unit' => $unit,
            'ruangan' => $ruangan
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Pemindahan berhasil dicatat dan Lokasi Aset otomatis diperbarui!',
            'data'    => $pemindahan
        ], 201); // 201 Created
    }

    // 3. (Opsional) DETAIL: Menampilkan satu data pemindahan spesifik
    public function show($id)
    {
        $pemindahan = PemindahanAset::with(['aset', 'pengguna'])->findOrFail($id);

        return response()->json([
            'success' => true,
            'message' => 'Detail pemindahan berhasil ditemukan.',
            'data'    => $pemindahan
        ], 200);
    }
}