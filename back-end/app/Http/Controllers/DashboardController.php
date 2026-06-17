<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Aset;
use App\Models\LaporanKerusakan;
use App\Models\Pengguna;
use App\Models\PengadaanAset;
use App\Models\PerbaikanAset;

class DashboardController extends Controller
{
    public function index()
    {
        // 1. Total Seluruh Aset (jumlah dari kolom jumlah_aset)
        $total_aset = Aset::sum('jumlah_aset');

        // 2. Aset Aktif (kondisi Baik)
        $aset_aktif = Aset::where('kondisi_aset', 'Baik')->sum('jumlah_aset');

        // 3. Aset dalam Perbaikan (kondisi Rusak Ringan atau Rusak Berat)
        $perbaikan = Aset::whereIn('kondisi_aset', ['Rusak Ringan', 'Rusak Berat'])->sum('jumlah_aset');

        // 4. Kategori Spesifik: Elektronik
        $elektronik = Aset::where(function($q) {
            $q->where('jenis_aset', 'like', '%elektronik%')
              ->orWhere('jenis_aset', 'like', '%komputer%');
        })->sum('jumlah_aset');

        // 5. Kategori Spesifik: Furnitur
        $furnitur = Aset::where(function($q) {
            $q->where('jenis_aset', 'like', '%furnitur%')
              ->orWhere('jenis_aset', 'like', '%furniture%')
              ->orWhere('jenis_aset', 'like', '%meja%')
              ->orWhere('jenis_aset', 'like', '%kursi%');
        })->sum('jumlah_aset');

        // 6. Mengambil Aktivitas Terbaru dari Pengadaan Aset dan Perbaikan Aset
        $activities = [];

        $today = date('Y-m-d');

        // Ambil pengadaan hari ini
        $pengadaans = PengadaanAset::whereDate('tgl_pengajuan', $today)
            ->orderBy('tgl_pengajuan', 'desc')
            ->get();
        foreach ($pengadaans as $p) {
            $status_mapped = 'pending';
            if ($p->status_pengajuan === 'Disetujui') $status_mapped = 'approved';
            if ($p->status_pengajuan === 'Ditolak') $status_mapped = 'rejected';

            $activities[] = [
                'id'       => 'pengadaan-' . $p->idpengadaan_aset,
                'type'     => 'Pengadaan',
                'title'    => 'Pengadaan - ' . $p->nama_barang,
                'date'     => $p->tgl_pengajuan ? date('d-m-Y', strtotime($p->tgl_pengajuan)) : '',
                'status'   => $status_mapped,
                'raw_date' => $p->tgl_pengajuan
            ];
        }

        // Ambil perbaikan hari ini
        $perbaikans = PerbaikanAset::with('laporan.aset')
            ->whereDate('tgl_dibuat', $today)
            ->orderBy('tgl_dibuat', 'desc')
            ->get();
        foreach ($perbaikans as $pb) {
            $status_mapped = 'in_progress';
            if ($pb->status_perbaikan === 'Selesai') $status_mapped = 'completed';

            $nama_aset = $pb->laporan->aset->nama_aset ?? 'Aset';

            $activities[] = [
                'id'       => 'perbaikan-' . $pb->id,
                'type'     => 'Perbaikan',
                'title'    => 'Perbaikan - ' . $nama_aset,
                'date'     => $pb->tanggal_mulai ? date('d-m-Y', strtotime($pb->tanggal_mulai)) : '',
                'status'   => $status_mapped,
                'raw_date' => $pb->tanggal_mulai
            ];
        }

        // Urutkan semua aktivitas gabungan berdasarkan tanggal terbaru (raw_date desc)
        usort($activities, function($a, $b) {
            return strcmp($b['raw_date'], $a['raw_date']);
        });

        // Mengirim data hitungan tersebut dalam bentuk JSON sesuai format frontend
        return response()->json([
            'success'    => true,
            'message'    => 'Data statistik dashboard berhasil diambil.',
            'stats'      => [
                'total_aset' => (int)$total_aset,
                'aset_aktif' => (int)$aset_aktif,
                'perbaikan'  => (int)$perbaikan,
                'elektronik' => (int)$elektronik,
                'furnitur'   => (int)$furnitur,
            ],
            'activities' => $activities
        ], 200);
    }
}