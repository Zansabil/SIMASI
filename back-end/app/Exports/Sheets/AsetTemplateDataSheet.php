<?php

namespace App\Exports\Sheets;

use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Events\AfterSheet;
use PhpOffice\PhpSpreadsheet\Cell\DataValidation;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class AsetTemplateDataSheet implements FromArray, WithHeadings, WithTitle, ShouldAutoSize, WithEvents
{
    /** Jumlah baris yang diberi dropdown */
    private const MAX_ROW = 1000;

    public function __construct(
        protected ?string $defaultUnit,
        protected array $kategori,
        protected array $units,
        protected array $kondisi,
        protected array $sumberDana
    ) {
    }

    public function title(): string
    {
        return 'Data Aset';
    }

    public function headings(): array
    {
        return [
            'Nama Aset',
            'Jenis Aset',
            'Unit',
            'Ruangan',
            'Jumlah',
            'Kondisi',
            'Tanggal Diperoleh (YYYY-MM-DD)',
            'Harga Aset',
            'Sumber Dana',
        ];
    }

    public function array(): array
    {
        $katElektronik = $this->cariPilihan($this->kategori, 'elektron') ?? ($this->kategori[0] ?? 'Elektronik');
        $katMebel = $this->cariPilihan($this->kategori, 'mebel') ?? ($this->kategori[1] ?? $katElektronik);

        $unit1 = $this->defaultUnit ?: ($this->cariPilihan($this->units, 'sma') ?? ($this->units[0] ?? 'SMA'));
        $unit2 = $this->defaultUnit ?: ($this->cariPilihan($this->units, 'smp') ?? ($this->units[0] ?? 'SMP 1'));

        return [
            ['Laptop ASUS ExpertBook', $katElektronik, $unit1, 'Laboratorium Komputer', 5, 'Baik', '2026-10-01', 8500000, 'Dana BOS'],
            ['Meja Siswa Kayu Jati (Aset Lama)', $katMebel, $unit2, 'Kelas 7A', 20, 'Baik', '2021-07-15', '', 'Dana Yayasan'],
        ];
    }

    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function (AfterSheet $event) {
                $sheet = $event->sheet->getDelegate();

                // Header tebal & berwarna, baris judul dibekukan
                $sheet->getStyle('A1:I1')->getFont()->setBold(true);
                $sheet->getStyle('A1:I1')->getFill()
                    ->setFillType(Fill::FILL_SOLID)
                    ->getStartColor()->setARGB('FFD9EAD3');
                $sheet->freezePane('A2');

                // Dropdown mengambil daftar dari sheet "Petunjuk"
                $this->pasangDropdown($sheet, 'B', $this->rangeDaftar('A', count($this->kategori)), true,
                    'Jenis Aset', 'Pilih kategori dari daftar. Kategori di luar daftar akan ditolak saat impor.');
                $this->pasangDropdown($sheet, 'C', $this->rangeDaftar('B', count($this->units)), true,
                    'Unit', 'Pilih unit pendidikan dari daftar.');
                $this->pasangDropdown($sheet, 'F', $this->rangeDaftar('C', count($this->kondisi)), true,
                    'Kondisi', 'Pilih: Baik, Rusak Ringan, atau Rusak Berat.');
                // Sumber dana boleh diisi selain pilihan (hanya peringatan informasi)
                $this->pasangDropdown($sheet, 'I', $this->rangeDaftar('D', count($this->sumberDana)), false,
                    'Sumber Dana', 'Pilih dari daftar atau ketik sumber dana lain (opsional).');
            },
        ];
    }

    private function rangeDaftar(string $kolom, int $jumlah): string
    {
        $akhir = 1 + max(1, $jumlah);
        return "'Petunjuk'!\${$kolom}\$2:\${$kolom}\${$akhir}";
    }

    private function pasangDropdown(Worksheet $sheet, string $kolom, string $formula, bool $ketat, string $judul, string $pesan): void
    {
        $range = "{$kolom}2:{$kolom}" . self::MAX_ROW;

        $validasi = new DataValidation();
        $validasi->setType(DataValidation::TYPE_LIST);
        $validasi->setErrorStyle($ketat ? DataValidation::STYLE_STOP : DataValidation::STYLE_INFORMATION);
        $validasi->setAllowBlank(true);
        $validasi->setShowDropDown(true);
        $validasi->setShowInputMessage(true);
        $validasi->setShowErrorMessage(true);
        $validasi->setPromptTitle($judul);
        $validasi->setPrompt($pesan);
        $validasi->setErrorTitle("{$judul} tidak valid");
        $validasi->setError($ketat
            ? "Nilai tidak ada dalam daftar. Silakan pilih dari dropdown (lihat sheet Petunjuk)."
            : "Nilai tidak ada dalam daftar pilihan, tetapi tetap boleh digunakan.");
        $validasi->setFormula1($formula);
        $validasi->setSqref($range);

        $sheet->setDataValidation($range, $validasi);
    }

    private function cariPilihan(array $daftar, string $kata): ?string
    {
        foreach ($daftar as $item) {
            if (str_contains(mb_strtolower((string) $item), $kata)) {
                return $item;
            }
        }
        return null;
    }
}
