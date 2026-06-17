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
        // 1. Add unit and ruangan columns if they do not exist
        if (!Schema::hasColumn('aset', 'unit')) {
            Schema::table('aset', function (Blueprint $table) {
                $table->string('unit')->nullable()->after('jenis_aset');
                $table->string('ruangan')->nullable()->after('unit');
            });
        }

        // 2. Migrate existing data from lokasi_aset to unit and ruangan if lokasi_aset still exists
        if (Schema::hasColumn('aset', 'lokasi_aset')) {
            $assets = DB::table('aset')->get();
            $roomNames = DB::table('ruangan')->pluck('nama_ruangan')->toArray();
            $roomNamesLower = array_map('strtolower', $roomNames);

            foreach ($assets as $asset) {
                $loc = $asset->lokasi_aset ?? '';
                $unit = null;
                $ruangan = null;
                
                if (str_contains($loc, ' - ')) {
                    $parts = explode(' - ', $loc, 2);
                    $unit = trim($parts[0]);
                    $ruangan = trim($parts[1]);
                } else if (!empty(trim($loc))) {
                    $ruangan = trim($loc);
                }
                
                // Safe Foreign Key validation
                if ($ruangan !== null) {
                    $key = array_search(strtolower($ruangan), $roomNamesLower);
                    if ($key !== false) {
                        $ruangan = $roomNames[$key]; // Use exact case from ruangan table
                    } else {
                        $ruangan = null; // Set to null to avoid foreign key failure
                    }
                }

                DB::table('aset')->where('id', $asset->id)->update([
                    'unit' => $unit,
                    'ruangan' => $ruangan,
                ]);
            }
        }

        // 3. Drop foreign key constraint if it exists
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

        // 4. Drop lokasi_aset if it exists
        if (Schema::hasColumn('aset', 'lokasi_aset')) {
            Schema::table('aset', function (Blueprint $table) {
                $table->dropColumn('lokasi_aset');
            });
        }

        // 5. Add new foreign key constraint on ruangan if not already present
        $hasForeignKeyAfter = false;
        $results = DB::select("
            SELECT CONSTRAINT_NAME 
            FROM INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS 
            WHERE CONSTRAINT_SCHEMA = DATABASE() 
              AND TABLE_NAME = 'aset' 
              AND CONSTRAINT_NAME = 'fk_aset_ruang_baru_123'
        ");
        if (!empty($results)) {
            $hasForeignKeyAfter = true;
        }

        if (!$hasForeignKeyAfter) {
            Schema::table('aset', function (Blueprint $table) {
                $table->foreign('ruangan', 'fk_aset_ruang_baru_123')
                      ->references('nama_ruangan')
                      ->on('ruangan')
                      ->onUpdate('cascade')
                      ->onDelete('cascade');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // 1. Drop foreign key constraint on ruangan if it exists
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

        // 2. Re-add lokasi_aset column
        if (!Schema::hasColumn('aset', 'lokasi_aset')) {
            Schema::table('aset', function (Blueprint $table) {
                $table->string('lokasi_aset')->nullable()->after('jenis_aset');
            });
        }

        // 3. Recombine unit and ruangan back into lokasi_aset
        $assets = DB::table('aset')->get();
        foreach ($assets as $asset) {
            $combined = $asset->unit && $asset->ruangan 
                ? $asset->unit . ' - ' . $asset->ruangan 
                : ($asset->unit ?: $asset->ruangan ?: '');
            DB::table('aset')->where('id', $asset->id)->update([
                'lokasi_aset' => $combined,
            ]);
        }

        // 4. Drop unit and ruangan if they exist
        Schema::table('aset', function (Blueprint $table) {
            if (Schema::hasColumn('aset', 'unit') && Schema::hasColumn('aset', 'ruangan')) {
                $table->dropColumn(['unit', 'ruangan']);
            } else {
                if (Schema::hasColumn('aset', 'unit')) {
                    $table->dropColumn('unit');
                }
                if (Schema::hasColumn('aset', 'ruangan')) {
                    $table->dropColumn('ruangan');
                }
            }
        });

        // 5. Re-add foreign key constraint on lokasi_aset if not present
        $hasForeignKeyAfter = false;
        $results = DB::select("
            SELECT CONSTRAINT_NAME 
            FROM INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS 
            WHERE CONSTRAINT_SCHEMA = DATABASE() 
              AND TABLE_NAME = 'aset' 
              AND CONSTRAINT_NAME = 'fk_aset_ruang_baru_123'
        ");
        if (!empty($results)) {
            $hasForeignKeyAfter = true;
        }

        if (!$hasForeignKeyAfter) {
            Schema::table('aset', function (Blueprint $table) {
                $table->foreign('lokasi_aset', 'fk_aset_ruang_baru_123')
                      ->references('nama_ruangan')
                      ->on('ruangan')
                      ->onUpdate('cascade')
                      ->onDelete('cascade');
            });
        }
    }
};
