<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Aset;
use App\Models\KategoriAset;
use App\Models\LaporanKerusakan;
use App\Models\Pengguna;
use App\Models\PengadaanAset;
use App\Models\PerbaikanAset;

class DashboardController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        $unitAdmin = ($user && (int) $user->id_peran === 3) ? $user->resolveLokasiUnit() : null;

        // Optimasi: 1 query untuk statistik total (dibatasi ke unit Admin Unit jika berlaku)
        $stats = Aset::when($unitAdmin, fn ($q) => $q->where('id_unit', $unitAdmin->id))
            ->selectRaw("
                SUM(jumlah_aset) as total_aset,
                SUM(CASE WHEN kondisi_aset = 'Baik' THEN jumlah_aset ELSE 0 END) as aset_aktif
            ")->first();

        // Jumlah aset per kategori. Semua kategori di database ikut ditampilkan (termasuk yang
        // baru ditambahkan Admin Unit dan belum punya aset), dicocokkan tanpa membedakan huruf besar/kecil.
        $jumlahPerJenis = Aset::when($unitAdmin, fn ($q) => $q->where('id_unit', $unitAdmin->id))
            ->selectRaw('LOWER(TRIM(jenis_aset)) as jenis, SUM(jumlah_aset) as jumlah')
            ->groupByRaw('LOWER(TRIM(jenis_aset))')
            ->pluck('jumlah', 'jenis');

        $kategori = KategoriAset::orderBy('id')->get()->map(function ($k) use ($jumlahPerJenis) {
            return [
                'id'     => $k->id,
                'nama'   => $k->nama_kategori,
                'jumlah' => (int) ($jumlahPerJenis[mb_strtolower(trim($k->nama_kategori))] ?? 0),
            ];
        })->values();

        // Aset dalam Perbaikan (Sedang dikerjakan / status Diproses di Laporan Kerusakan)
        $perbaikan = LaporanKerusakan::where('status_kerusakan', 'Diproses')
            ->when($unitAdmin, function ($q) use ($unitAdmin) {
                $q->whereHas('aset', fn ($aq) => $aq->where('id_unit', $unitAdmin->id));
            })
            ->count();

        // 6. Mengambil Aktivitas Terbaru dari Pengadaan, Perbaikan, dan Laporan Kerusakan (Maks 10 item)
        $activities = [];

        // Ambil pengadaan terbaru (maks 10)
        $pengadaans = PengadaanAset::when($unitAdmin, fn ($q) => $q->where('id_unit', $unitAdmin->id))
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
                'raw_date' => $p->tgl_pengajuan ? date('Y-m-d H:i:s', strtotime($p->tgl_pengajuan)) : ''
            ];
        }

        // Ambil perbaikan terbaru (maks 10)
        $perbaikans = PerbaikanAset::with('laporan.aset')
            ->when($unitAdmin, function ($q) use ($unitAdmin) {
                $q->whereHas('laporan.aset', fn ($aq) => $aq->where('id_unit', $unitAdmin->id));
            })
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
                'date'     => $pb->tanggal_mulai ? date('d-m-Y', strtotime($pb->tanggal_mulai)) : ($pb->tgl_dibuat ? date('d-m-Y', strtotime($pb->tgl_dibuat)) : ''),
                'status'   => $status_mapped,
                'raw_date' => $pb->tgl_dibuat ? $pb->tgl_dibuat->format('Y-m-d H:i:s') : ($pb->tanggal_mulai ?? '')
            ];
        }

        // Ambil laporan kerusakan terbaru (yang belum tercatat di perbaikan)
        $idLaporanPerbaikan = $perbaikans->pluck('id_laporan')->filter()->toArray();
        $laporans = LaporanKerusakan::with('aset')
            ->when($unitAdmin, function ($q) use ($unitAdmin) {
                $q->whereHas('aset', fn ($aq) => $aq->where('id_unit', $unitAdmin->id));
            })
            ->whereNotIn('id', $idLaporanPerbaikan)
            ->orderBy('tgl_dibuat', 'desc')
            ->limit(10)
            ->get();
        foreach ($laporans as $lp) {
            $status_mapped = 'pending';
            if ($lp->status_kerusakan === 'Diproses') $status_mapped = 'in_progress';
            elseif ($lp->status_kerusakan === 'Selesai') $status_mapped = 'completed';
            elseif ($lp->status_kerusakan === 'Ditolak') $status_mapped = 'rejected';

            $nama_aset = $lp->aset->nama_aset ?? 'Aset';

            $activities[] = [
                'id'       => 'laporan-' . $lp->id,
                'type'     => 'Perbaikan',
                'title'    => 'Laporan - ' . $nama_aset,
                'date'     => $lp->tgl_laporan ? date('d-m-Y', strtotime($lp->tgl_laporan)) : ($lp->tgl_dibuat ? date('d-m-Y', strtotime($lp->tgl_dibuat)) : ''),
                'status'   => $status_mapped,
                'raw_date' => $lp->tgl_dibuat ? $lp->tgl_dibuat->format('Y-m-d H:i:s') : ($lp->tgl_laporan ?? '')
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
            ],
            'kategori'   => $kategori,
            'activities' => $activities
        ], 200);
    }
}