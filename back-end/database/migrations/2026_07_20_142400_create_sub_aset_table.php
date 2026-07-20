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
        Schema::create('sub_aset', function (Blueprint $table) {
            $table->id();
            $table->integer('id_aset'); // Match int(11) of aset.id
            $table->string('kode_sub_aset')->unique();
            $table->integer('id_ruangan')->nullable(); // Match int(11) of ruangan.id
            $table->string('kondisi_aset', 150);
            $table->string('status_penggunaan', 100)->default('Tersedia');
            
            // Custom timestamps because app uses tgl_dibuat and tgl_diperbaharui
            $table->timestamp('tgl_dibuat')->useCurrent();
            $table->timestamp('tgl_diperbaharui')->useCurrent()->useCurrentOnUpdate();

            $table->foreign('id_aset')->references('id')->on('aset')->onDelete('cascade');
            $table->foreign('id_ruangan')->references('id')->on('ruangan')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sub_aset');
    }
};
