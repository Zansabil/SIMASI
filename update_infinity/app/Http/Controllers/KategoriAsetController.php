<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\KategoriAset;
use Illuminate\Database\QueryException;

class KategoriAsetController extends Controller
{
    // 1. READ: Mengambil semua data kategori
    public function index()
    {
        $kategori = KategoriAset::all();
        
        return response()->json([
            'success' => true,
            'message' => 'Daftar kategori aset berhasil diambil.',
            'data'    => $kategori
        ], 200);
    }

    // 2. CREATE: Menyimpan data kategori baru
    public function store(Request $request)
    {
        $request->validate([
            'kode_kategori' => 'required|unique:kategori_aset,kode_kategori',
            'nama_kategori' => 'required|unique:kategori_aset,nama_kategori'
        ]);

        $kategori = KategoriAset::create($request->all());
        
        return response()->json([
            'success' => true,
            'message' => 'Kategori aset berhasil ditambahkan!',
            'data'    => $kategori
        ], 201); // 201 Created
    }

    // 3. UPDATE: Memperbarui data kategori
    public function update(Request $request, $id)
    {
        $request->validate([
            'kode_kategori' => 'required|unique:kategori_aset,kode_kategori,'.$id,
            'nama_kategori' => 'required|unique:kategori_aset,nama_kategori,'.$id
        ]);

        $kategori = KategoriAset::findOrFail($id);
        $kategori->update($request->all());
        
        return response()->json([
            'success' => true,
            'message' => 'Kategori aset berhasil diperbarui!',
            'data'    => $kategori
        ], 200);
    }

    // 4. DELETE: Menghapus data kategori
    public function destroy($id)
    {
        try {
            $kategori = KategoriAset::findOrFail($id);
            $kategori->delete();
            
            return response()->json([
                'success' => true,
                'message' => 'Kategori aset berhasil dihapus!'
            ], 200);
            
        } catch (QueryException $e) {
            // Mencegah error jika kategori masih dipakai di tabel aset
            // Mengirimkan status 409 (Conflict) agar Frontend (React) tahu ada bentrok relasi data
            return response()->json([
                'success' => false,
                'message' => 'Gagal dihapus! Kategori ini sedang digunakan oleh data aset.'
            ], 409); 
        }
    }
}