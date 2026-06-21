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
        Schema::table('pengadaan_aset', function (Blueprint $table) {
            $table->string('unit')->nullable()->after('nama_barang');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pengadaan_aset', function (Blueprint $table) {
            $table->dropColumn('unit');
        });
    }
};
