<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (!Schema::hasColumn('pengguna', 'jabatan')) {
            Schema::table('pengguna', function (Blueprint $table) {
                $table->string('jabatan')->nullable()->after('area');
            });
        }

        // Backfill kolom jabatan pada pengguna dari kode_registrasi (jika ada) atau dari peran
        $penggunas = DB::table('pengguna')->whereNull('jabatan')->get();
        foreach ($penggunas as $p) {
            $jabatan = null;
            if ($p->id_kode_registrasi) {
                $kode = DB::table('kode_registrasi')->where('id', $p->id_kode_registrasi)->first();
                if ($kode && !empty($kode->jabatan)) {
                    $jabatan = $kode->jabatan;
                }
            }
            if (!$jabatan && $p->id_peran) {
                $peran = DB::table('peran')->where('id', $p->id_peran)->first();
                if ($peran) {
                    $jabatan = $peran->nama;
                }
            }
            if ($jabatan) {
                DB::table('pengguna')->where('id', $p->id)->update(['jabatan' => $jabatan]);
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasColumn('pengguna', 'jabatan')) {
            Schema::table('pengguna', function (Blueprint $table) {
                $table->dropColumn('jabatan');
            });
        }
    }
};

