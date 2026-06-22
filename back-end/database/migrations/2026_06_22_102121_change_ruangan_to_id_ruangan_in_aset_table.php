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
        // 1. Add id_ruangan column
        Schema::table('aset', function (Blueprint $table) {
            $table->integer('id_ruangan')->nullable()->after('ruangan');
        });

        // 2. Migrate existing data from ruangan (string) to id_ruangan (integer)
        $ruanganList = \Illuminate\Support\Facades\DB::table('ruangan')->get();
        foreach ($ruanganList as $ruangan) {
            \Illuminate\Support\Facades\DB::table('aset')
                ->where('ruangan', $ruangan->nama_ruangan)
                ->update(['id_ruangan' => $ruangan->id]);
        }

        // 3. Drop old column and add foreign key
        Schema::table('aset', function (Blueprint $table) {
            $table->dropColumn('ruangan');
            $table->foreign('id_ruangan')->references('id')->on('ruangan')->onUpdate('cascade')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('aset', function (Blueprint $table) {
            // Re-add old column
            $table->string('ruangan', 255)->nullable()->after('unit');
            $table->dropForeign(['id_ruangan']);
        });

        // Migrate back
        $ruanganList = \Illuminate\Support\Facades\DB::table('ruangan')->get();
        foreach ($ruanganList as $ruangan) {
            \Illuminate\Support\Facades\DB::table('aset')
                ->where('id_ruangan', $ruangan->id)
                ->update(['ruangan' => $ruangan->nama_ruangan]);
        }

        Schema::table('aset', function (Blueprint $table) {
            $table->dropColumn('id_ruangan');
        });
    }
};
