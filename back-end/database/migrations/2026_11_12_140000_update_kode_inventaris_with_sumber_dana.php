<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use App\Models\Aset;
use App\Models\SubAset;
use App\Models\LaporanKerusakan;
use App\Http\Controllers\AsetController;

return new class extends Migration
{
    public function up(): void
    {
        DB::transaction(function () {
            $asets = Aset::withTrashed()->orderBy('id', 'asc')->get();

            foreach ($asets as $aset) {
                $oldKode = $aset->kode_inventaris;
                $expectedPrefix = AsetController::buildPrefixKodeInventaris(
                    $aset->id_unit,
                    $aset->tgl_diperoleh ?: now(),
                    $aset->sumber_dana
                );

                if (str_starts_with((string) $oldKode, $expectedPrefix)) {
                    continue;
                }

                // Hitung nomor urut berikutnya untuk prefix baru
                $existingCodes = Aset::withTrashed()
                    ->where('id', '!=', $aset->id)
                    ->where('kode_inventaris', 'like', "{$expectedPrefix}%")
                    ->pluck('kode_inventaris');

                $maxSeq = 0;
                foreach ($existingCodes as $code) {
                    $seqStr = substr($code, strlen($expectedPrefix));
                    if (is_numeric($seqStr)) {
                        $seq = (int) $seqStr;
                        if ($seq > $maxSeq) {
                            $maxSeq = $seq;
                        }
                    }
                }

                $newKode = $expectedPrefix . str_pad($maxSeq + 1, 4, '0', STR_PAD_LEFT);
                $aset->kode_inventaris = $newKode;
                $aset->timestamps = false;
                $aset->save();

                // Perbarui seluruh kode_sub_aset milik aset ini
                $subList = SubAset::where('id_aset', $aset->id)->orderBy('id', 'asc')->get();
                $oldPrefix = $oldKode . '-';
                foreach ($subList as $idx => $sub) {
                    $oldSubCode = $sub->kode_sub_aset;
                    if (str_starts_with($oldSubCode, $oldPrefix)) {
                        $unitSeq = substr($oldSubCode, strlen($oldPrefix));
                    } else {
                        $lastDash = strrpos($oldSubCode, '-');
                        $unitSeq = $lastDash !== false ? substr($oldSubCode, $lastDash + 1) : ($idx + 1);
                    }

                    $newSubCode = "{$newKode}-{$unitSeq}";
                    if ($oldSubCode !== $newSubCode) {
                        $sub->kode_sub_aset = $newSubCode;
                        $sub->save();

                        LaporanKerusakan::where('id_aset', $aset->id)
                            ->where('deskripsi', 'LIKE', "%(Unit: {$oldSubCode})%")
                            ->get()
                            ->each(function ($lk) use ($oldSubCode, $newSubCode) {
                                $lk->deskripsi = str_replace("(Unit: {$oldSubCode})", "(Unit: {$newSubCode})", $lk->deskripsi);
                                $lk->save();
                            });
                    }
                }
            }
        });
    }

    public function down(): void
    {
        // Tidak membalikkan format kode inventaris
    }
};

