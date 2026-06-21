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
        $hasForeignKey = false;
        $results = DB::select("
            SELECT CONSTRAINT_NAME 
            FROM INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS 
            WHERE CONSTRAINT_SCHEMA = DATABASE() 
              AND TABLE_NAME = 'aset' 
              AND CONSTRAINT_NAME = 'fk_aset_ruang_baru_123'
        ");
        if (!empty($results)) {
            $hasForeignKey = true;
        }

        if ($hasForeignKey) {
            Schema::table('aset', function (Blueprint $table) {
                $table->dropForeign('fk_aset_ruang_baru_123');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $hasForeignKey = false;
        $results = DB::select("
            SELECT CONSTRAINT_NAME 
            FROM INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS 
            WHERE CONSTRAINT_SCHEMA = DATABASE() 
              AND TABLE_NAME = 'aset' 
              AND CONSTRAINT_NAME = 'fk_aset_ruang_baru_123'
        ");
        if (!empty($results)) {
            $hasForeignKey = true;
        }

        if (!$hasForeignKey) {
            Schema::table('aset', function (Blueprint $table) {
                $table->foreign('ruangan', 'fk_aset_ruang_baru_123')
                      ->references('nama_ruangan')
                      ->on('ruangan')
                      ->onUpdate('cascade')
                      ->onDelete('cascade');
            });
        }
    }
};
