<?php

namespace App\Exports\Sheets;

use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Events\AfterSheet;
use PhpOffice\PhpSpreadsheet\Style\Fill;

/**
 * Sheet "Petunjuk": kolom A-D berisi daftar pilihan (sumber dropdown di sheet "Data Aset"),
 * kolom F berisi petunjuk pengisian.
 */
class AsetTemplatePetunjukSheet implements FromArray, WithTitle, ShouldAutoSize, WithEvents
{
    public function __construct(
        protected array $kategori,
        protected array $units,
        protected array $kondisi,
        protected array $sumberDana
    ) {
    }

    public function title(): string
    {
        return 'Petunjuk';
    }

    public function array(): array
    {
        $petunjuk = [
            '1. Isi data aset pada sheet "Data Aset" mulai baris ke-2. Contoh baris boleh ditimpa atau dihapus.',
            '2. Jangan mengubah nama atau urutan judul kolom pada baris pertama.',
            '3. Jenis Aset WAJIB dipilih dari dropdown (daftar di kolom A). Kategori di luar daftar akan ditolak.',
            '4. Butuh kategori baru? Admin Unit menambahkannya lewat form Tambah Aset, lalu unduh ulang template ini.',
            '5. Unit wajib sesuai daftar di kolom B (Admin Unit otomatis memakai unit tanggung jawabnya).',
            '6. Kondisi: Baik, Rusak Ringan, atau Rusak Berat.',
            '7. Tanggal Diperoleh: format YYYY-MM-DD (contoh 2026-10-01) atau DD-MM-YYYY.',
            '8. Harga Aset dan Sumber Dana boleh dikosongkan (misalnya untuk aset lama).',
        ];

        $rows = [[
            'Daftar Jenis Aset (Kategori)',
            'Daftar Unit',
            'Daftar Kondisi',
            'Daftar Sumber Dana',
            '',
            'Petunjuk Pengisian',
        ]];

        $jumlahBaris = max(count($this->kategori), count($this->units), count($this->kondisi), count($this->sumberDana), count($petunjuk));
        for ($i = 0; $i < $jumlahBaris; $i++) {
            $rows[] = [
                $this->kategori[$i] ?? '',
                $this->units[$i] ?? '',
                $this->kondisi[$i] ?? '',
                $this->sumberDana[$i] ?? '',
                '',
                $petunjuk[$i] ?? '',
            ];
        }

        return $rows;
    }

    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function (AfterSheet $event) {
                $sheet = $event->sheet->getDelegate();
                foreach (['A1:D1', 'F1'] as $range) {
                    $sheet->getStyle($range)->getFont()->setBold(true);
                    $sheet->getStyle($range)->getFill()
                        ->setFillType(Fill::FILL_SOLID)
                        ->getStartColor()->setARGB('FFFFF2CC');
                }
            },
        ];
    }
}
