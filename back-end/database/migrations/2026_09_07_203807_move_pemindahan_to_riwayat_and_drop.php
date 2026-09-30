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
        // Pindahkan data dari pemindahan_aset ke riwayat_aset
        if (Schema::hasTable('pemindahan_aset')) {
            $pemindahanData = DB::table('pemindahan_aset')->get();
            
            $fallbackUserId = DB::table('pengguna')->orderBy('id')->value('id') ?? 1;

            $riwayatInsertData = [];
            foreach ($pemindahanData as $row) {
                // Pastikan id_pengguna ada di tabel pengguna
                $userExists = DB::table('pengguna')->where('id', $row->id_pengguna)->exists();
                $idPengguna = $userExists ? $row->id_pengguna : $fallbackUserId;

                $riwayatInsertData[] = [
                    'id_aset' => $row->id_aset,
                    'aksi' => 'Pemindahan',
                    'id_pengguna' => $idPengguna,
                    'keterangan' => "Aset dipindahkan dari " . ($row->lokasi_sebelumnya ?? 'Lokasi Awal') . " ke " . ($row->lokasi_baru ?? 'Lokasi Baru') . ". Alasan: " . ($row->alasan_pemindahan ?? '-'),
                    'waktu' => $row->tgl_dibuat ?? now()
                ];
            }
            
            if (!empty($riwayatInsertData)) {
                DB::table('riwayat_aset')->insert($riwayatInsertData);
            }
            
            // Hapus tabel pemindahan_aset
            Schema::dropIfExists('pemindahan_aset');
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Buat ulang tabel jika di-rollback
        Schema::create('pemindahan_aset', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_aset')->nullable();
            $table->foreignId('id_pengguna')->nullable();
            $table->string('id_pemindahan')->nullable();
            $table->string('lokasi_sebelumnya')->nullable();
            $table->string('lokasi_baru')->nullable();
            $table->text('alasan_pemindahan')->nullable();
            $table->string('status_aset')->nullable();
            $table->timestamp('tgl_pindah')->nullable();
            $table->timestamp('tgl_dibuat')->nullable();
            $table->timestamp('tgl_diperbaharui')->nullable();
        });
    }
};
