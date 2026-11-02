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
        if (!Schema::hasColumn('kode_registrasi', 'jabatan')) {
            Schema::table('kode_registrasi', function (Blueprint $table) {
                $table->string('jabatan')->nullable()->after('id_peran');
            });
        }

        // Backfill kolom jabatan dari nama peran untuk kode registrasi yang sudah ada
        $kodes = DB::table('kode_registrasi')
            ->whereNotNull('id_peran')
            ->whereNull('jabatan')
            ->get();

        foreach ($kodes as $kode) {
            $peran = DB::table('peran')->where('id', $kode->id_peran)->first();
            if ($peran) {
                DB::table('kode_registrasi')
                    ->where('id', $kode->id)
                    ->update(['jabatan' => $peran->nama]);
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasColumn('kode_registrasi', 'jabatan')) {
            Schema::table('kode_registrasi', function (Blueprint $table) {
                $table->dropColumn('jabatan');
            });
        }
    }
};

