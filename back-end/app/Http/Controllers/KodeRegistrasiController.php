<?php

namespace App\Http\Controllers;

use App\Models\KodeRegistrasi;
use App\Models\Peran;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class KodeRegistrasiController extends Controller
{
    // Peran yang TIDAK boleh didaftarkan melalui kode registrasi
    private const PERAN_TERLARANG = ['Super Admin'];

    // Mengambil semua daftar kode
    public function index()
    {
        // Menyertakan jumlah pengguna yang menggunakan kode ini beserta peran tujuannya
        $kodes = KodeRegistrasi::with('peran:id,nama')->withCount('pengguna')->get();

        return response()->json([
            'success' => true,
            'data' => $kodes
        ], 200);
    }

    // Mengambil daftar peran yang boleh dipilih untuk kode registrasi
    public function peranOptions()
    {
        $peran = Peran::whereNotIn('nama', self::PERAN_TERLARANG)
            ->orderBy('id')
            ->get(['id', 'nama']);

        return response()->json([
            'success' => true,
            'data' => $peran
        ], 200);
    }

    // Membuat kode baru
    public function store(Request $request)
    {
        $request->validate([
            'kode' => 'required|string|unique:kode_registrasi,kode|max:255',
            'keterangan' => 'nullable|string|max:255',
            'id_peran' => [
                'required',
                'integer',
                Rule::exists('peran', 'id')->where(function ($query) {
                    $query->whereNotIn('nama', self::PERAN_TERLARANG);
                }),
            ],
            'jabatan' => 'required|string|max:255',
        ], [
            'kode.unique' => 'Kode ini sudah digunakan.',
            'id_peran.required' => 'Peran untuk kode registrasi wajib dipilih.',
            'id_peran.exists' => 'Peran yang dipilih tidak valid.',
            'jabatan.required' => 'Jabatan untuk kode registrasi wajib dipilih.',
        ]);

        // Super Admin bebas menentukan jabatan meskipun berbeda dengan peran (fungsi tetap mengikuti id_peran)
        $peran = Peran::find($request->id_peran);
        $namaJabatan = $request->filled('jabatan') ? $request->jabatan : ($peran ? $peran->nama : null);

        $kode = KodeRegistrasi::create([
            'kode' => $request->kode,
            'keterangan' => $request->keterangan,
            'id_peran' => $request->id_peran,
            'jabatan' => $namaJabatan,
            'status_aktif' => true,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Kode registrasi berhasil dibuat.',
            'data' => $kode->load('peran:id,nama')
        ], 201);
    }

    // Mengecek kode registrasi secara publik untuk mengisi otomatis field Jabatan di form registrasi
    public function cekKode(Request $request)
    {
        $kodeInput = trim((string) $request->query('kode', ''));

        if ($kodeInput === '') {
            return response()->json([
                'success' => false,
                'message' => 'Kode registrasi belum diisi.'
            ], 400);
        }

        $kodeDb = KodeRegistrasi::with('peran:id,nama')
            ->where('kode', $kodeInput)
            ->first();

        if (!$kodeDb) {
            return response()->json([
                'success' => false,
                'message' => 'Kode Registrasi Yayasan tidak ditemukan.'
            ], 404);
        }

        if (!$kodeDb->status_aktif) {
            return response()->json([
                'success' => false,
                'message' => 'Kode Registrasi Yayasan tersebut sudah tidak aktif.'
            ], 403);
        }

        $namaPeran = $kodeDb->peran ? $kodeDb->peran->nama : null;
        if (!$kodeDb->id_peran || !$namaPeran || in_array($namaPeran, self::PERAN_TERLARANG, true)) {
            return response()->json([
                'success' => false,
                'message' => 'Kode Registrasi Yayasan ini belum ditentukan jabatan/perannya.'
            ], 403);
        }

        $jabatan = $kodeDb->jabatan ?: $namaPeran;

        return response()->json([
            'success' => true,
            'data' => [
                'kode' => $kodeDb->kode,
                'id_peran' => $kodeDb->id_peran,
                'peran' => $namaPeran,
                'jabatan' => $jabatan,
            ]
        ], 200);
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
