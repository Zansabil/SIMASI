<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $existingIndexes = collect(DB::select('SHOW INDEX FROM riwayat_aset'))
            ->pluck('Key_name')
            ->unique()
            ->toArray();

        Schema::table('riwayat_aset', function (Blueprint $table) use ($existingIndexes) {
            if (!in_array('idx_riwayat_aset_waktu', $existingIndexes, true)) {
                $table->index('waktu', 'idx_riwayat_aset_waktu');
            }
            if (!in_array('idx_riwayat_aset_aksi_waktu', $existingIndexes, true)) {
                $table->index(['aksi', 'waktu'], 'idx_riwayat_aset_aksi_waktu');
            }
        });
    }

    public function down(): void
    {
        $existingIndexes = collect(DB::select('SHOW INDEX FROM riwayat_aset'))
            ->pluck('Key_name')
            ->unique()
            ->toArray();

        Schema::table('riwayat_aset', function (Blueprint $table) use ($existingIndexes) {
            if (in_array('idx_riwayat_aset_waktu', $existingIndexes, true)) {
                $table->dropIndex('idx_riwayat_aset_waktu');
            }
            if (in_array('idx_riwayat_aset_aksi_waktu', $existingIndexes, true)) {
                $table->dropIndex('idx_riwayat_aset_aksi_waktu');
            }
        });
    }
};

