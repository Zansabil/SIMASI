<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Setiap kode registrasi kini terikat pada satu peran (role) tertentu,
     * sehingga peran akun baru ditentukan oleh kode, bukan dipilih bebas oleh pendaftar.
     */
    public function up(): void
    {
        // Guard: kolom (beserta FK) mungkin sudah terbuat sebelum proses migrasi sebelumnya terhenti
        if (Schema::hasColumn('kode_registrasi', 'id_peran')) {
            return;
        }

        Schema::table('kode_registrasi', function (Blueprint $table) {
            // peran.id bertipe INT(11) signed, jadi kolom FK harus bertipe sama
            $table->integer('id_peran')->nullable()->after('keterangan');
            $table->foreign('id_peran')->references('id')->on('peran')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (!Schema::hasColumn('kode_registrasi', 'id_peran')) {
            return;
        }

        Schema::table('kode_registrasi', function (Blueprint $table) {
            $table->dropForeign(['id_peran']);
            $table->dropColumn('id_peran');
        });
    }
};
