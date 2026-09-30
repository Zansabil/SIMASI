<?php

namespace App\Http\Controllers;

use App\Models\KodeRegistrasi;
use Illuminate\Http\Request;

class KodeRegistrasiController extends Controller
{
    // Mengambil semua daftar kode
    public function index()
    {
        // Menyertakan jumlah pengguna yang menggunakan kode ini
        $kodes = KodeRegistrasi::withCount('pengguna')->get();

        return response()->json([
            'success' => true,
            'data' => $kodes
        ], 200);
    }

    // Membuat kode baru
    public function store(Request $request)
    {
        $request->validate([
            'kode' => 'required|string|unique:kode_registrasi,kode|max:255',
            'keterangan' => 'nullable|string|max:255'
        ], [
            'kode.unique' => 'Kode ini sudah digunakan.'
        ]);

        $kode = KodeRegistrasi::create([
            'kode' => $request->kode,
            'keterangan' => $request->keterangan,
            'status_aktif' => true,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Kode registrasi berhasil dibuat.',
            'data' => $kode
        ], 201);
    }

    // Mengubah status kode (aktif/nonaktif)
    public function updateStatus(Request $request, $id)
    {
        $kode = KodeRegistrasi::find($id);

        if (!$kode) {
            return response()->json([
                'success' => false,
                'message' => 'Kode tidak ditemukan.'
            ], 404);
        }

        $kode->status_aktif = !$kode->status_aktif;
        $kode->save();

        return response()->json([
            'success' => true,
            'message' => 'Status kode berhasil diperbarui.',
            'data' => $kode
        ], 200);
    }

    // Menghapus kode
    public function destroy($id)
    {
        $kode = KodeRegistrasi::withCount('pengguna')->find($id);

        if (!$kode) {
            return response()->json([
                'success' => false,
                'message' => 'Kode tidak ditemukan.'
            ], 404);
        }

        // Soft delete will handle it now

        $kode->delete();

        return response()->json([
            'success' => true,
            'message' => 'Kode registrasi berhasil dihapus.'
        ], 200);
    }

    // Mengambil log pengguna untuk kode tertentu
    public function logs($id)
    {
        $kode = KodeRegistrasi::with('pengguna')->find($id);

        if (!$kode) {
            return response()->json([
                'success' => false,
                'message' => 'Kode tidak ditemukan.'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $kode->pengguna
        ], 200);
    }
}
