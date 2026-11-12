<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\RiwayatAset;
use Carbon\Carbon;

class RiwayatAsetController extends Controller
{
    /**
     * Menampilkan daftar riwayat aset dengan dukungan:
     * - Pemisahan Tab "Riwayat Aktif" (<= 1 tahun) dan "Arsip Riwayat" (> 1 tahun)
     * - Filter Periode / Tahun (3 Bulan Terakhir, 6 Bulan Terakhir, Tahun Berjalan, atau Tahun Tertentu)
     * - Statistik ringkasan akurat dari server
     * - Pagination sisi server yang ringan berkat database index pada kolom waktu & aksi
     */
    public function index(Request $request)
    {
        $archiveCutoff = Carbon::now()->subYear()->startOfDay();
        $tab = $request->input('tab', 'aktif'); // 'aktif' | 'arsip' | 'semua'
        $periode = $request->input('periode', 'tahun_ini'); // '3_bulan' | '6_bulan' | 'tahun_ini' | 'semua' | 'YYYY'

        // Query dasar untuk menerapkan filter pencarian, aksi, dan unit (sebelum pemisahan tab)
        $applyBaseFilters = function ($q) use ($request) {
            if ($request->filled('search')) {
                $search = trim($request->search);
                $q->where(function ($subQ) use ($search) {
                    $subQ->where('aksi', 'like', "%{$search}%")
                        ->orWhere('keterangan', 'like', "%{$search}%")
                        ->orWhereHas('aset', function ($sub) use ($search) {
                            $sub->withTrashed()
                                ->where('nama_aset', 'like', "%{$search}%")
                                ->orWhere('kode_inventaris', 'like', "%{$search}%");
                        })
                        ->orWhereHas('pengguna', function ($sub) use ($search) {
                            $sub->withTrashed()
                                ->where('nama', 'like', "%{$search}%")
                                ->orWhere('nama_pengguna', 'like', "%{$search}%");
                        });
                });
            }

            if ($request->filled('aksi') && $request->aksi !== 'semua') {
                $aksiFilter = strtolower(trim($request->aksi));
                if (str_contains($aksiFilter, 'hapus')) {
                    $q->whereRaw("LOWER(aksi) LIKE '%hapus%'");
                } elseif (str_contains($aksiFilter, 'tambah') || str_contains($aksiFilter, 'nambah')) {
                    $q->whereRaw("(LOWER(aksi) LIKE '%tambah%' OR LOWER(aksi) LIKE '%nambah%')");
                } elseif (str_contains($aksiFilter, 'ubah')) {
                    $q->whereRaw("LOWER(aksi) LIKE '%ubah%'");
                } elseif (str_contains($aksiFilter, 'pindah') || str_contains($aksiFilter, 'mindah')) {
                    $q->whereRaw("(LOWER(aksi) LIKE '%pindah%' OR LOWER(aksi) LIKE '%mindah%')");
                } else {
                    $q->where('aksi', $request->aksi);
                }
            }

            if ($request->filled('unit') && $request->unit !== 'semua') {
                $unit = $request->unit;
                $q->whereHas('aset', function ($sub) use ($unit) {
                    $sub->withTrashed()->whereHas('lokasiUnit', function ($lu) use ($unit) {
                        $lu->where('nama_unit', $unit);
                    });
                });
            }
        };

        // Hitung jumlah data pada tab Aktif vs Arsip (sesuai filter search/aksi/unit)
        $countQuery = RiwayatAset::query();
        $applyBaseFilters($countQuery);
        $tabCounts = (clone $countQuery)->selectRaw("
            SUM(CASE WHEN waktu >= ? THEN 1 ELSE 0 END) as active_count,
            SUM(CASE WHEN waktu < ? THEN 1 ELSE 0 END) as archive_count
        ", [$archiveCutoff, $archiveCutoff])->first();

        // Terapkan filter tab & periode pada query utama
        $filteredQuery = RiwayatAset::query();
        $applyBaseFilters($filteredQuery);

        if ($tab === 'arsip') {
            $filteredQuery->where('waktu', '<', $archiveCutoff);
            if (preg_match('/^\d{4}$/', (string) $periode)) {
                $filteredQuery->whereYear('waktu', (int) $periode);
            }
        } elseif ($tab === 'aktif') {
            $filteredQuery->where('waktu', '>=', $archiveCutoff);
            if ($periode === '3_bulan') {
                $filteredQuery->where('waktu', '>=', Carbon::now()->subMonths(3)->startOfDay());
            } elseif ($periode === '6_bulan') {
                $filteredQuery->where('waktu', '>=', Carbon::now()->subMonths(6)->startOfDay());
            } elseif ($periode === 'tahun_ini') {
                $filteredQuery->whereYear('waktu', Carbon::now()->year);
            } elseif (preg_match('/^\d{4}$/', (string) $periode)) {
                $filteredQuery->whereYear('waktu', (int) $periode);
            }
        } else {
            // tab === 'semua'
            if ($periode === '3_bulan') {
                $filteredQuery->where('waktu', '>=', Carbon::now()->subMonths(3)->startOfDay());
            } elseif ($periode === '6_bulan') {
                $filteredQuery->where('waktu', '>=', Carbon::now()->subMonths(6)->startOfDay());
            } elseif ($periode === 'tahun_ini') {
                $filteredQuery->whereYear('waktu', Carbon::now()->year);
            } elseif (preg_match('/^\d{4}$/', (string) $periode)) {
                $filteredQuery->whereYear('waktu', (int) $periode);
            }
        }

        // Hitung ringkasan statistik akurat dari seluruh baris yang cocok dengan filter
        $statsRow = (clone $filteredQuery)->selectRaw("
            COUNT(*) as total,
            SUM(CASE WHEN LOWER(aksi) LIKE '%tambah%' OR LOWER(aksi) LIKE '%nambah%' THEN 1 ELSE 0 END) as penambahan,
            SUM(CASE WHEN LOWER(aksi) LIKE '%ubah%' OR LOWER(aksi) LIKE '%pindah%' OR LOWER(aksi) LIKE '%mindah%' THEN 1 ELSE 0 END) as perubahan,
            SUM(CASE WHEN LOWER(aksi) LIKE '%hapus%' THEN 1 ELSE 0 END) as penghapusan
        ")->first();

        // Daftar tahun yang tersedia di database untuk opsi dropdown periode
        $availableYears = RiwayatAset::whereNotNull('waktu')
            ->selectRaw(' DISTINCT YEAR(waktu) as tahun')
            ->orderBy('tahun', 'desc')
            ->pluck('tahun')
            ->filter()
            ->map(fn ($y) => (string) $y)
            ->values();

        $perPage = (int) $request->input('per_page', 10);
        if ($perPage <= 0) {
            $perPage = 10;
        }

        $riwayats = $filteredQuery->with([
            'pengguna:id,nama,nama_pengguna,email,area,id_peran,jabatan,id_kode_registrasi',
            'pengguna.peran:id,nama',
            'pengguna.kodeRegistrasi:id,jabatan',
            'aset' => function ($q) {
                $q->withTrashed()->with(['lokasiUnit:id,nama_unit', 'ruangan:id,nama_ruangan']);
            }
        ])->orderBy('waktu', 'desc')->paginate($perPage);

        return response()->json([
            'success'         => true,
            'message'         => 'Daftar riwayat aset berhasil diambil.',
            'data'            => $riwayats,
            'stats'           => [
                'total'         => (int) ($statsRow->total ?? 0),
                'penambahan'    => (int) ($statsRow->penambahan ?? 0),
                'perubahan'     => (int) ($statsRow->perubahan ?? 0),
                'penghapusan'   => (int) ($statsRow->penghapusan ?? 0),
                'active_count'  => (int) ($tabCounts->active_count ?? 0),
                'archive_count' => (int) ($tabCounts->archive_count ?? 0),
            ],
            'available_years' => $availableYears,
        ], 200);
    }
}
