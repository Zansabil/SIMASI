<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Ruangan;
use Illuminate\Database\QueryException;

class RuanganController extends Controller
{
    // 1. READ: Mengambil semua data ruangan (Format JSON)
    public function index()
    {
        $ruangan = Ruangan::all();
        
        return response()->json([
            'success' => true,
            'message' => 'Daftar ruangan berhasil diambil.',
            'data'    => $ruangan
        ], 200);
    }

    // 2. CREATE: Menyimpan data ruangan baru dari ReactJS
    public function store(Request $request)
    {
        $request->validate([
            'kode_ruangan' => 'required|unique:ruangan,kode_ruangan',
            'nama_ruangan' => 'required|unique:ruangan,nama_ruangan'
        ]);

        $ruangan = Ruangan::create($request->all());
        
        return response()->json([
            'success' => true,
            'message' => 'Data ruangan berhasil ditambahkan!',
            'data'    => $ruangan
        ], 201); // 201 Created
    }

    // 3. UPDATE: Memperbarui data ruangan dari ReactJS
    public function update(Request $request, $id)
    {
        $request->validate([
            'kode_ruangan' => 'required|unique:ruangan,kode_ruangan,'.$id,
            'nama_ruangan' => 'required|unique:ruangan,nama_ruangan,'.$id
        ]);

        $ruangan = Ruangan::findOrFail($id);
        $ruangan->update($request->all());
        
        return response()->json([
            'success' => true,
            'message' => 'Data ruangan berhasil diperbarui!',
            'data'    => $ruangan
        ], 200);
    }

    // 4. DELETE: Menghapus data ruangan
    public function destroy($id)
    {
        try {
            $ruangan = Ruangan::findOrFail($id);
            $ruangan->delete();
            
            return response()->json([
                'success' => true,
                'message' => 'Data ruangan berhasil dihapus!'
            ], 200);
            
        } catch (QueryException $e) {
            // Mengirimkan status 409 (Conflict) jika data ruangan masih terikat dengan data aset di database
            return response()->json([
                'success' => false,
                'message' => 'Gagal dihapus! Ruangan ini masih berisi data aset.'
            ], 409);
        }
    }
}