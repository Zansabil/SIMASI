<?php

namespace App\Exports;

use App\Models\aset;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings; // Untuk judul kolom atas
use Maatwebsite\Excel\Concerns\WithMapping;  // Untuk memilih data apa saja yang diekspor

class AsetExport implements FromCollection, WithHeadings, WithMapping
{
    // 1. Ambil semua data aset dari database
    public function collection()
    {
        return aset::orderBy('tgl_dibuat', 'desc')->get();
    }

    // 2. Buat Judul Kolom (Baris pertama di Excel)
    public function headings(): array
    {
        return [
            'No',
            'Kode Inventaris',
            'Nama Aset',
            'Jenis Aset',
            'Lokasi',
            'Jumlah',
            'Kondisi',
            'Tanggal Diperoleh'
        ];
    }

    // 3. Masukkan datanya sesuai urutan judul kolom di atas
    public function map($aset): array
    {
        static $no = 0;
        $no++;

        return [
            $no,
            $aset->kode_inventaris,
            $aset->nama_aset,
            $aset->jenis_aset,
            $aset->lokasi_aset,
            $aset->jumlah_aset,
            $aset->kondisi_aset,
            \Carbon\Carbon::parse($aset->tgl_diperoleh)->format('d-m-Y') // Format tanggal agar rapi
        ];
    }
}