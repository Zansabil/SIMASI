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
        // 1. Add id_unit to aset and pengadaan_aset
        Schema::table('aset', function (Blueprint $table) {
            $table->unsignedBigInteger('id_unit')->nullable()->after('jenis_aset');
        });

        Schema::table('pengadaan_aset', function (Blueprint $table) {
            $table->unsignedBigInteger('id_unit')->nullable()->after('nama_barang');
        });

        // 2. Migrate existing data for aset
        $asets = DB::table('aset')->whereNotNull('unit')->get();
        foreach ($asets as $aset) {
            $lokasiUnit = DB::table('lokasi_unit')->where('nama_unit', $aset->unit)->first();
            if ($lokasiUnit) {
                DB::table('aset')->where('id', $aset->id)->update(['id_unit' => $lokasiUnit->id]);
            }
        }

        // 3. Migrate existing data for pengadaan_aset
        $pengadaans = DB::table('pengadaan_aset')->whereNotNull('unit')->get();
        foreach ($pengadaans as $pengadaan) {
            $lokasiUnit = DB::table('lokasi_unit')->where('nama_unit', $pengadaan->unit)->first();
            if ($lokasiUnit) {
                DB::table('pengadaan_aset')->where('idpengadaan_aset', $pengadaan->idpengadaan_aset)->update(['id_unit' => $lokasiUnit->id]);
            }
        }

        // 4. Drop old 'unit' columns
        Schema::table('aset', function (Blueprint $table) {
            $table->dropColumn('unit');
        });
        Schema::table('pengadaan_aset', function (Blueprint $table) {
            $table->dropColumn('unit');
        });

        // 5. Add Foreign Key constraints
        Schema::table('aset', function (Blueprint $table) {
            $table->foreign('id_unit')
                  ->references('id')
                  ->on('lokasi_unit')
                  ->onUpdate('cascade')
                  ->onDelete('set null');
        });

        Schema::table('pengadaan_aset', function (Blueprint $table) {
            $table->foreign('id_unit')
                  ->references('id')
                  ->on('lokasi_unit')
                  ->onUpdate('cascade')
                  ->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('aset', function (Blueprint $table) {
            $table->dropForeign(['id_unit']);
            $table->string('unit')->nullable()->after('jenis_aset');
        });

        Schema::table('pengadaan_aset', function (Blueprint $table) {
            $table->dropForeign(['id_unit']);
            $table->string('unit')->nullable()->after('nama_barang');
        });

        // Try to reverse migrate data
        $asets = DB::table('aset')->whereNotNull('id_unit')->get();
        foreach ($asets as $aset) {
            $lokasiUnit = DB::table('lokasi_unit')->where('id', $aset->id_unit)->first();
            if ($lokasiUnit) {
                DB::table('aset')->where('id', $aset->id)->update(['unit' => $lokasiUnit->nama_unit]);
            }
        }

        $pengadaans = DB::table('pengadaan_aset')->whereNotNull('id_unit')->get();
        foreach ($pengadaans as $pengadaan) {
            $lokasiUnit = DB::table('lokasi_unit')->where('id', $pengadaan->id_unit)->first();
            if ($lokasiUnit) {
                DB::table('pengadaan_aset')->where('idpengadaan_aset', $pengadaan->idpengadaan_aset)->update(['unit' => $lokasiUnit->nama_unit]);
            }
        }

        Schema::table('aset', function (Blueprint $table) {
            $table->dropColumn('id_unit');
        });

        Schema::table('pengadaan_aset', function (Blueprint $table) {
            $table->dropColumn('id_unit');
        });
    }
};
