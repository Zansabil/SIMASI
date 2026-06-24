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
        Schema::table('pengguna', function (Blueprint $table) {
            $table->unsignedBigInteger('id_kode_registrasi')->nullable()->after('id_peran');
            $table->foreign('id_kode_registrasi')->references('id')->on('kode_registrasi')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pengguna', function (Blueprint $table) {
            $table->dropForeign(['id_kode_registrasi']);
            $table->dropColumn('id_kode_registrasi');
        });
    }
};
