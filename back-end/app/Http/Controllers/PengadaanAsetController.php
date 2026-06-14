<?php

namespace App\Http\Controllers;

use App\Models\notifikasi;
use App\Models\pengguna;
use Illuminate\Http\Request;
use App\Models\pengadaan_aset;
use Illuminate\Support\Facades\Gate; // <--- PEMANGGIL SATPAM (WAJIB ADA)

class PengadaanAsetController extends Controller
{
    // 1. Menampilkan daftar pengajuan (Bisa diakses semua peran)
    public function index()
    {
        // Tarik semua data pengadaan beserta relasi ke tabel pengguna (pemohon)
        $pengadaans = pengadaan_aset::with('pengguna')->orderBy('tgl_pengajuan', 'desc')->get();
        
        return response()->json([
            'success' => true,
            'message' => 'Daftar pengajuan pengadaan aset berhasil diambil.',
            'data'    => $pengadaans
        ], 200);
    }

    // 2. Menyimpan data pengajuan ke database dari ReactJS (Bisa diakses semua peran)
    public function store(Request $request)
    {
        $request->validate([
            'nama_barang'       => 'required|string',
            'tgl_pengajuan'     => 'required|date',
            'lokasi_penempatan' => 'required|string',
            'jumlah_barang'     => 'required|integer|min:1',
            'harga_barang'      => 'required|numeric|min:0',
            'alasan'            => 'required|string'
        ]);

        $pengadaan = pengadaan_aset::create([
            // Otomatis mengambil ID pengguna yang sedang login dari token Sanctum!
            'idpengguna'        => auth()->user()->id, 
            'nama_barang'       => $request->nama_barang,
            'tgl_pengajuan'     => $request->tgl_pengajuan,
            'lokasi_penempatan' => $request->lokasi_penempatan,
            'jumlah_barang'     => $request->jumlah_barang,
            'harga_barang'      => $request->harga_barang,
            'alasan'            => $request->alasan,
            'status_pengajuan'  => 'Menunggu' // Default saat pertama diajukan
        ]);

        // 👇 PEMICU NOTIFIKASI: Kirim ke Kepala Yayasan (id_peran = 2)
        $kepalaYayasans = pengguna::where('id_peran', 2)->get();
        foreach ($kepalaYayasans as $pimpinan) {
            notifikasi::create([
                'id_pengguna'    => $pimpinan->id,
                'tipe'           => 'Pengajuan Baru',
                'pesan'          => auth()->user()->nama . ' mengajukan pengadaan aset baru: ' . $request->nama_barang . '. Mohon segera ditinjau.',
                'terbaca'        => 0, // 0 = Belum dibaca
                'waktu_terkirim' => now(),
                'tgl_dibuat'     => now()
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Pengajuan pengadaan barang berhasil dikirim dan menunggu persetujuan!',
            'data'    => $pengadaan
        ], 201); // 201 Created
    }

    // ==========================================
    // FUNGSI KHUSUS KEPALA YAYASAN (APPROVAL)
    // ==========================================

    // 3. Menyetujui Pengajuan
    public function setuju($id)
    {
        // SATPAM BACKEND: Hanya Kepala Yayasan yang bisa mengeksekusi
        Gate::authorize('setuju-pengadaan');

        // Ingat, Primary Key kamu adalah idpengadaan_aset, bukan id
        $pengadaan = pengadaan_aset::where('idpengadaan_aset', $id)->firstOrFail();
        $pengadaan->update(['status_pengajuan' => 'Disetujui']);

        // 👇 PEMICU NOTIFIKASI: Kirim balik ke pemohon
        notifikasi::create([
            'id_pengguna'    => $pengadaan->idpengguna,
            'tipe'           => 'Status Pengajuan',
            'pesan'          => 'Hore! Pengajuan pengadaan aset [' . $pengadaan->nama_barang . '] Anda telah DISETUJUI oleh Kepala Yayasan.',
            'terbaca'        => 0,
            'waktu_terkirim' => now(),
            'tgl_dibuat'     => now()
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Pengajuan barang telah DISETUJUI.',
            'data'    => $pengadaan
        ], 200);
    }

    // 4. Menolak Pengajuan
    public function tolak(Request $request, $id)
    {
        // SATPAM BACKEND: Hanya Kepala Yayasan yang bisa mengeksekusi
        Gate::authorize('setuju-pengadaan');

        // Validasi agar Kepala Yayasan wajib mengisi alasan dari ReactJS
        $request->validate([
            'catatan_penolakan' => 'required|string'
        ]);

        $pengadaan = pengadaan_aset::where('idpengadaan_aset', $id)->firstOrFail();
        
        // Update status dan simpan alasannya sekaligus
        $pengadaan->update([
            'status_pengajuan'  => 'Ditolak',
            'catatan_penolakan' => $request->catatan_penolakan
        ]);

        // 👇 PEMICU NOTIFIKASI: Kirim balik ke pemohon
        notifikasi::create([
            'id_pengguna'    => $pengadaan->idpengguna,
            'tipe'           => 'Status Pengajuan',
            'pesan'          => 'Mohon maaf, pengajuan [' . $pengadaan->nama_barang . '] Anda DITOLAK. Alasan: ' . $request->catatan_penolakan,
            'terbaca'        => 0,
            'waktu_terkirim' => now(),
            'tgl_dibuat'     => now()
        ]);

        return response()->json([
            'success' => true, // Operasi sistem berhasil memproses penolakan
            'message' => 'Pengajuan barang telah DITOLAK beserta alasannya.',
            'data'    => $pengadaan
        ], 200);
    }
}