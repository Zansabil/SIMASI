<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use App\Models\RiwayatAset;

return new class extends Migration
{
    public function up(): void
    {
        DB::transaction(function () {
            $importLogs = RiwayatAset::with([
                'aset' => function ($q) {
                    $q->withTrashed()->with(['lokasiUnit', 'ruangan']);
                }
            ])
                ->where('keterangan', 'like', 'Menambahkan aset melalui Impor Excel:%')
                ->orderBy('id', 'asc')
                ->get();

            // Kelompokkan berdasarkan pengguna + waktu (per menit/batch)
            $batches = $importLogs->groupBy(function ($log) {
                $timeKey = $log->waktu ? substr((string) $log->waktu, 0, 19) : 'unknown';
                return ($log->id_pengguna ?? 0) . '|' . $timeKey;
            });

            foreach ($batches as $group) {
                if ($group->count() <= 1) {
                    continue;
                }

                $firstLog = $group->first();
                $count = $group->count();
                $totalUnits = 0;
                $rincian = [];

                foreach ($group as $row) {
                    $aset = $row->aset;
                    if ($aset) {
                        $unitName = $aset->lokasiUnit->nama_unit ?? '-';
                        $roomName = $aset->ruangan->nama_ruangan ?? '-';
                        $jml = (int) ($aset->jumlah_aset ?? 1);
                        $totalUnits += $jml;
                        $rincian[] = "{$aset->nama_aset} [{$aset->kode_inventaris}] ({$unitName} - {$roomName}, {$jml} unit)";
                    } else {
                        $nama = trim(str_replace('Menambahkan aset melalui Impor Excel:', '', (string) $row->keterangan));
                        $totalUnits += 1;
                        $rincian[] = $nama;
                    }
                }

                $firstLog->keterangan = "Impor Excel Massal ({$count} jenis aset, {$totalUnits} total unit):\n- " . implode("\n- ", $rincian);
                $firstLog->save();

                // Hapus baris duplikat dalam batch yang sama agar tabel tidak membengkak
                $duplicateIds = $group->slice(1)->pluck('id')->toArray();
                if (!empty($duplicateIds)) {
                    RiwayatAset::whereIn('id', $duplicateIds)->delete();
                }
            }
        });
    }

    public function down(): void
    {
        // Tidak memisahkan kembali log yang sudah dikompaksi
    }
};

