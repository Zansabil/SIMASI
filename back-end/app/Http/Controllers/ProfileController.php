<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use App\Models\Pengguna;

class ProfileController extends Controller
{
    /**
     * Memperbarui informasi profil dan mengunggah foto profil
     */
    public function updateProfile(Request $request)
    {
        $user = auth()->user();

        // Validasi input
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:pengguna,email,' . $user->id,
            'avatar' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048' // max 2MB
        ]);

        $pengguna = Pengguna::findOrFail($user->id);

        // Update nama dan email
        $pengguna->nama = $request->name;
        $pengguna->email = $request->email;

        // Proses unggah foto jika ada
        if ($request->hasFile('avatar')) {
            $file = $request->file('avatar');
            $filename = time() . '_' . $file->getClientOriginalName();
            
            // Hapus foto lama jika bukan null
            if ($pengguna->foto_profil) {
                Storage::disk('public')->delete('avatars/' . $pengguna->foto_profil);
            }

            // Simpan foto baru ke direktori storage/app/public/avatars
            $file->storeAs('avatars', $filename, 'public');
            
            $pengguna->foto_profil = $filename;
        }

        $pengguna->save();

        return response()->json([
            'success' => true,
            'message' => 'Profil berhasil diperbarui.',
            'data' => [
                'nama' => $pengguna->nama,
                'email' => $pengguna->email,
                'foto_profil' => $pengguna->foto_profil ? url('api/avatars/' . $pengguna->foto_profil) : null
            ]
        ], 200);
    }

    /**
     * Mengambil foto profil secara langsung (menghindari masalah symlink di shared hosting)
     */
    public function getAvatar($filename)
    {
        // Sanitasi: hapus karakter path traversal untuk mencegah akses file arbitrer
        $filename = basename($filename);
        $path = storage_path('app/public/avatars/' . $filename);
        
        if (!file_exists($path)) {
            abort(404);
        }
        
        return response()->file($path);
    }

    /**
     * Memperbarui kata sandi pengguna
     */
    public function updatePassword(Request $request)
    {
        $user = auth()->user();

        $request->validate([
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:8|confirmed',
        ], [
            'new_password.confirmed' => 'Konfirmasi kata sandi tidak cocok.',
            'new_password.min' => 'Kata sandi minimal harus 8 karakter.'
        ]);

        $pengguna = Pengguna::findOrFail($user->id);

        // Cek kecocokan password lama
        if (!Hash::check($request->current_password, $pengguna->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Kata sandi saat ini yang Anda masukkan salah.'
            ], 400);
        }

        // Simpan password baru
        $pengguna->password = Hash::make($request->new_password);
        $pengguna->save();

        return response()->json([
            'success' => true,
            'message' => 'Kata sandi berhasil diperbarui.'
        ], 200);
    }
}
