<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Aset;
use App\Models\KategoriAset;
use Illuminate\Database\QueryException;

class KategoriAsetController extends Controller
{
    // Hanya Admin Unit (id_peran = 3) yang boleh menambah / mengubah / menghapus kategori.
    // Pengecekan dilakukan langsung (bukan lewat Gate) agar Super Admin pun tidak ikut ter-bypass.
    private function bukanAdminUnit(): bool
    {
        return (int) auth()->user()->id_peran !== 3;
    }

    private function tolakAkses()
    {
        return response()->json([
            'success' => false,
            'message' => 'Hanya Admin Unit yang dapat mengelola kategori aset.'
        ], 403);
    }

    // Membuat kode kategori unik (maks. 3 huruf + angka bila bentrok) dari nama kategori
    private function buatKodeKategori(string $nama): string
    {
        $huruf = strtoupper(preg_replace('/[^a-zA-Z]/', '', $nama));
        $dasar = substr($huruf !== '' ? $huruf : 'KAT', 0, 3);
        $kode = $dasar;
        $suffix = 1;
        while (KategoriAset::where('kode_kategori', $kode)->exists()) {
            $kode = $dasar . $suffix++;
        }
        return $kode;
    }

    // Validasi nama kategori + cek duplikat tanpa membedakan huruf besar/kecil
    private function validasiNama(Request $request, ?int $abaikanId = null): string
    {
        $request->merge(['nama_kategori' => trim(strip_tags((string) $request->input('nama_kategori')))]);

        $request->validate([
            'nama_kategori' => 'required|string|max:100',
        ], [
            'nama_kategori.required' => 'Nama kategori wajib diisi.',
            'nama_kategori.max'      => 'Nama kategori maksimal 100 karakter.',
        ]);

        $nama = preg_replace('/\s+/', ' ', $request->nama_kategori);

        $duplikat = KategoriAset::whereRaw('LOWER(TRIM(nama_kategori)) = ?', [mb_strtolower($nama)])
            ->when($abaikanId, fn ($q) => $q->where('id', '!=', $abaikanId))
            ->exists();

        if ($duplikat) {
            abort(response()->json([
                'success' => false,
                'message' => 'Kategori "' . $nama . '" sudah ada.'
            ], 422));
        }

        return $nama;
    }

    // 1. READ: Mengambil semua data kategori (semua peran boleh melihat)
    public function index()
    {
        $kategori = KategoriAset::orderBy('nama_kategori')->get();
        
        return response()->json([
            'success' => true,
            'message' => 'Daftar kategori aset berhasil diambil.',
            'data'    => $kategori
        ], 200);
    }

    // 2. CREATE: Menyimpan kategori baru (input manual dari form Daftar Aset)
    public function store(Request $request)
    {
        if ($this->bukanAdminUnit()) {
            return $this->tolakAkses();
        }

        $nama = $this->validasiNama($request);

        $kategori = KategoriAset::create([
            'kode_kategori' => $this->buatKodeKategori($nama),
            'nama_kategori' => $nama,
        ]);
        
        return response()->json([
            'success' => true,
            'message' => 'Kategori "' . $nama . '" berhasil ditambahkan!',
            'data'    => $kategori
        ], 201); // 201 Created
    }

    // 3. UPDATE: Memperbarui nama kategori (data aset yang memakai nama lama ikut diperbarui)
    public function update(Request $request, $id)
    {
        if ($this->bukanAdminUnit()) {
            return $this->tolakAkses();
        }

        $kategori = KategoriAset::findOrFail($id);
        $namaLama = $kategori->nama_kategori;
        $namaBaru = $this->validasiNama($request, (int) $id);

        $kategori->update(['nama_kategori' => $namaBaru]);
        Aset::where('jenis_aset', $namaLama)->update(['jenis_aset' => $namaBaru]);
        
        return response()->json([
            'success' => true,
            'message' => 'Kategori aset berhasil diperbarui!',
            'data'    => $kategori
        ], 200);
    }

    // 4. DELETE: Menghapus kategori (ditolak bila masih dipakai oleh data aset)
    public function destroy($id)
    {
        if ($this->bukanAdminUnit()) {
            return $this->tolakAkses();
        }

        $kategori = KategoriAset::findOrFail($id);

        if (Aset::where('jenis_aset', $kategori->nama_kategori)->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal dihapus! Kategori ini sedang digunakan oleh data aset.'
            ], 409);
        }

        try {
            $kategori->delete();
            
            return response()->json([
                'success' => true,
                'message' => 'Kategori aset berhasil dihapus!'
            ], 200);
            
        } catch (QueryException $e) {
            // Mengirimkan status 409 (Conflict) agar Frontend (React) tahu ada bentrok relasi data
            return response()->json([
                'success' => false,
                'message' => 'Gagal dihapus! Kategori ini sedang digunakan oleh data aset.'
            ], 409); 
        }
    }
}
