<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\LaporanKerusakan;
use App\Models\Aset;
use Illuminate\Support\Facades\Mail;
use App\Mail\StatusLaporanKerusakanMail;
use App\Models\Pengguna;
use App\Models\Notifikasi;
use Illuminate\Support\Facades\Storage;

class LaporanKerusakanController extends Controller
{
    // 1. Tampil Data (READ)
    public function index()
    {
        // Eager Loading untuk efisiensi query saat dikirim ke Frontend
        $laporans = LaporanKerusakan::with(['aset', 'pelapor', 'validator'])->get();
        
        return response()->json([
            'success' => true,
            'message' => 'Daftar laporan kerusakan berhasil diambil.',
            'data'    => $laporans
        ], 200);
    }

    // 2. Detail Data (READ SINGLE) - Berguna jika React ingin melihat detail 1 laporan
    public function show($id)
    {
        $laporan = LaporanKerusakan::with(['aset', 'pelapor', 'validator'])->findOrFail($id);
        
        return response()->json([
            'success' => true,
            'message' => 'Detail laporan berhasil diambil.',
            'data'    => $laporan
        ], 200);
    }

    // 3. Fungsi untuk menyetujui laporan kerusakan
    public function validasi($id)
    {
        $laporan = LaporanKerusakan::with('aset')->findOrFail($id);

        $laporan->update([
            'id_validasi'      => auth()->user()->id, // Mencatat ID Super Admin/Admin dari token Sanctum
            'tgl_validasi'     => now(),              
            'status_kerusakan' => 'Diproses'          
        ]);

        Notifikasi::create([
            'id_pengguna'    => $laporan->id_pelapor,
            'tipe'           => 'Status Laporan',
            'pesan'          => 'Laporan kerusakan aset ' . ($laporan->aset ? $laporan->aset->nama_barang : '') . ' telah disetujui dan akan segera diproses.',
            'terbaca'        => 0,
            'waktu_terkirim' => now(),
            'tgl_dibuat'     => now()
        ]);

        if ($laporan->pelapor && $laporan->pelapor->email) {
            try {
                Mail::to($laporan->pelapor->email)->send(new StatusLaporanKerusakanMail(
                    'Laporan kerusakan aset ' . ($laporan->aset ? $laporan->aset->nama_barang : '') . ' telah disetujui dan akan segera diproses.',
                    'Status Laporan',
                    $laporan->pelapor->nama
                ));
            } catch (\Exception $e) {
                \Illuminate\Support\Facades\Log::error('Email gagal dikirim: ' . $e->getMessage());
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Laporan kerusakan berhasil disetujui dan siap diperbaiki!',
            'data'    => $laporan
        ], 200);
    }

    // 4. Fungsi untuk menolak laporan kerusakan dengan alasan
    public function tolak(Request $request, $id)
    {
        $request->merge([
            'alasan_penolakan' => $request->has('alasan_penolakan') ? strip_tags($request->alasan_penolakan) : null
        ]);

        $request->validate([
            'alasan_penolakan' => 'required'
        ], [
            'alasan_penolakan.required' => 'Alasan penolakan wajib diisi!'
        ]);

        $laporan = LaporanKerusakan::with('aset')->findOrFail($id);

        $laporan->update([
            'id_validasi'      => auth()->user()->id, 
            'tgl_validasi'     => now(),
            'status_kerusakan' => 'Ditolak',           
            'alasan_penolakan' => $request->alasan_penolakan 
        ]);

        Notifikasi::create([
            'id_pengguna'    => $laporan->id_pelapor,
            'tipe'           => 'Status Laporan',
            'pesan'          => 'Laporan kerusakan aset ' . ($laporan->aset ? $laporan->aset->nama_barang : '') . ' ditolak. Alasan: ' . $request->alasan_penolakan,
            'terbaca'        => 0,
            'waktu_terkirim' => now(),
            'tgl_dibuat'     => now()
        ]);

        if ($laporan->pelapor && $laporan->pelapor->email) {
            try {
                Mail::to($laporan->pelapor->email)->send(new StatusLaporanKerusakanMail(
                    'Laporan kerusakan aset ' . ($laporan->aset ? $laporan->aset->nama_barang : '') . ' ditolak. Alasan: ' . $request->alasan_penolakan,
                    'Status Laporan',
                    $laporan->pelapor->nama
                ));
            } catch (\Exception $e) {
                \Illuminate\Support\Facades\Log::error('Email gagal dikirim: ' . $e->getMessage());
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Laporan kerusakan telah ditolak beserta alasannya.',
            'data'    => $laporan
        ], 200);
    }

