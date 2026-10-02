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
        // Optimasi: 1 query untuk semua statistik alih-alih 4+ query terpisah
        $stats = Aset::selectRaw("
            SUM(jumlah_aset) as total_aset,
            SUM(CASE WHEN kondisi_aset = 'Baik' THEN jumlah_aset ELSE 0 END) as aset_aktif,
            SUM(CASE WHEN jenis_aset LIKE '%elektronik%' OR jenis_aset LIKE '%komputer%' THEN jumlah_aset ELSE 0 END) as elektronik,
            SUM(CASE WHEN jenis_aset LIKE '%furnitur%' OR jenis_aset LIKE '%furniture%' OR jenis_aset LIKE '%meja%' OR jenis_aset LIKE '%kursi%' THEN jumlah_aset ELSE 0 END) as furnitur
        ")->first();

        // Aset dalam Perbaikan (Sedang dikerjakan / status Diproses di Laporan Kerusakan)
        $perbaikan = LaporanKerusakan::where('status_kerusakan', 'Diproses')->count();

        // 6. Mengambil Aktivitas Terbaru (7 hari terakhir, maks 10 item)
        $activities = [];
        $sevenDaysAgo = date('Y-m-d', strtotime('-7 days'));

        // Ambil pengadaan 7 hari terakhir
        $pengadaans = PengadaanAset::whereDate('tgl_pengajuan', '>=', $sevenDaysAgo)
            ->orderBy('tgl_pengajuan', 'desc')
            ->limit(10)
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

        // Ambil perbaikan 7 hari terakhir
        $perbaikans = PerbaikanAset::with('laporan.aset')
            ->whereDate('tgl_dibuat', '>=', $sevenDaysAgo)
            ->orderBy('tgl_dibuat', 'desc')
            ->limit(10)
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

        // Urutkan semua aktivitas gabungan berdasarkan tanggal terbaru dan batasi 10
        usort($activities, function($a, $b) {
            return strcmp($b['raw_date'], $a['raw_date']);
        });
        $activities = array_slice($activities, 0, 10);

        // Mengirim data hitungan tersebut dalam bentuk JSON sesuai format frontend
        return response()->json([
            'success'    => true,
            'message'    => 'Data statistik dashboard berhasil diambil.',
            'stats'      => [
                'total_aset' => (int)($stats->total_aset ?? 0),
                'aset_aktif' => (int)($stats->aset_aktif ?? 0),
                'perbaikan'  => (int)$perbaikan,
                'elektronik' => (int)($stats->elektronik ?? 0),
                'furnitur'   => (int)($stats->furnitur ?? 0),
            ],
            'activities' => $activities
        ], 200);
    }
}