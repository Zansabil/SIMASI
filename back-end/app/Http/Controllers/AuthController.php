<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash; 
use App\Models\Pengguna;            
use App\Models\KodeRegistrasi;

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
        $user = Pengguna::where('email', $request->email)->first();

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
            'kode_registrasi' => 'required|string',
            'jabatan'       => 'required|string',

        ], [
            'email.unique'         => 'Email ini sudah terdaftar.',
            'nama_pengguna.unique' => 'Username ini sudah dipakai orang lain.',
            'password.min'         => 'Password minimal harus 8 karakter.',
            'kode_registrasi.required' => 'Kode Registrasi Yayasan wajib diisi.'
        ]);

        $kodeDb = KodeRegistrasi::where('kode', $request->kode_registrasi)->first();
        if (!$kodeDb) {
            return response()->json([
                'success' => false,
                'message' => 'Kode Registrasi Yayasan yang Anda masukkan tidak terdaftar.'
            ], 403);
        }

        if (!$kodeDb->status_aktif) {
            return response()->json([
                'success' => false,
                'message' => 'Kode Registrasi Yayasan tersebut sudah tidak aktif.'
            ], 403);
        }

        // Menentukan id_peran berdasarkan jabatan
        $idPeran = 5; // Default guru
        switch ($request->jabatan) {
            case 'kepala-yayasan': 
                $idPeran = 2; 
                break;
            case 'admin': 
                $idPeran = 3; 
                break;
            case 'petugas-perbaikan': 
                $idPeran = 4; 
                break;
            case 'guru':
            default: 
                $idPeran = 5; 
                break;
        }

        $user = Pengguna::create([
            'nama'          => $request->nama,
            'nama_pengguna' => $request->nama_pengguna,
            'email'         => $request->email,
            'password'      => Hash::make($request->password), 
            'area'          => $request->area,
            'status_aktif'  => 1, 
            'id_peran'      => $idPeran, 
            'id_kode_registrasi' => $kodeDb->id,
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