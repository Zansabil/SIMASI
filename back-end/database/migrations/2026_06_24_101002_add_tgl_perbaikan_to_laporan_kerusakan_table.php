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
        Schema::table('laporan_kerusakan', function (Blueprint $table) {
            $table->date('tgl_mulai_perbaikan')->nullable()->after('status_kerusakan');
            $table->date('tgl_selesai_perbaikan')->nullable()->after('tgl_mulai_perbaikan');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('laporan_kerusakan', function (Blueprint $table) {
            $table->dropColumn(['tgl_mulai_perbaikan', 'tgl_selesai_perbaikan']);
        });
    }
};
