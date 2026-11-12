<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Kategori awal yang diminta pihak sekolah (hasil demo).
     * Hanya ditambahkan bila belum ada (dicek berdasarkan nama, tanpa membedakan huruf besar/kecil).
     */
    private array $kategoriAwal = [
        ['kode_kategori' => 'LST', 'nama_kategori' => 'Kelistrikan'],
        ['kode_kategori' => 'KBR', 'nama_kategori' => 'Kebersihan'],
        ['kode_kategori' => 'AKT', 'nama_kategori' => 'Alat Kantor'],
    ];

    public function up(): void
    {
        if (!Schema::hasTable('kategori_aset')) {
            return;
        }

        // Bersihkan kategori bawaan lama yang belum pernah dipakai aset agar tidak duplikat dengan Alat Kantor
        foreach (['Alat Tulis Kantor / Perlengkapan', 'Umum'] as $kategoriLama) {
            $dipakai = DB::table('aset')->where('jenis_aset', $kategoriLama)->exists();
            if (!$dipakai) {
                DB::table('kategori_aset')->where('nama_kategori', $kategoriLama)->delete();
            }
        }

        foreach ($this->kategoriAwal as $kategori) {
            $sudahAda = DB::table('kategori_aset')
                ->whereRaw('LOWER(TRIM(nama_kategori)) = ?', [strtolower($kategori['nama_kategori'])])
                ->exists();

            if ($sudahAda) {
                continue;
            }

            // Hindari bentrok kode_kategori yang bersifat unik
            $kode = $kategori['kode_kategori'];
            $suffix = 1;
            while (DB::table('kategori_aset')->where('kode_kategori', $kode)->exists()) {
                $kode = $kategori['kode_kategori'] . $suffix++;
            }

            DB::table('kategori_aset')->insert([
                'kode_kategori' => $kode,
                'nama_kategori' => $kategori['nama_kategori'],
            ]);
        }
    }

    public function down(): void
    {
        if (!Schema::hasTable('kategori_aset')) {
            return;
        }

        // Hanya hapus kategori awal yang tidak sedang dipakai oleh data aset
        foreach ($this->kategoriAwal as $kategori) {
            $dipakai = DB::table('aset')->where('jenis_aset', $kategori['nama_kategori'])->exists();
            if (!$dipakai) {
                DB::table('kategori_aset')->where('nama_kategori', $kategori['nama_kategori'])->delete();
            }
        }
    }
};

