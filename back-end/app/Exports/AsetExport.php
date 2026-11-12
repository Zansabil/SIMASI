<?php

namespace App\Exports;

use App\Models\Aset;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings; // Untuk judul kolom atas
use Maatwebsite\Excel\Concerns\WithMapping;  // Untuk memilih data apa saja yang diekspor

class AsetExport implements FromCollection, WithHeadings, WithMapping
{
    // 1. Ambil data aset dari database (dibatasi per unit jika yang login Admin Unit)
    public function collection()
    {
        $query = Aset::with(['lokasiUnit', 'ruangan'])->orderBy('id_unit', 'asc')->orderBy('id_ruangan', 'asc');
        $user = auth()->user();
        if ($user && (int) $user->id_peran === 3) {
            $unitAdmin = $user->resolveLokasiUnit();
            if ($unitAdmin) {
                $query->where('id_unit', $unitAdmin->id);
            }
        }
        return $query->get();
    }

    // 2. Buat Judul Kolom (Baris pertama di Excel)
    public function headings(): array
    {
        return [
            'No',
            'Kode Inventaris',
            'Nama Aset',
            'Kategori Aset',
            'Unit Pendidikan',
            'Ruangan',
            'Jumlah',
            'Kondisi',
            'Tanggal Diperoleh',
            'Harga Aset',
            'Sumber Dana',
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
            $aset->lokasiUnit->nama_unit ?? '-',
            $aset->ruangan->nama_ruangan ?? '-',
            $aset->jumlah_aset,
            $aset->kondisi_aset,
            $aset->tgl_diperoleh ? \Carbon\Carbon::parse($aset->tgl_diperoleh)->format('d-m-Y') : '-',
            ($aset->harga_aset && (int) $aset->harga_aset > 0) ? (int) $aset->harga_aset : '-',
            $aset->sumber_dana ?: '-',
        ];
    }
}