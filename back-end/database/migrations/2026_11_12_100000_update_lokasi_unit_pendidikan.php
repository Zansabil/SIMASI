<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    private array $unitPendidikan = [
        ['nama_unit' => 'TK 1',  'keterangan' => 'Taman Kanak-Kanak 1'],
        ['nama_unit' => 'TK 2',  'keterangan' => 'Taman Kanak-Kanak 2'],
        ['nama_unit' => 'SD 1',  'keterangan' => 'Sekolah Dasar 1'],
        ['nama_unit' => 'SD 2',  'keterangan' => 'Sekolah Dasar 2'],
        ['nama_unit' => 'SMP 1', 'keterangan' => 'Sekolah Menengah Pertama 1'],
        ['nama_unit' => 'SMP 2', 'keterangan' => 'Sekolah Menengah Pertama 2'],
        ['nama_unit' => 'SMA',   'keterangan' => 'Sekolah Menengah Atas'],
        ['nama_unit' => 'MA',    'keterangan' => 'Madrasah Aliyah'],
    ];

    private array $pemetaanUnitLama = [
        'TK'  => 'TK 1',
        'SD'  => 'SD 1',
        'SMP' => 'SMP 1',
    ];

    public function up(): void
    {
        if (!Schema::hasTable('lokasi_unit')) {
            return;
        }

        // 1. Konversi unit lama (TK, SD, SMP) menjadi TK 1, SD 1, SMP 1 agar relasi id_unit pada aset tetap terjaga
        foreach ($this->pemetaanUnitLama as $lama => $baru) {
            $unitLama = DB::table('lokasi_unit')->where('nama_unit', $lama)->first();
            $unitBaru = DB::table('lokasi_unit')->where('nama_unit', $baru)->first();

            if ($unitLama && !$unitBaru) {
                DB::table('lokasi_unit')
                    ->where('id', $unitLama->id)
                    ->update([
                        'nama_unit'  => $baru,
                        'updated_at' => now(),
                    ]);
            }
        }

        // 2. Tambahkan seluruh unit pendidikan yang belum ada
        foreach ($this->unitPendidikan as $unit) {
            $exists = DB::table('lokasi_unit')
                ->whereRaw('LOWER(TRIM(nama_unit)) = ?', [strtolower($unit['nama_unit'])])
                ->exists();

            if (!$exists) {
                DB::table('lokasi_unit')->insert([
                    'nama_unit'  => $unit['nama_unit'],
                    'keterangan' => $unit['keterangan'],
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }

        // 3. Sesuaikan kolom area pada tabel pengguna yang masih memakai nama unit lama
        if (Schema::hasTable('pengguna')) {
            foreach ($this->pemetaanUnitLama as $lama => $baru) {
                DB::table('pengguna')
                    ->where('area', $lama)
                    ->update(['area' => $baru]);
            }
        }
    }

    public function down(): void
    {
        if (!Schema::hasTable('lokasi_unit')) {
            return;
        }

        // Hapus unit tambahan (TK 2, SD 2, SMP 2) hanya jika belum digunakan oleh data aset atau pengadaan
        foreach (['TK 2', 'SD 2', 'SMP 2'] as $unitTambahan) {
            $unit = DB::table('lokasi_unit')->where('nama_unit', $unitTambahan)->first();
            if ($unit) {
                $dipakaiAset = Schema::hasTable('aset') && DB::table('aset')->where('id_unit', $unit->id)->exists();
                $dipakaiPengadaan = Schema::hasTable('pengadaan_aset') && DB::table('pengadaan_aset')->where('id_unit', $unit->id)->exists();
                if (!$dipakaiAset && !$dipakaiPengadaan) {
                    DB::table('lokasi_unit')->where('id', $unit->id)->delete();
                }
            }
        }
    }
};

