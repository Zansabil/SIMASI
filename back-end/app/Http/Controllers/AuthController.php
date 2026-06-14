<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash; 
use App\Models\pengguna;            

class AuthController extends Controller
{
    // 1. Memproses Login dan Menerbitkan Token API
    public function authenticate(Request $request)
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required'
        ]);

        // Cari pengguna berdasarkan email
        $user = pengguna::where('email', $request->email)->first();

        // Cek apakah email ada di database DAN passwordnya cocok
        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Email atau Password yang Anda masukkan salah.'
            ], 401); // 401 = Unauthorized (Tidak diizinkan)
        }

        // Jika benar, buatkan Token API (Kunci Masuk) menggunakan Sanctum
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success'      => true,
            'message'      => 'Login berhasil!',
            'access_token' => $token,
            'token_type'   => 'Bearer',
            'data_user'    => $user // Mengirim data user agar bisa ditampilkan namanya di frontend
        ], 200);
    }

    // 2. Memproses Pendaftaran (Register) via API
    public function storeRegister(Request $request)
    {
        $request->validate([
            'nama'          => 'required|string|max:255',
            'nama_pengguna' => 'required|string|max:255|unique:pengguna,nama_pengguna',
            'email'         => 'required|email|unique:pengguna,email',
            'password'      => 'required|min:8', 
            'area'          => 'nullable|string|max:100',
        ], [
            'email.unique'         => 'Email ini sudah terdaftar.',
            'nama_pengguna.unique' => 'Username ini sudah dipakai orang lain.',
            'password.min'         => 'Password minimal harus 8 karakter.'
        ]);

        $user = pengguna::create([
            'nama'          => $request->nama,
            'nama_pengguna' => $request->nama_pengguna,
            'email'         => $request->email,
            'password'      => Hash::make($request->password), 
            'area'          => $request->area,
            'status_aktif'  => 1, 
            'id_peran'      => 2, 
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Pendaftaran berhasil! Silakan login dengan akun baru Anda.',
            'data'    => $user
        ], 201); // 201 = Created (Data berhasil dibuat)
    }

    // 3. Memproses Logout dan Menghanguskan Token API
    public function logout(Request $request)
    {
        // Menghapus/mencabut token yang sedang dipakai oleh user tersebut
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Logout berhasil. Token telah dicabut.'
        ], 200);
    }
}