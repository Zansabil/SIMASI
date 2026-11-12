<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;

class AsetTemplateExport implements FromArray, WithHeadings, ShouldAutoSize
{
    protected ?string $defaultUnit;

    public function __construct(?string $defaultUnit = null)
    {
        $this->defaultUnit = $defaultUnit;
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
        $unit1 = $this->defaultUnit ?: 'SMA';
        $unit2 = $this->defaultUnit ?: 'SMP 1';

        return [
            [
                'Laptop ASUS ExpertBook',
                'Elektronik',
                $unit1,
                'Laboratorium Komputer',
                5,
                'Baik',
                '2026-10-01',
                8500000,
                'Dana BOS',
            ],
            [
                'Meja Siswa Kayu Jati (Aset Lama)',
                'Mebel / Furnitur',
                $unit2,
                'Kelas 7A',
                20,
                'Baik',
                '2021-07-15',
                '',
                'Dana Yayasan',
            ],
        ];
    }
}

