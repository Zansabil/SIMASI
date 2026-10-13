<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (Schema::hasTable('laporan_kerusakan') && !Schema::hasColumn('laporan_kerusakan', 'foto_perbaikan')) {
            Schema::table('laporan_kerusakan', function (Blueprint $table) {
                $table->string('foto_perbaikan')->nullable()->after('lampiran');
            });
        }

        if (Schema::hasTable('perbaikan_aset') && !Schema::hasColumn('perbaikan_aset', 'foto_perbaikan')) {
            Schema::table('perbaikan_aset', function (Blueprint $table) {
                $table->string('foto_perbaikan')->nullable()->after('hasil');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('laporan_kerusakan') && Schema::hasColumn('laporan_kerusakan', 'foto_perbaikan')) {
            Schema::table('laporan_kerusakan', function (Blueprint $table) {
                $table->dropColumn('foto_perbaikan');
            });
        }

        if (Schema::hasTable('perbaikan_aset') && Schema::hasColumn('perbaikan_aset', 'foto_perbaikan')) {
            Schema::table('perbaikan_aset', function (Blueprint $table) {
                $table->dropColumn('foto_perbaikan');
            });
        }
    }
};
