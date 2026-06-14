<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\laporan_kerusakan;
use App\Models\aset;
use App\Models\pengguna;
use Illuminate\Support\Facades\Storage;

class LaporanKerusakanController extends Controller
{
    // 1. Tampil Data (READ)
    public function index()
    {
        // Eager Loading untuk efisiensi query saat dikirim ke Frontend
        $laporans = laporan_kerusakan::with(['aset', 'pelapor', 'validator'])->get();
        
        return response()->json([
            'success' => true,
            'message' => 'Daftar laporan kerusakan berhasil diambil.',
            'data'    => $laporans
        ], 200);
    }

    // 2. Detail Data (READ SINGLE) - Berguna jika React ingin melihat detail 1 laporan
    public function show($id)
    {
        $laporan = laporan_kerusakan::with(['aset', 'pelapor', 'validator'])->findOrFail($id);
        
        return response()->json([
            'success' => true,
            'message' => 'Detail laporan berhasil diambil.',
            'data'    => $laporan
        ], 200);
    }

    // 3. Fungsi untuk menyetujui laporan kerusakan
    public function validasi($id)
    {
        $laporan = laporan_kerusakan::findOrFail($id);

        $laporan->update([
            'id_validasi'      => auth()->user()->id, // Mencatat ID Super Admin/Admin dari token Sanctum
            'tgl_validasi'     => now(),              
            'status_kerusakan' => 'Diproses'          
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Laporan kerusakan berhasil disetujui dan siap diperbaiki!',
            'data'    => $laporan
        ], 200);
    }

    // 4. Fungsi untuk menolak laporan kerusakan dengan alasan
    public function tolak(Request $request, $id)
    {
        $request->validate([
            'alasan_penolakan' => 'required'
        ], [
            'alasan_penolakan.required' => 'Alasan penolakan wajib diisi!'
        ]);

        $laporan = laporan_kerusakan::findOrFail($id);

        $laporan->update([
            'id_validasi'      => auth()->user()->id, 
            'tgl_validasi'     => now(),
            'status_kerusakan' => 'Ditolak',           
            'alasan_penolakan' => $request->alasan_penolakan 
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Laporan kerusakan telah ditolak beserta alasannya.',
            'data'    => $laporan
        ], 200);
    }

    // 5. Simpan Data Baru (STORE)
    public function store(Request $request)
    {
        $request->validate([
            'id_aset'          => 'required',
            'deskripsi'        => 'required',
            'kategori_aset'    => 'required',
            'lampiran'         => 'nullable|image|mimes:jpeg,png,jpg|max:2048'
        ]);

        $data = $request->all();

        // Otomatisasi ID Pelapor dan Tanggal agar lebih aman dan tidak perlu diinput manual dari Frontend
        $data['id_pelapor'] = auth()->user()->id;
        $data['tgl_laporan'] = now();
        $data['status_kerusakan'] = 'Menunggu'; // Set default status

        if ($request->hasFile('lampiran')) {
            $data['lampiran'] = $request->file('lampiran')->store('lampiran', 'public');
        }

        $laporan = laporan_kerusakan::create($data);

        return response()->json([
            'success' => true,
            'message' => 'Laporan kerusakan berhasil dikirim secara otomatis!',
            'data'    => $laporan
        ], 201); // 201 Created
    }

    // 6. Simpan Perubahan / Validasi (UPDATE)
    public function update(Request $request, $id)
    {
        $request->validate([
            'status_kerusakan' => 'required',
            'deskripsi'        => 'required',
            'lampiran'         => 'nullable|image|mimes:jpeg,png,jpg|max:2048'
        ]);

        $laporan = laporan_kerusakan::findOrFail($id);
        $data = $request->all();

        if ($request->hasFile('lampiran')) {
            // Hapus file foto lama jika user mengupload foto baru
            if ($laporan->lampiran) {
                Storage::disk('public')->delete($laporan->lampiran);
            }
            $data['lampiran'] = $request->file('lampiran')->store('lampiran', 'public');
        }

        $laporan->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Laporan berhasil diperbarui!',
            'data'    => $laporan
        ], 200);
    }

    // 7. Hapus Data (DELETE)
    public function destroy($id)
    {
        $laporan = laporan_kerusakan::findOrFail($id);
        
        // Hapus lampiran dari storage agar tidak jadi sampah di server
        if ($laporan->lampiran) {
            Storage::disk('public')->delete($laporan->lampiran);
        }

        $laporan->delete();

        return response()->json([
            'success' => true,
            'message' => 'Laporan kerusakan berhasil dihapus!'
        ], 200);
    }
}