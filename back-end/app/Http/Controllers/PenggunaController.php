<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\pengguna;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Hash; 

class PenggunaController extends Controller
{
    // 1. Menampilkan daftar semua pengguna (Format JSON)
    public function index()
    {
        Gate::authorize('kelola-user'); 
        
        // Mengambil semua pengguna kecuali pengguna yang sedang login saat ini
        $penggunas = pengguna::where('id', '!=', auth()->user()->id)->get();
        
        return response()->json([
            'success' => true,
            'message' => 'Daftar pengguna berhasil diambil.',
            'data'    => $penggunas
        ], 200);
    }

    // 2. Memproses penyimpanan pengguna baru dari form di ReactJS
    public function store(Request $request)
    {
        Gate::authorize('kelola-user');

        $request->validate([
            'nama'          => 'required|string|max:255',
            'nama_pengguna' => 'required|string|unique:pengguna,nama_pengguna|max:255',
            'email'         => 'required|string|email|unique:pengguna,email|max:255',
            'password'      => 'required|string|min:8',
            'id_peran'      => 'required|integer',
            'status_aktif'  => 'required|boolean'
        ]);

        $pengguna = pengguna::create([
            'nama'          => $request->nama,
            'nama_pengguna' => $request->nama_pengguna,
            'email'         => $request->email,
            'password'      => Hash::make($request->password), // Enkripsi password baru
            'id_peran'      => $request->id_peran,
            'status_aktif'  => $request->status_aktif
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Pengguna baru bernama ' . $request->nama . ' berhasil ditambahkan!',
            'data'    => $pengguna
        ], 201); // 201 Created
    }

    // 3. Memproses perubahan peran/akses pengguna dari ReactJS
    public function update(Request $request, $id)
    {
        Gate::authorize('kelola-user');
        
        $request->validate([
            'id_peran' => 'required|integer'
        ]);

        $pengguna = pengguna::findOrFail($id);
        $pengguna->update([
            'id_peran' => $request->id_peran
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Hak akses untuk ' . $pengguna->nama . ' berhasil diperbarui!',
            'data'    => $pengguna
        ], 200);
    }

    // 4. Menghapus pengguna dari sistem
    public function destroy($id)
    {
        Gate::authorize('kelola-user');
        
        $pengguna = pengguna::findOrFail($id);
        $pengguna->delete();

        return response()->json([
            'success' => true,
            'message' => 'Akun pengguna berhasil dihapus dari sistem.'
        ], 200);
    }

    // 5. Fitur Reset Password ke default "12345678" via API
    public function resetPassword($id)
    {
        Gate::authorize('kelola-user');

        $pengguna = pengguna::findOrFail($id);
        
        // Ubah password menjadi 12345678 dan langsung dienkripsi (Hash)
        $pengguna->update([
            'password' => Hash::make('12345678')
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Password akun ' . $pengguna->nama . ' berhasil di-reset menjadi: 12345678'
        ], 200);
    }
}