<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Tambahkan index pada kolom yang digunakan untuk pencarian saat login.
     * Ini mempercepat query WHERE pada email, nama_pengguna, dan no_telepon.
     */
    public function up(): void
    {
        Schema::table('pengguna', function (Blueprint $table) {
            // Cek dan tambahkan index jika belum ada
            // email, nama_pengguna, no_telepon digunakan di WHERE saat login
            $table->index('email', 'idx_pengguna_email');
            $table->index('nama_pengguna', 'idx_pengguna_nama_pengguna');
            $table->index('no_telepon', 'idx_pengguna_no_telepon');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pengguna', function (Blueprint $table) {
            $table->dropIndex('idx_pengguna_email');
            $table->dropIndex('idx_pengguna_nama_pengguna');
            $table->dropIndex('idx_pengguna_no_telepon');
        });
    }
};
