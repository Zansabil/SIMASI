<?php

namespace App\Exports;

use App\Exports\Sheets\AsetTemplateDataSheet;
use App\Exports\Sheets\AsetTemplatePetunjukSheet;
use App\Models\KategoriAset;
use App\Models\LokasiUnit;
use Maatwebsite\Excel\Concerns\WithMultipleSheets;

/**
 * Template impor aset berisi 2 sheet:
 * 1. "Data Aset"  : tempat pengisian data (dengan dropdown Jenis Aset, Unit, Kondisi, Sumber Dana)
 * 2. "Petunjuk"   : daftar pilihan dari database + petunjuk pengisian
 *
 * Sheet "Data Aset" harus tetap menjadi sheet pertama karena proses impor membaca sheet pertama.
 */
class AsetTemplateExport implements WithMultipleSheets
{
    protected ?string $defaultUnit;

    public function __construct(?string $defaultUnit = null)
    {
        $this->defaultUnit = $defaultUnit;
    }

    public function sheets(): array
    {
        $kategori = KategoriAset::orderBy('id')->pluck('nama_kategori')->filter()->values()->all();
        $units = $this->defaultUnit
            ? [$this->defaultUnit]
            : LokasiUnit::orderBy('id')->pluck('nama_unit')->filter()->values()->all();
        $kondisi = ['Baik', 'Rusak Ringan', 'Rusak Berat'];
        $sumberDana = ['Dana BOS', 'Dana Yayasan', 'Hibah / Wakaf', 'Komite Sekolah', 'Lainnya'];

        return [
            new AsetTemplateDataSheet($this->defaultUnit, $kategori, $units, $kondisi, $sumberDana),
            new AsetTemplatePetunjukSheet($kategori, $units, $kondisi, $sumberDana),
        ];
    }
}
