<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Pengguna;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Hash; 

class PenggunaController extends Controller
{
    public function index()
    {
        // Gate::authorize('kelola-user');
        
        // Mengambil semua pengguna kecuali pengguna yang sedang login saat ini
        $penggunas = Pengguna::with('peran')->where('id', '!=', auth()->user()->id)->get();
        
        return response()->json([
            'success' => true,
            'message' => 'Daftar pengguna berhasil diambil.',
            'data'    => $penggunas
        ], 200);
    }

    // 2. Memproses penyimpanan pengguna baru dari form di ReactJS
    public function store(Request $request)
    {
        // Gate::authorize('kelola-user');

        $request->validate([
            'nama'          => 'required|string|max:255',
            'nama_pengguna' => 'required|string|unique:pengguna,nama_pengguna|max:255',
            'email'         => 'required|string|email|unique:pengguna,email|max:255',
            'password'      => 'required|string|min:8',
            'id_peran'      => 'required|integer',
            'status_aktif'  => 'required|boolean',
            'area'          => 'nullable|string|max:50'
        ]);

        $pengguna = Pengguna::create([
            'nama'          => $request->nama,
            'nama_pengguna' => $request->nama_pengguna,
            'email'         => $request->email,
            'password'      => Hash::make($request->password), // Enkripsi password baru
            'id_peran'      => $request->id_peran,
            'status_aktif'  => $request->status_aktif,
            'area'          => $request->area
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Pengguna baru bernama ' . $request->nama . ' berhasil ditambahkan!',
            'data'    => $pengguna
        ], 201); // 201 Created
    }

    // 3. Memproses perubahan pengguna dari ReactJS
    public function update(Request $request, $id)
    {
        // Gate::authorize('kelola-user');
        
        $request->validate([
            'nama'          => 'required|string|max:255',
            'nama_pengguna' => 'required|string|max:255|unique:pengguna,nama_pengguna,'.$id,
            'email'         => 'required|string|email|max:255|unique:pengguna,email,'.$id,
            'id_peran'      => 'required|integer',
            'status_aktif'  => 'required|boolean',
            'area'          => 'nullable|string|max:50'
        ]);

        $pengguna = Pengguna::findOrFail($id);
        
        $data = [
            'nama'          => $request->nama,
            'nama_pengguna' => $request->nama_pengguna,
            'email'         => $request->email,
            'id_peran'      => $request->id_peran,
            'status_aktif'  => $request->status_aktif,
            'area'          => $request->area
        ];

        if ($request->filled('password')) {
            $request->validate([
                'password' => 'string|min:8'
            ]);
            $data['password'] = Hash::make($request->password);
        }

        $pengguna->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Data pengguna ' . $pengguna->nama . ' berhasil diperbarui!',
            'data'    => $pengguna
        ], 200);
    }

    // 4. Menghapus pengguna dari sistem
    public function destroy($id)
    {
        // Gate::authorize('kelola-user');
        
        $pengguna = Pengguna::findOrFail($id);
        $pengguna->delete();

        return response()->json([
            'success' => true,
            'message' => 'Akun pengguna berhasil dihapus dari sistem.'
        ], 200);
    }

    // 5. Fitur Reset Password ke default "12345678" via API
    public function resetPassword($id)
    {
        // Gate::authorize('kelola-user');

        $pengguna = Pengguna::findOrFail($id);
        
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