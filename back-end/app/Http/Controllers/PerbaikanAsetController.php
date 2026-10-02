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
            
            // A. Ubah status laporan jadi Selesai dan update tanggal
            $updateData = ['status_kerusakan' => 'Selesai'];
            
            if (!$laporan->tgl_mulai_perbaikan) {
                $updateData['tgl_mulai_perbaikan'] = $request->tanggal_mulai;
            }
            if (!$laporan->tgl_selesai_perbaikan) {
                $updateData['tgl_selesai_perbaikan'] = $request->tanggal_selesai ?? now();
            }
            
            $laporan->update($updateData);
            
            // B. Kembalikan status kondisi aset utama menjadi "Baik" (jika aset belum dihapus)
            $aset = Aset::find($laporan->id_aset);
            if ($aset) {
                $aset->update(['kondisi_aset' => 'Baik']);
            }

            // C. Kembalikan kondisi sub-aset (unit spesifik) menjadi 'Baik' dan status 'Tersedia'
            if ($laporan->deskripsi) {
                if (preg_match('/\(Unit:\s*(.*?)\)/', $laporan->deskripsi, $matches)) {
                    $kodeSubAset = trim($matches[1]);
                    $subAset = \App\Models\SubAset::where('kode_sub_aset', $kodeSubAset)->first();
                    if ($subAset) {
                        $subAset->update([
                            'kondisi_aset' => 'Baik',
                            'status_penggunaan' => 'Tersedia'
                        ]);
                    }
                }
            }

            // C. Kirim Notifikasi dan Email Selesai beserta Keterangan Lapangan & Hasil Perbaikan
            $laporan->load('pelapor'); // Pastikan relasi pelapor di-load
            \App\Models\Notifikasi::create([
                'id_pengguna'    => $laporan->id_pelapor,
                'tipe'           => 'Perbaikan Selesai',
                'pesan'          => 'Perbaikan aset ' . ($aset ? $aset->nama_aset : '') . ' telah Selesai.',
                'terbaca'        => 0,
                'waktu_terkirim' => now(),
                'tgl_dibuat'     => now()
            ]);

            if ($laporan->pelapor && $laporan->pelapor->email) {
                try {
                    \Illuminate\Support\Facades\Mail::to($laporan->pelapor->email)->send(new \App\Mail\StatusLaporanKerusakanMail(
                        'Perbaikan aset ' . ($aset ? $aset->nama_aset : '') . ' telah selesai dikerjakan.',
                        'Perbaikan Selesai',
                        $laporan->pelapor->nama,
                        $laporan->keterangan_perbaikan, // Keterangan Lapangan
                        $request->hasil,               // Hasil Perbaikan
                        $request->biaya                // Total Biaya
                    ));
                } catch (\Exception $e) {
                    \Illuminate\Support\Facades\Log::error('Email gagal dikirim: ' . $e->getMessage());
                }
            }
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