    // 5. Simpan Data Baru (STORE)
    public function store(Request $request)
    {
        $request->merge([
            'deskripsi' => $request->has('deskripsi') ? strip_tags($request->deskripsi) : null,
            'kategori_aset' => $request->has('kategori_aset') ? strip_tags($request->kategori_aset) : null
        ]);

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

        $laporan = LaporanKerusakan::create($data);

        $aset = Aset::find($request->id_aset);
        Notifikasi::create([
            'id_pengguna'    => auth()->user()->id,
            'tipe'           => 'Laporan Kerusakan',
            'pesan'          => 'Laporan kerusakan untuk aset ' . ($aset ? $aset->nama_barang : '') . ' berhasil dikirim dan menunggu validasi.',
            'terbaca'        => 0,
            'waktu_terkirim' => now(),
            'tgl_dibuat'     => now()
        ]);

        $pengguna = auth()->user();
        if ($pengguna && $pengguna->email) {
            try {
                Mail::to($pengguna->email)->send(new StatusLaporanKerusakanMail(
                    'Laporan kerusakan untuk aset ' . ($aset ? $aset->nama_barang : '') . ' berhasil dikirim dan menunggu validasi.',
                    'Laporan Kerusakan',
                    $pengguna->nama
                ));
            } catch (\Exception $e) {
                \Illuminate\Support\Facades\Log::error('Email gagal dikirim: ' . $e->getMessage());
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Laporan kerusakan berhasil dikirim secara otomatis!',
            'data'    => $laporan
        ], 201); // 201 Created
    }

    // 6. Simpan Perubahan / Validasi (UPDATE)
    public function update(Request $request, $id)
    {
        $sanitizeFields = ['deskripsi', 'status_kerusakan'];
        $sanitizedData = [];
        foreach ($sanitizeFields as $field) {
            if ($request->has($field)) {
                $sanitizedData[$field] = strip_tags($request->input($field));
            }
        }
        if (!empty($sanitizedData)) {
            $request->merge($sanitizedData);
        }

        $request->validate([
            'status_kerusakan' => 'required',
            'deskripsi'        => 'required',
            'lampiran'         => 'nullable|image|mimes:jpeg,png,jpg|max:2048'
        ]);

        $laporan = LaporanKerusakan::findOrFail($id);
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
        $laporan = LaporanKerusakan::findOrFail($id);
        
        // Catat ke riwayat_aset sebelum dihapus
        \App\Models\RiwayatAset::create([
            'id_aset'     => $laporan->id_aset,
            'aksi'        => 'Hapus',
            'id_pengguna' => auth()->id() ?? 1,
            'keterangan'  => 'Menghapus laporan kerusakan dan riwayat perbaikan terkait secara permanen.',
            'waktu'       => now()
        ]);

        // Hapus child records di tabel perbaikan_aset untuk mencegah foreign key constraint violation
        \App\Models\PerbaikanAset::where('id_laporan', $id)->delete();

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

    // 8. Update Progress Perbaikan (Khusus Petugas)
    public function updateProgress(Request $request, $id)
    {
        $sanitizeFields = ['status_kerusakan', 'keterangan_perbaikan'];
        $sanitizedData = [];
        foreach ($sanitizeFields as $field) {
            if ($request->has($field)) {
                $sanitizedData[$field] = strip_tags($request->input($field));
            }
        }
        if (!empty($sanitizedData)) {
            $request->merge($sanitizedData);
        }

        $request->validate([
            'status_kerusakan' => 'required|string',
            'keterangan_perbaikan' => 'nullable|string'
        ]);

        $laporan = LaporanKerusakan::with('aset')->findOrFail($id);
        
        $laporan->update([
            'status_kerusakan' => $request->status_kerusakan,
            'keterangan_perbaikan' => $request->keterangan_perbaikan
        ]);

        Notifikasi::create([
            'id_pengguna'    => $laporan->id_pelapor,
            'tipe'           => 'Progress Perbaikan',
            'pesan'          => 'Status perbaikan aset ' . ($laporan->aset ? $laporan->aset->nama_barang : '') . ' telah diperbarui menjadi: ' . $request->status_kerusakan . '.',
            'terbaca'        => 0,
            'waktu_terkirim' => now(),
            'tgl_dibuat'     => now()
        ]);

        if ($laporan->pelapor && $laporan->pelapor->email) {
            try {
                Mail::to($laporan->pelapor->email)->send(new StatusLaporanKerusakanMail(
                    'Status perbaikan aset ' . ($laporan->aset ? $laporan->aset->nama_barang : '') . ' telah diperbarui menjadi: ' . $request->status_kerusakan . '.',
                    'Progress Perbaikan',
                    $laporan->pelapor->nama
                ));
            } catch (\Exception $e) {
                \Illuminate\Support\Facades\Log::error('Email gagal dikirim: ' . $e->getMessage());
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Progress perbaikan berhasil diperbarui.',
            'data'    => $laporan
        ], 200);
    }
}