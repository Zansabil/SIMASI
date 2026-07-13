<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash; 
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Carbon\Carbon;
use App\Models\Pengguna;            
use App\Models\KodeRegistrasi;
use App\Mail\ResetPasswordMail;

class AuthController extends Controller
{
    // 1. Memproses Login dan Menerbitkan Token API
    public function authenticate(Request $request)
    {
        $request->validate([
            'identifier' => 'required|string',
            'password'   => 'required'
        ]);

        $identifier = $request->identifier;

        // Cari pengguna berdasarkan email, nama_pengguna, atau no_telepon
        $user = Pengguna::where('email', $identifier)
            ->orWhere('nama_pengguna', $identifier)
            ->orWhere('no_telepon', $identifier)
            ->first();

        // Cek apakah email ada di database DAN passwordnya cocok
        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Email/Username/No. HP atau Password yang Anda masukkan salah.'
            ], 401); // 401 = Unauthorized (Tidak diizinkan)
        }

        // Jika benar, buatkan Token API (Kunci Masuk) menggunakan Sanctum
        $token = $user->createToken('auth_token')->plainTextToken;

        // Tambahkan URL foto profil ke data_user
        $user->foto_profil_url = $user->foto_profil ? asset('storage/avatars/' . $user->foto_profil) : null;

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
            'no_telepon'    => 'required|string|max:20',
            'password'      => 'required|min:8', 
            'area'          => 'nullable|string|max:100',
            'kode_registrasi' => 'required|string',
            'jabatan'       => 'required|string',

        ], [
            'email.unique'         => 'Email ini sudah terdaftar.',
            'nama_pengguna.unique' => 'Username ini sudah dipakai orang lain.',
            'password.min'         => 'Password minimal harus 8 karakter.',
            'kode_registrasi.required' => 'Kode Registrasi Yayasan wajib diisi.',
            'no_telepon.required'  => 'Nomor telepon wajib diisi.'
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
            'no_telepon'    => $request->no_telepon,
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

    // 4. Lupa Password
    public function forgotPassword(Request $request)
    {
        $request->validate([
            'identifier' => 'required|string' // Bisa email, username, atau no_telepon
        ]);

        $identifier = $request->identifier;

        // Cari user berdasarkan email, nama_pengguna, atau no_telepon
        $user = Pengguna::where('email', $identifier)
            ->orWhere('nama_pengguna', $identifier)
            ->orWhere('no_telepon', $identifier)
            ->first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Akun tidak ditemukan. Pastikan Email, Username, atau No. HP benar.'
            ], 404);
        }

        // Hapus token lama jika ada
        DB::table('password_reset_tokens')->where('email', $user->email)->delete();

        // Buat token baru
        $token = Str::random(60);

        DB::table('password_reset_tokens')->insert([
            'email' => $user->email,
            'token' => $token,
            'created_at' => Carbon::now()
        ]);

        // Kirim email
        $resetUrl = url('http://localhost:5173/reset-password?token=' . $token . '&email=' . urlencode($user->email));
        Mail::to($user->email)->send(new ResetPasswordMail($resetUrl, $user->nama));

        // Buat email tersamarkan (masked email)
        $emailParts = explode('@', $user->email);
        $name = $emailParts[0];
        $domain = $emailParts[1];
        $maskedEmail = substr($name, 0, 1) . str_repeat('*', strlen($name) - 1) . '@' . $domain;

        return response()->json([
            'success' => true,
            'message' => 'Tautan pemulihan telah dikirim ke email ' . $maskedEmail
        ], 200);
    }

    // 5. Reset Password
    public function resetPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'token' => 'required|string',
            'password' => 'required|string|min:8|confirmed' // confirmed membutuhkan input password_confirmation
        ], [
            'password.confirmed' => 'Konfirmasi kata sandi tidak cocok.',
            'password.min' => 'Kata sandi minimal harus 8 karakter.'
        ]);

        $resetToken = DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->where('token', $request->token)
            ->first();

        if (!$resetToken) {
            return response()->json([
                'success' => false,
                'message' => 'Token reset password tidak valid atau sudah kadaluarsa.'
            ], 400);
        }

        $user = Pengguna::where('email', $request->email)->first();
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Pengguna tidak ditemukan.'
            ], 404);
        }

        $user->password = Hash::make($request->password);
        $user->save();

        // Hapus token setelah digunakan
        DB::table('password_reset_tokens')->where('email', $request->email)->delete();

        return response()->json([
            'success' => true,
            'message' => 'Kata sandi berhasil diperbarui! Silakan login menggunakan kata sandi baru Anda.'
        ], 200);
    }
}