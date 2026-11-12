<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Aset;
use App\Exports\AsetExport;
use Maatwebsite\Excel\Facades\Excel;
use Barryvdh\DomPDF\Facade\Pdf; 
use App\Models\RiwayatAset;
use Illuminate\Support\Facades\Gate;

class AsetController extends Controller
{
    /**
     * Mengambil unit tanggung jawab jika pengguna yang login adalah Admin Unit (id_peran = 3).
     */
    private function unitAdminAktif(): ?\App\Models\LokasiUnit
    {
        $user = auth()->user();
        if (!$user || (int) $user->id_peran !== 3) {
            return null;
        }
        return $user->resolveLokasiUnit();
    }

    /**
     * Mengubah teks Sumber Dana menjadi singkatan 3 huruf sesuai standar:
     * - Dana BOS -> BOS
     * - Yayasan / Dana Yayasan -> YYS
     * - Hibah / Wakaf -> HBH
     * - Komite Sekolah -> KMT
     * - Lainnya -> UMM
     */
    public static function formatKodeSumberDana(?string $sumberDana): string
    {
        $clean = mb_strtolower(trim(strip_tags((string) $sumberDana)));
        if ($clean === '' || $clean === '-') {
            return 'UMM';
        }

        if (str_contains($clean, 'bos')) {
            return 'BOS';
        }
        if (str_contains($clean, 'yayasan') || $clean === 'yys') {
            return 'YYS';
        }
        if (str_contains($clean, 'hibah') || str_contains($clean, 'wakaf') || $clean === 'hbh') {
            return 'HBH';
        }
        if (str_contains($clean, 'komite') || $clean === 'kmt') {
            return 'KMT';
        }

        return 'UMM';
    }

    /**
     * Membentuk prefix kode inventaris dengan format: UNIT-SUMBERDANA-ddmmyyyy-
     * Contoh: SMP-BOS-12112026- atau SMA-YYS-12112026-
     */
    public static function buildPrefixKodeInventaris($idUnit, $tglDiperoleh, ?string $sumberDana): string
    {
        $unitModel = \App\Models\LokasiUnit::find($idUnit);
        $unitName = $unitModel ? strtoupper(trim($unitModel->nama_unit)) : 'UNKNOWN';
        $tanggal = \Carbon\Carbon::parse($tglDiperoleh)->format('dmY');
        $kodeDana = self::formatKodeSumberDana($sumberDana);

        return "{$unitName}-{$kodeDana}-{$tanggal}-";
    }

    /**
     * Menghasilkan kode inventaris unik dengan format: UNIT-SUMBERDANA-ddmmyyyy-XXXX
     */
    private function generateKodeInventaris($idUnit, $tglDiperoleh, ?string $sumberDana, ?int $excludeAsetId = null): string
    {
        $prefix = self::buildPrefixKodeInventaris($idUnit, $tglDiperoleh, $sumberDana);

        $latestQuery = Aset::withTrashed()
            ->where('kode_inventaris', 'like', "{$prefix}%");
        if ($excludeAsetId) {
            $latestQuery->where('id', '!=', $excludeAsetId);
        }

        $existingCodes = $latestQuery->lockForUpdate()->pluck('kode_inventaris');
        $maxSeq = 0;
        foreach ($existingCodes as $code) {
            $seqStr = substr($code, strlen($prefix));
            if (is_numeric($seqStr)) {
                $seq = (int) $seqStr;
                if ($seq > $maxSeq) {
                    $maxSeq = $seq;
                }
            }
        }

        $nextSeq = $maxSeq + 1;
        return $prefix . str_pad($nextSeq, 4, '0', STR_PAD_LEFT);
    }

    // 1. READ: Menampilkan semua data aset (Format JSON)
    public function index(Request $request)
    {
        $search = $request->search;
        $query = Aset::query();

        // Admin Unit hanya menampilkan data aset sesuai unit yang menjadi tanggung jawabnya
        $unitAdmin = $this->unitAdminAktif();
        if ($unitAdmin) {
            $query->where('id_unit', $unitAdmin->id);
        } elseif ($request->filled('id_unit') && $request->id_unit !== 'all') {
            $unitFilter = $request->id_unit;
            if (is_numeric($unitFilter)) {
                $query->where('id_unit', (int) $unitFilter);
            } else {
                $query->whereHas('lokasiUnit', function ($q) use ($unitFilter) {
                    $q->whereRaw('LOWER(TRIM(nama_unit)) = ?', [strtolower(trim($unitFilter))]);
                });
            }
        }

        // Filter opsional berdasarkan ruangan
        if ($request->filled('id_ruangan') && $request->id_ruangan !== 'all') {
            $ruangFilter = $request->id_ruangan;
            if (is_numeric($ruangFilter)) {
                $query->where('id_ruangan', (int) $ruangFilter);
            } else {
                $query->whereHas('ruangan', function ($q) use ($ruangFilter) {
                    $q->whereRaw('LOWER(TRIM(nama_ruangan)) = ?', [strtolower(trim($ruangFilter))]);
                });
            }
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('nama_aset', 'like', "%{$search}%")
                  ->orWhere('kode_inventaris', 'like', "%{$search}%")
                  ->orWhere('jenis_aset', 'like', "%{$search}%")
                  ->orWhereHas('lokasiUnit', function ($uq) use ($search) {
                      $uq->where('nama_unit', 'like', "%{$search}%");
                  })
                  ->orWhereHas('ruangan', function ($rq) use ($search) {
                      $rq->where('nama_ruangan', 'like', "%{$search}%");
                  });
            });
        }

        $asets = $query->with(['ruangan', 'lokasiUnit', 'subAset.ruangan'])->orderBy('tgl_dibuat', 'desc')->get();

        return response()->json([
            'success'   => true,
            'message'   => 'Daftar data aset berhasil diambil.',
            'user_unit' => $unitAdmin ? [
                'id'        => $unitAdmin->id,
                'nama_unit' => $unitAdmin->nama_unit,
            ] : null,
            'data'      => $asets
        ], 200);
    }

    // CETAK PDF (Menghasilkan file stream untuk diunduh ReactJS, mendukung filter unit, ruangan, dan periode)
    public function cetakPDF(Request $request)
    {
        $query = Aset::with(['ruangan', 'lokasiUnit']);
        $filterUnitLabel = null;
        $filterRuanganLabel = null;
        $periodeLabel = 'Semua Waktu';

        // Admin Unit hanya boleh mencetak aset dari unit tanggung jawabnya
        $unitAdmin = $this->unitAdminAktif();
        if ($unitAdmin) {
            $query->where('id_unit', $unitAdmin->id);
            $filterUnitLabel = $unitAdmin->nama_unit;
        } elseif ($request->filled('id_unit') && $request->id_unit !== 'all') {
            $unitInput = $request->id_unit;
            if (is_numeric($unitInput)) {
                $query->where('id_unit', (int) $unitInput);
                $filterUnitLabel = \App\Models\LokasiUnit::find((int) $unitInput)?->nama_unit ?? $unitInput;
            } else {
                $query->whereHas('lokasiUnit', function ($q) use ($unitInput) {
                    $q->whereRaw('LOWER(TRIM(nama_unit)) = ?', [strtolower(trim($unitInput))]);
                });
                $filterUnitLabel = trim($unitInput);
            }
        }

        // Filter berdasarkan Ruangan (ID atau Nama Ruangan)
        if ($request->filled('id_ruangan') && $request->id_ruangan !== 'all') {
            $ruanganInput = $request->id_ruangan;
            if (is_numeric($ruanganInput)) {
                $query->where('id_ruangan', (int) $ruanganInput);
                $filterRuanganLabel = \App\Models\Ruangan::find((int) $ruanganInput)?->nama_ruangan ?? $ruanganInput;
            } else {
                $query->whereHas('ruangan', function ($q) use ($ruanganInput) {
                    $q->whereRaw('LOWER(TRIM(nama_ruangan)) = ?', [strtolower(trim($ruanganInput))]);
                });
                $filterRuanganLabel = trim($ruanganInput);
            }
        }

        // Filter berdasarkan rentang tanggal jika dikirim
        if ($request->filled('start_date') && $request->filled('end_date')) {
            $dateField = in_array($request->date_field, ['tgl_diperoleh', 'tgl_dibuat'], true)
                ? $request->date_field
                : 'tgl_diperoleh';
            $query->whereDate($dateField, '>=', $request->start_date)
                  ->whereDate($dateField, '<=', $request->end_date);
            $periodeLabel = $request->start_date . ' s/d ' . $request->end_date;
        }

        $asets = $query->orderBy('id_unit', 'asc')
                       ->orderBy('id_ruangan', 'asc')
                       ->orderBy('nama_aset', 'asc')
                       ->get();

        $pdf = Pdf::loadView('aset.cetak', compact(
            'asets',
            'filterUnitLabel',
            'filterRuanganLabel',
            'periodeLabel'
        ));
        $pdf->setPaper('A4', 'landscape');

        return $pdf->stream('Laporan_Data_Aset.pdf');
    }

    // CETAK EXCEL (Menghasilkan file download untuk diunduh ReactJS)
    public function cetakExcel()
    {
        if (!in_array(auth()->user()->id_peran, [1, 3])) {
            return response()->json(['message' => 'This action is unauthorized.'], 403);
        } 

        return Excel::download(new AsetExport, 'Laporan_Data_Aset.xlsx');
    }

    // UNDUH TEMPLATE IMPOR EXCEL
    public function downloadTemplate()
    {
        if (!in_array(auth()->user()->id_peran, [1, 3])) {
            return response()->json(['message' => 'This action is unauthorized.'], 403);
        }

        $unitAdmin = $this->unitAdminAktif();
        $defaultUnit = $unitAdmin ? $unitAdmin->nama_unit : null;

        return Excel::download(
            new \App\Exports\AsetTemplateExport($defaultUnit),
            'Template_Impor_Aset_SIMAS.xlsx'
        );
    }

    // IMPOR DATA ASET DARI FILE EXCEL / CSV
    public function importExcel(Request $request)
    {
        if (!in_array(auth()->user()->id_peran, [1, 3])) {
            return response()->json(['message' => 'This action is unauthorized.'], 403);
        }

        $request->validate([
            'file' => 'required|file|mimes:xlsx,xls,csv,txt|max:5120',
        ], [
            'file.required' => 'Silakan pilih file Excel terlebih dahulu.',
            'file.mimes'    => 'Format file tidak didukung. Harap unggah file .xlsx, .xls, atau .csv.',
            'file.max'      => 'Ukuran file terlalu besar (maksimal 5MB).',
        ]);

        try {
            $sheets = Excel::toArray(new \stdClass(), $request->file('file'));
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal membaca file Excel: ' . $e->getMessage(),
            ], 422);
        }

        $rows = $sheets[0] ?? [];
        if (count($rows) < 2) {
            return response()->json([
                'success' => false,
                'message' => 'File Excel kosong atau tidak memiliki baris data untuk diimpor.',
            ], 422);
        }

        // Dukungan otomatis jika file CSV menggunakan pemisah titik koma (;) dari Microsoft Excel Indonesia
        if (count($rows[0]) === 1 && str_contains((string) ($rows[0][0] ?? ''), ';')) {
            $rows = array_map(function ($r) {
                return str_getcsv((string) ($r[0] ?? ''), ';');
            }, $rows);
        }

        // Petakan baris header (baris pertama) ke indeks kolom
        $headerRow = $rows[0];
        $colMap = [];
        foreach ($headerRow as $idx => $cell) {
            $cleanHeader = preg_replace('/^\xEF\xBB\xBF/', '', (string) $cell);
            $h = mb_strtolower(trim(preg_replace('/\s+/', ' ', $cleanHeader)));

            if (in_array($h, ['nama aset', 'nama barang', 'nama_aset', 'nama'], true)) {
                $colMap['nama_aset'] = $idx;
            } elseif (in_array($h, ['jenis aset', 'kategori aset', 'kategori barang', 'kategori', 'jenis_aset', 'jenis'], true)) {
                $colMap['jenis_aset'] = $idx;
            } elseif (in_array($h, ['unit', 'unit pendidikan', 'lokasi unit', 'id_unit'], true)) {
                $colMap['unit'] = $idx;
            } elseif (in_array($h, ['ruangan', 'nama ruangan', 'lokasi ruangan', 'lokasi penempatan', 'lokasi'], true)) {
                $colMap['ruangan'] = $idx;
            } elseif (in_array($h, ['jumlah', 'jumlah aset', 'jumlah barang', 'jumlah_aset', 'qty', 'kuantitas'], true)) {
                $colMap['jumlah'] = $idx;
            } elseif (in_array($h, ['kondisi', 'kondisi aset', 'kondisi barang', 'kondisi_aset'], true)) {
                $colMap['kondisi'] = $idx;
            } elseif (str_contains($h, 'tanggal') || str_contains($h, 'tgl') || $h === 'tahun' || str_contains($h, 'perolehan') || str_contains($h, 'pembelian')) {
                $colMap['tgl_diperoleh'] = $idx;
            } elseif (str_contains($h, 'harga') || $h === 'price') {
                $colMap['harga_aset'] = $idx;
            } elseif (str_contains($h, 'sumber') || str_contains($h, 'dana')) {
                $colMap['sumber_dana'] = $idx;
            }
        }

        $requiredCols = ['nama_aset', 'jenis_aset', 'ruangan', 'jumlah', 'kondisi', 'tgl_diperoleh'];
        $missingCols = array_diff($requiredCols, array_keys($colMap));
        if (!empty($missingCols)) {
            return response()->json([
                'success' => false,
                'message' => 'Format kolom pada file tidak sesuai dengan template. Pastikan terdapat kolom: Nama Aset, Jenis Aset, Unit, Ruangan, Jumlah, Kondisi, dan Tanggal Diperoleh.',
            ], 422);
        }

        $unitAdmin = $this->unitAdminAktif();
        $userId = auth()->user()->id;
        $preparedRows = [];

        for ($i = 1; $i < count($rows); $i++) {
            $row = $rows[$i];
            $rowNumber = $i + 1;

            // Lewati baris yang sepenuhnya kosong
            $hasContent = false;
            foreach ($row as $cellVal) {
                if ($cellVal !== null && trim((string) $cellVal) !== '') {
                    $hasContent = true;
                    break;
                }
            }
            if (!$hasContent) {
                continue;
            }

            $namaAset = trim(strip_tags((string) ($row[$colMap['nama_aset']] ?? '')));
            $jenisAset = preg_replace('/\s+/', ' ', trim(strip_tags((string) ($row[$colMap['jenis_aset']] ?? ''))));
            $unitRaw = isset($colMap['unit']) ? trim(strip_tags((string) ($row[$colMap['unit']] ?? ''))) : '';
            $ruanganRaw = trim(strip_tags((string) ($row[$colMap['ruangan']] ?? '')));
            $jumlahRaw = trim((string) ($row[$colMap['jumlah']] ?? ''));
            $kondisiRaw = trim(strip_tags((string) ($row[$colMap['kondisi']] ?? '')));
            $tglRaw = $row[$colMap['tgl_diperoleh']] ?? null;
            $hargaRaw = isset($colMap['harga_aset']) ? ($row[$colMap['harga_aset']] ?? null) : null;
            $sumberRaw = isset($colMap['sumber_dana']) ? trim(strip_tags((string) ($row[$colMap['sumber_dana']] ?? ''))) : '';

            if ($namaAset === '') {
                return response()->json(['success' => false, 'message' => "Baris {$rowNumber}: Kolom 'Nama Aset' wajib diisi."], 422);
            }
            if ($jenisAset === '') {
                return response()->json(['success' => false, 'message' => "Baris {$rowNumber}: Kolom 'Jenis Aset' wajib diisi."], 422);
            }
            if ($ruanganRaw === '') {
                return response()->json(['success' => false, 'message' => "Baris {$rowNumber}: Kolom 'Ruangan' wajib diisi."], 422);
            }

            // Validasi Jumlah
            $jumlahClean = preg_replace('/[^\d]/', '', $jumlahRaw);
            $jumlahAset = $jumlahClean !== '' ? (int) $jumlahClean : 0;
            if ($jumlahAset < 1) {
                return response()->json(['success' => false, 'message' => "Baris {$rowNumber}: Kolom 'Jumlah' harus berupa angka minimal 1."], 422);
            }

            // Validasi & Normalisasi Kondisi
            $kondisiLower = mb_strtolower($kondisiRaw);
            if (in_array($kondisiLower, ['baik', 'bagus', 'normal'], true)) {
                $kondisiAset = 'baik';
            } elseif (str_contains($kondisiLower, 'berat') || $kondisiLower === 'rb') {
                $kondisiAset = 'rusak berat';
            } elseif (str_contains($kondisiLower, 'ringan') || $kondisiLower === 'rr' || $kondisiLower === 'rusak') {
                $kondisiAset = 'rusak ringan';
            } else {
                return response()->json([
                    'success' => false,
                    'message' => "Baris {$rowNumber}: Kondisi '{$kondisiRaw}' tidak valid. Gunakan: Baik, Rusak Ringan, atau Rusak Berat.",
                ], 422);
            }

            // Validasi & Parsing Tanggal Diperoleh
            $tglDiperoleh = $this->parseImportDate($tglRaw);
            if (!$tglDiperoleh) {
                return response()->json([
                    'success' => false,
                    'message' => "Baris {$rowNumber}: Format 'Tanggal Diperoleh' tidak valid. Gunakan format YYYY-MM-DD (contoh: 2026-10-01) atau DD-MM-YYYY.",
                ], 422);
            }

            // Resolusi Unit Pendidikan (dikunci otomatis jika yang mengimpor adalah Admin Unit)
            if ($unitAdmin) {
                $unitModel = $unitAdmin;
            } else {
                if ($unitRaw === '') {
                    return response()->json(['success' => false, 'message' => "Baris {$rowNumber}: Kolom 'Unit' wajib diisi."], 422);
                }
                $unitClean = preg_replace('/^unit\s+/i', '', $unitRaw);
                $legacyMap = ['tk' => 'TK 1', 'sd' => 'SD 1', 'smp' => 'SMP 1'];
                $unitLookup = $legacyMap[mb_strtolower($unitClean)] ?? $unitClean;

                $unitModel = \App\Models\LokasiUnit::whereRaw('LOWER(TRIM(nama_unit)) = ?', [mb_strtolower($unitLookup)])->first();
                if (!$unitModel) {
                    return response()->json([
                        'success' => false,
                        'message' => "Baris {$rowNumber}: Unit '{$unitRaw}' tidak ditemukan. Pilihan unit: TK 1, TK 2, SD 1, SD 2, SMP 1, SMP 2, SMA, MA.",
                    ], 422);
                }
            }

            // Harga Aset bersifat opsional (boleh dikosongkan untuk aset lama)
            $hargaClean = ($hargaRaw !== null && $hargaRaw !== '')
                ? preg_replace('/\D/', '', (string) $hargaRaw)
                : '';
            $hargaAset = $hargaClean !== '' ? (int) $hargaClean : 0;

            $preparedRows[] = [
                'nama_aset'     => $namaAset,
                'jenis_aset'    => $jenisAset,
                'unit_model'    => $unitModel,
                'nama_ruangan'  => $ruanganRaw,
                'jumlah_aset'   => $jumlahAset,
                'kondisi_aset'  => $kondisiAset,
                'tgl_diperoleh' => $tglDiperoleh,
                'harga_aset'    => $hargaAset,
                'sumber_dana'   => $sumberRaw !== '' ? $sumberRaw : '-',
            ];
        }

        if (empty($preparedRows)) {
            return response()->json([
                'success' => false,
                'message' => 'Tidak ada baris data aset yang valid untuk diimpor.',
            ], 422);
        }

        $importedCount = \Illuminate\Support\Facades\DB::transaction(function () use ($preparedRows, $userId) {
            $count = 0;
            $totalUnitsImported = 0;
            $firstAset = null;
            $rincianImpor = [];

            foreach ($preparedRows as $item) {
                // 1. Pastikan kategori tersimpan di tabel kategori_aset
                $namaKategori = $item['jenis_aset'];
                $kategoriAda = \App\Models\KategoriAset::whereRaw('LOWER(TRIM(nama_kategori)) = ?', [mb_strtolower($namaKategori)])->first();
                if (!$kategoriAda) {
                    $huruf = strtoupper(preg_replace('/[^a-zA-Z]/', '', $namaKategori));
                    $dasar = substr($huruf !== '' ? $huruf : 'KAT', 0, 3);
                    $kode = $dasar;
                    $suffix = 1;
                    while (\App\Models\KategoriAset::where('kode_kategori', $kode)->exists()) {
                        $kode = $dasar . $suffix++;
                    }
                    $kategoriAda = \App\Models\KategoriAset::create([
                        'kode_kategori' => $kode,
                        'nama_kategori' => $namaKategori,
                    ]);
                }

                // 2. Pastikan ruangan tersimpan di tabel ruangan
                $namaRuangan = $item['nama_ruangan'];
                $ruangan = \App\Models\Ruangan::whereRaw('LOWER(TRIM(nama_ruangan)) = ?', [mb_strtolower($namaRuangan)])->first();
                if (!$ruangan) {
                    $ruangan = \App\Models\Ruangan::create([
                        'nama_ruangan' => $namaRuangan,
                        'kode_ruangan' => strtoupper(substr(preg_replace('/[^a-zA-Z0-9]/', '', $namaRuangan), 0, 5)) . rand(10, 99),
                    ]);
                }

                // 3. Buat kode inventaris unik berdasarkan unit, tanggal perolehan, & sumber dana
                $unitModel = $item['unit_model'];
                $kodeInventaris = $this->generateKodeInventaris(
                    $unitModel->id,
                    $item['tgl_diperoleh'],
                    $item['sumber_dana']
                );

                // 4. Simpan data aset utama
                $createdAset = Aset::create([
                    'kode_inventaris' => $kodeInventaris,
                    'nama_aset'       => $item['nama_aset'],
                    'jenis_aset'      => $kategoriAda->nama_kategori,
                    'id_unit'         => $unitModel->id,
                    'id_ruangan'      => $ruangan->id,
                    'jumlah_aset'     => $item['jumlah_aset'],
                    'kondisi_aset'    => $item['kondisi_aset'],
                    'tgl_diperoleh'   => $item['tgl_diperoleh'],
                    'harga_aset'      => $item['harga_aset'],
                    'sumber_dana'     => $item['sumber_dana'],
                    'id_pengguna'     => $userId,
                ]);

                // 5. Buat sub-aset sejumlah unit barang
                for ($u = 1; $u <= $createdAset->jumlah_aset; $u++) {
                    \App\Models\SubAset::create([
                        'id_aset'           => $createdAset->id,
                        'kode_sub_aset'     => "{$kodeInventaris}-{$u}",
                        'id_ruangan'        => $createdAset->id_ruangan,
                        'kondisi_aset'      => $createdAset->kondisi_aset,
                        'status_penggunaan' => 'Tersedia',
                    ]);
                }

                if (!$firstAset) {
                    $firstAset = $createdAset;
                }
                $rincianImpor[] = "{$createdAset->nama_aset} [{$kodeInventaris}] ({$unitModel->nama_unit} - {$ruangan->nama_ruangan}, {$createdAset->jumlah_aset} unit)";
                $totalUnitsImported += (int) $createdAset->jumlah_aset;
                $count++;
            }

            // 6. Catat 1 log ringkasan terkompaksi di riwayat_aset agar tabel tidak membengkak saat impor massal
            if ($firstAset) {
                $keteranganImpor = $count === 1
                    ? "Menambahkan aset melalui Impor Excel: {$rincianImpor[0]}"
                    : "Impor Excel Massal ({$count} jenis aset, {$totalUnitsImported} total unit):\n- " . implode("\n- ", $rincianImpor);

                RiwayatAset::create([
                    'id_aset'     => $firstAset->id,
                    'aksi'        => 'Penambahan',
                    'id_pengguna' => $userId,
                    'keterangan'  => $keteranganImpor,
                    'waktu'       => now(),
                ]);
            }

            return $count;
        });

        return response()->json([
            'success'        => true,
            'message'        => "Berhasil mengimpor {$importedCount} data aset dari file Excel.",
            'imported_count' => $importedCount,
        ], 201);
    }

    /**
     * Helper untuk mengonversi nilai tanggal dari Excel (serial number, YYYY-MM-DD, DD-MM-YYYY, atau tahun YYYY).
     */
    private function parseImportDate($rawDate): ?string
    {
        if ($rawDate === null || $rawDate === '') {
            return null;
        }

        try {
            if (is_numeric($rawDate)) {
                $num = (float) $rawDate;
                if ($num >= 1950 && $num <= 2100 && floor($num) == $num) {
                    return ((int) $num) . '-01-01';
                }
                return \PhpOffice\PhpSpreadsheet\Shared\Date::excelToDateTimeObject($num)->format('Y-m-d');
            }

            $str = trim((string) $rawDate);
            if (preg_match('/^\d{4}$/', $str)) {
                return "{$str}-01-01";
            }
            if (preg_match('/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/', $str, $m)) {
                return \Carbon\Carbon::createFromDate((int) $m[3], (int) $m[2], (int) $m[1])->format('Y-m-d');
            }

            return \Carbon\Carbon::parse($str)->format('Y-m-d');
        } catch (\Throwable $e) {
            return null;
        }
    }

    // 2. STORE: Memproses penyimpanan data baru dari ReactJS
    public function store(Request $request)
    {
        if (!in_array(auth()->user()->id_peran, [1, 3])) {
            return response()->json(['message' => 'This action is unauthorized.'], 403);
        } 

        // Jika Admin Unit memiliki unit tanggung jawab, kunci id_unit ke unitnya
        $unitAdmin = $this->unitAdminAktif();
        if ($unitAdmin) {
            $request->merge(['id_unit' => $unitAdmin->id]);
        }
        
        $sanitizeFields = ['nama_aset', 'jenis_aset', 'id_unit', 'id_ruangan', 'kondisi_aset', 'sumber_dana'];
        $sanitizedData = [];
        foreach ($sanitizeFields as $field) {
            if ($request->has($field)) {
                $sanitizedData[$field] = strip_tags($request->input($field));
            }
        }
        if (!empty($sanitizedData)) {
            $request->merge($sanitizedData);
        }
        
        if ($request->has('id_ruangan')) {
            $ruanganInput = $request->id_ruangan;
            if (!is_numeric($ruanganInput)) {
                $namaRuangan = strip_tags($ruanganInput);
                $ruangan = \App\Models\Ruangan::firstOrCreate([
                    'nama_ruangan' => $namaRuangan
                ], [
                    'kode_ruangan' => strtoupper(substr(preg_replace('/[^a-zA-Z0-9]/', '', $namaRuangan), 0, 5)) . rand(10, 99)
                ]);
                $request->merge(['id_ruangan' => $ruangan->id]);
            }
        }
        
        $request->validate([
            'nama_aset'       => 'required',
            'jenis_aset'      => 'required',
            'id_unit'         => 'required|exists:lokasi_unit,id',
            'id_ruangan'      => 'required',
            'jumlah_aset'     => 'required|numeric|min:1',
            'kondisi_aset'    => 'required',
            'tgl_diperoleh'   => 'required|date'
        ]);

        // Jika Admin Unit menginput kategori (jenis_aset) baru secara manual, simpan ke tabel kategori_aset
        if ((int) auth()->user()->id_peran === 3 && $request->filled('jenis_aset')) {
            $namaKategori = preg_replace('/\s+/', ' ', trim($request->jenis_aset));
            $request->merge(['jenis_aset' => $namaKategori]);
            $sudahAda = \App\Models\KategoriAset::whereRaw('LOWER(TRIM(nama_kategori)) = ?', [mb_strtolower($namaKategori)])->first();
            if (!$sudahAda && $namaKategori !== '') {
                $huruf = strtoupper(preg_replace('/[^a-zA-Z]/', '', $namaKategori));
                $dasar = substr($huruf !== '' ? $huruf : 'KAT', 0, 3);
                $kode = $dasar;
                $suffix = 1;
                while (\App\Models\KategoriAset::where('kode_kategori', $kode)->exists()) {
                    $kode = $dasar . $suffix++;
                }
                \App\Models\KategoriAset::create([
                    'kode_kategori' => $kode,
                    'nama_kategori' => $namaKategori,
                ]);
            } elseif ($sudahAda) {
                $request->merge(['jenis_aset' => $sudahAda->nama_kategori]);
            }
        }

        $dataAset = $request->only([
            'nama_aset', 'jenis_aset', 'id_unit', 'id_ruangan',
            'jumlah_aset', 'kondisi_aset', 'tgl_diperoleh',
            'harga_aset', 'sumber_dana', 'foto'
        ]);
        $cleanHarga = isset($dataAset['harga_aset']) && $dataAset['harga_aset'] !== null && $dataAset['harga_aset'] !== ''
            ? preg_replace('/\D/', '', (string) $dataAset['harga_aset'])
            : '';
        $dataAset['harga_aset'] = $cleanHarga !== '' ? (int) $cleanHarga : 0;
        $dataAset['id_pengguna'] = auth()->user()->id; // Mengambil ID dari token Sanctum pengguna yang login

        $aset = \Illuminate\Support\Facades\DB::transaction(function () use ($request, $dataAset) {
            $kodeInventaris = $this->generateKodeInventaris(
                $request->id_unit,
                $request->tgl_diperoleh,
                $dataAset['sumber_dana'] ?? null
            );
            $dataAset['kode_inventaris'] = $kodeInventaris;

            $createdAset = Aset::create($dataAset);

            // Generate otomatis sub-kategori
            for ($i = 1; $i <= $createdAset->jumlah_aset; $i++) {
                \App\Models\SubAset::create([
                    'id_aset' => $createdAset->id,
                    'kode_sub_aset' => "{$kodeInventaris}-{$i}",
                    'id_ruangan' => $createdAset->id_ruangan,
                    'kondisi_aset' => $createdAset->kondisi_aset,
                    'status_penggunaan' => 'Tersedia'
                ]);
            }

            return $createdAset;
        });

        RiwayatAset::create([
            'id_aset'     => $aset->id, 
            'aksi'        => 'Penambahan',
            'id_pengguna' => auth()->user()->id,
            'keterangan'  => 'Menambahkan aset baru bernama: ' . $request->nama_aset,
            'waktu'       => now() 
        ]);
        
        $aset->load(['ruangan', 'lokasiUnit', 'subAset.ruangan']);
        
        return response()->json([
            'success' => true,
            'message' => 'Data aset berhasil ditambahkan!',
            'data'    => $aset
        ], 201);
    }

    // 3. DETAIL: Menampilkan satu data spesifik berdasarkan ID
    public function show($id)
    {
        $aset = Aset::with(['ruangan', 'lokasiUnit', 'subAset.ruangan'])->findOrFail($id);
        
        return response()->json([
            'success' => true,
            'message' => 'Detail data aset berhasil ditemukan.',
            'data'    => $aset
        ], 200);
    }

    // 4. UPDATE: Memproses perubahan data dari ReactJS
    public function update(Request $request, $id)
    {
        if (!in_array(auth()->user()->id_peran, [1, 3])) {
            return response()->json(['message' => 'This action is unauthorized.'], 403);
        } 

        // Jika Admin Unit memiliki unit tanggung jawab, kunci id_unit ke unitnya
        $unitAdmin = $this->unitAdminAktif();
        if ($unitAdmin) {
            $request->merge(['id_unit' => $unitAdmin->id]);
        }

        $sanitizeFields = ['nama_aset', 'jenis_aset', 'id_unit', 'id_ruangan', 'kondisi_aset', 'sumber_dana'];
        $sanitizedData = [];
        foreach ($sanitizeFields as $field) {
            if ($request->has($field)) {
                $sanitizedData[$field] = strip_tags($request->input($field));
            }
        }
        if (!empty($sanitizedData)) {
            $request->merge($sanitizedData);
        }

        if ($request->has('id_ruangan')) {
            $ruanganInput = $request->id_ruangan;
            if (!is_numeric($ruanganInput)) {
                $namaRuangan = strip_tags($ruanganInput);
                $ruangan = \App\Models\Ruangan::firstOrCreate([
                    'nama_ruangan' => $namaRuangan
                ], [
                    'kode_ruangan' => strtoupper(substr(preg_replace('/[^a-zA-Z0-9]/', '', $namaRuangan), 0, 5)) . rand(10, 99)
                ]);
                $request->merge(['id_ruangan' => $ruangan->id]);
            }
        }

        $request->validate([
            'jumlah_aset' => 'nullable|numeric|min:1',
        ]);

        if ($request->has('harga_aset')) {
            $cleanHargaUpdate = $request->input('harga_aset') !== null && $request->input('harga_aset') !== ''
                ? preg_replace('/\D/', '', (string) $request->input('harga_aset'))
                : '';
            $request->merge(['harga_aset' => $cleanHargaUpdate !== '' ? (int) $cleanHargaUpdate : 0]);
        }

        if ((int) auth()->user()->id_peran === 3 && $request->filled('jenis_aset')) {
            $namaKategori = preg_replace('/\s+/', ' ', trim($request->jenis_aset));
            $request->merge(['jenis_aset' => $namaKategori]);
            $sudahAda = \App\Models\KategoriAset::whereRaw('LOWER(TRIM(nama_kategori)) = ?', [mb_strtolower($namaKategori)])->first();
            if (!$sudahAda && $namaKategori !== '') {
                $huruf = strtoupper(preg_replace('/[^a-zA-Z]/', '', $namaKategori));
                $dasar = substr($huruf !== '' ? $huruf : 'KAT', 0, 3);
                $kode = $dasar;
                $suffix = 1;
                while (\App\Models\KategoriAset::where('kode_kategori', $kode)->exists()) {
                    $kode = $dasar . $suffix++;
                }
                \App\Models\KategoriAset::create([
                    'kode_kategori' => $kode,
                    'nama_kategori' => $namaKategori,
                ]);
            } elseif ($sudahAda) {
                $request->merge(['jenis_aset' => $sudahAda->nama_kategori]);
            }
        }

        $aset = Aset::findOrFail($id);

        if ($unitAdmin && (int) $aset->id_unit !== (int) $unitAdmin->id) {
            return response()->json([
                'success' => false,
                'message' => 'Anda hanya dapat mengubah data aset pada unit tanggung jawab Anda (' . $unitAdmin->nama_unit . ').'
            ], 403);
        }

        $oldJumlah = $aset->jumlah_aset;
        $oldKodeInventaris = $aset->kode_inventaris;
        
        $aset->fill($request->except(['_token', '_method', 'kode_inventaris']));

        // Cek apakah prefix kode inventaris perlu diperbarui (karena perubahan unit, tanggal, sumber dana, atau format lama)
        $expectedPrefix = self::buildPrefixKodeInventaris($aset->id_unit, $aset->tgl_diperoleh, $aset->sumber_dana);
        $needsKodeUpdate = isset($aset->getDirty()['id_unit'])
            || isset($aset->getDirty()['tgl_diperoleh'])
            || isset($aset->getDirty()['sumber_dana'])
            || !str_starts_with((string) $oldKodeInventaris, $expectedPrefix);

        if ($needsKodeUpdate) {
            $aset->kode_inventaris = $this->generateKodeInventaris(
                $aset->id_unit,
                $aset->tgl_diperoleh,
                $aset->sumber_dana,
                $aset->id
            );
        }

        $perubahan = $aset->getDirty();

        if (count($perubahan) > 0) {
            $teksPerubahan = [];
            
            $labelKolom = [
                'nama_aset' => 'Nama Aset',
                'jenis_aset' => 'Jenis Aset',
                'id_unit' => 'Unit',
                'id_ruangan' => 'Ruangan',
                'jumlah_aset' => 'Jumlah',
                'kondisi_aset' => 'Kondisi',
                'tgl_diperoleh' => 'Tanggal Diperoleh',
                'harga_aset' => 'Harga',
                'sumber_dana' => 'Sumber Dana',
                'kode_inventaris' => 'Kode Inventaris'
            ];

            foreach ($perubahan as $kolom => $nilaiBaru) {
                if ($kolom == 'updated_at' || $kolom == 'tgl_diperbaharui') continue;

                $nilaiLama = $aset->getOriginal($kolom);
                $namaLabel = $labelKolom[$kolom] ?? $kolom;

                if ($kolom == 'foto') {
                    $teksPerubahan[] = "Foto diperbarui";
                } elseif ($kolom == 'id_unit') {
                    $unitLama = \App\Models\LokasiUnit::find($nilaiLama)?->nama_unit ?? 'Tidak ada';
                    $unitBaru = \App\Models\LokasiUnit::find($nilaiBaru)?->nama_unit ?? 'Tidak ada';
                    $teksPerubahan[] = "Unit diubah dari '$unitLama' menjadi '$unitBaru'";
                } elseif ($kolom == 'id_ruangan') {
                    $ruangLama = \App\Models\Ruangan::find($nilaiLama)?->nama_ruangan ?? 'Tidak ada';
                    $ruangBaru = \App\Models\Ruangan::find($nilaiBaru)?->nama_ruangan ?? 'Tidak ada';
                    $teksPerubahan[] = "Ruangan diubah dari '$ruangLama' menjadi '$ruangBaru'";
                } else {
                    $teksPerubahan[] = "$namaLabel diubah dari '$nilaiLama' menjadi '$nilaiBaru'";
                }
            }
            $keterangan_final = "Aset telah diedit. Detail: " . implode(', ', $teksPerubahan);
            
            // Wrap semua operasi dalam transaction agar atomic (all-or-nothing)
            \Illuminate\Support\Facades\DB::transaction(function () use ($aset, $oldJumlah, $oldKodeInventaris, $perubahan, $keterangan_final, $id) {
                $aset->save();

                // Jika kode_inventaris berubah, sinkronkan seluruh kode_sub_aset dan referensi laporan kerusakan
                if (isset($perubahan['kode_inventaris']) && $oldKodeInventaris !== $aset->kode_inventaris) {
                    $subList = \App\Models\SubAset::where('id_aset', $aset->id)->orderBy('id', 'asc')->get();
                    $oldPrefix = $oldKodeInventaris . '-';
                    foreach ($subList as $idx => $sub) {
                        $oldSubCode = $sub->kode_sub_aset;
                        if (str_starts_with($oldSubCode, $oldPrefix)) {
                            $unitSeq = substr($oldSubCode, strlen($oldPrefix));
                        } else {
                            $lastDash = strrpos($oldSubCode, '-');
                            $unitSeq = $lastDash !== false ? substr($oldSubCode, $lastDash + 1) : ($idx + 1);
                        }
                        $newSubCode = "{$aset->kode_inventaris}-{$unitSeq}";
                        if ($oldSubCode !== $newSubCode) {
                            $sub->kode_sub_aset = $newSubCode;
                            $sub->save();

                            \App\Models\LaporanKerusakan::where('id_aset', $aset->id)
                                ->where('deskripsi', 'LIKE', "%(Unit: {$oldSubCode})%")
                                ->get()
                                ->each(function ($lk) use ($oldSubCode, $newSubCode) {
                                    $lk->deskripsi = str_replace("(Unit: {$oldSubCode})", "(Unit: {$newSubCode})", $lk->deskripsi);
                                    $lk->save();
                                });
                        }
                    }
                }

                // Sync sub_aset if jumlah_aset changed
                if (isset($perubahan['jumlah_aset'])) {
                    $newJumlah = $aset->jumlah_aset;
                    $actualCount = \App\Models\SubAset::where('id_aset', $aset->id)->count();

                    if ($newJumlah > $actualCount) {
                        // Cari nomor urut tertinggi dari sub-aset yang sudah ada
                        // untuk menghindari duplikat kode setelah penghapusan unit individu
                        $existingCodes = \App\Models\SubAset::where('id_aset', $aset->id)
                            ->pluck('kode_sub_aset')
                            ->toArray();
                        
                        $maxSeq = 0;
                        $prefix = $aset->kode_inventaris . '-';
                        foreach ($existingCodes as $code) {
                            if (str_starts_with($code, $prefix)) {
                                $seq = (int) substr($code, strlen($prefix));
                                if ($seq > $maxSeq) {
                                    $maxSeq = $seq;
                                }
                            }
                        }

                        $toAdd = $newJumlah - $actualCount;
                        for ($i = 1; $i <= $toAdd; $i++) {
                            $nextSeq = $maxSeq + $i;
                            \App\Models\SubAset::create([
                                'id_aset' => $aset->id,
                                'kode_sub_aset' => "{$aset->kode_inventaris}-{$nextSeq}",
                                'id_ruangan' => $aset->id_ruangan,
                                'kondisi_aset' => $aset->kondisi_aset,
                                'status_penggunaan' => 'Tersedia'
                            ]);
                        }
                    } elseif ($newJumlah < $actualCount) {
                        // Hapus sub-aset dari urutan belakang, tapi lewati unit yang sedang diperbaiki
                        $toRemove = $actualCount - $newJumlah;
                        $candidates = \App\Models\SubAset::where('id_aset', $aset->id)
                            ->orderBy('kode_sub_aset', 'desc')
                            ->get();
                        
                        $removed = 0;
                        foreach ($candidates as $candidate) {
                            if ($removed >= $toRemove) break;
                            
                            // Cek apakah unit ini sedang dalam proses perbaikan
                            $hasActiveRepair = \App\Models\LaporanKerusakan::whereNotIn('status_kerusakan', ['Selesai', 'Ditolak'])
                                ->where('deskripsi', 'LIKE', '%(Unit: ' . $candidate->kode_sub_aset . ')%')
                                ->exists();
                            
                            if (!$hasActiveRepair) {
                                $candidate->delete();
                                $removed++;
                            }
                        }
                        
                        // Jika tidak semua bisa dihapus karena sedang diperbaiki, sesuaikan jumlah
                        if ($removed < $toRemove) {
                            $aset->jumlah_aset = $aset->jumlah_aset + ($toRemove - $removed);
                            $aset->save();
                        }
                    }
                }

                if (isset($perubahan['id_ruangan']) || isset($perubahan['kondisi_aset'])) {
                    $syncFields = [];
                    if (isset($perubahan['id_ruangan'])) $syncFields['id_ruangan'] = $aset->id_ruangan;
                    if (isset($perubahan['kondisi_aset'])) $syncFields['kondisi_aset'] = $aset->kondisi_aset;
                    
                    \App\Models\SubAset::where('id_aset', $aset->id)->update($syncFields);
                }

                RiwayatAset::create([
                    'id_aset'     => $id,
                    'aksi'        => 'Perubahan',
                    'id_pengguna' => auth()->user()->id,
                    'keterangan'  => $keterangan_final,
                    'waktu'       => now()
                ]);
            });
            
            $aset->load(['ruangan', 'lokasiUnit', 'subAset.ruangan']);
            
            return response()->json([
                'success' => true,
                'message' => 'Aset berhasil diperbarui beserta log perubahannya!',
                'data'    => $aset
            ], 200);
        }

        // Tidak ada perubahan field, tapi cek apakah sub-aset perlu di-reconcile
        // (kasus: edit sebelumnya gagal setengah jalan, jumlah_aset sudah tersimpan tapi sub-aset belum dibuat)
        $actualCount = \App\Models\SubAset::where('id_aset', $aset->id)->count();
        if ($actualCount < $aset->jumlah_aset) {
            \Illuminate\Support\Facades\DB::transaction(function () use ($aset, $actualCount) {
                $existingCodes = \App\Models\SubAset::where('id_aset', $aset->id)
                    ->pluck('kode_sub_aset')
                    ->toArray();
                
                $maxSeq = 0;
                $prefix = $aset->kode_inventaris . '-';
                foreach ($existingCodes as $code) {
                    if (str_starts_with($code, $prefix)) {
                        $seq = (int) substr($code, strlen($prefix));
                        if ($seq > $maxSeq) {
                            $maxSeq = $seq;
                        }
                    }
                }

                $toAdd = $aset->jumlah_aset - $actualCount;
                for ($i = 1; $i <= $toAdd; $i++) {
                    $nextSeq = $maxSeq + $i;
                    \App\Models\SubAset::create([
                        'id_aset' => $aset->id,
                        'kode_sub_aset' => "{$aset->kode_inventaris}-{$nextSeq}",
                        'id_ruangan' => $aset->id_ruangan,
                        'kondisi_aset' => $aset->kondisi_aset,
                        'status_penggunaan' => 'Tersedia'
                    ]);
                }
            });
        }

        $aset->load(['ruangan', 'lokasiUnit', 'subAset.ruangan']);

        return response()->json([
            'success' => true,
            'message' => $actualCount < $aset->jumlah_aset 
                ? 'Sub-aset yang hilang berhasil dipulihkan.' 
                : 'Tidak ada perubahan data yang dilakukan.',
            'data'    => $aset
        ], 200);
    }

    // 5. DELETE: Menghapus data aset beserta alasan penghapusan
    public function destroy(Request $request, $id)
    {
        if (!in_array(auth()->user()->id_peran, [1, 3])) {
            return response()->json(['message' => 'This action is unauthorized.'], 403);
        } 

        $alasan = trim(strip_tags((string) ($request->input('alasan_penghapusan') ?? $request->input('alasan') ?? '')));
        if ($alasan === '') {
            return response()->json([
                'success' => false,
                'message' => 'Alasan penghapusan aset wajib diisi sebelum menghapus.'
            ], 422);
        }

        $aset = Aset::findOrFail($id);

        $unitAdmin = $this->unitAdminAktif();
        if ($unitAdmin && (int) $aset->id_unit !== (int) $unitAdmin->id) {
            return response()->json([
                'success' => false,
                'message' => 'Anda hanya dapat menghapus data aset pada unit tanggung jawab Anda (' . $unitAdmin->nama_unit . ').'
            ], 403);
        }

        // Cek apakah aset utama atau salah satu unit sub-asetnya sedang dalam proses perbaikan
        $activeRepair = \App\Models\LaporanKerusakan::where('id_aset', $id)
            ->whereNotIn('status_kerusakan', ['Selesai', 'Ditolak'])
            ->exists();

        if ($activeRepair) {
            return response()->json([
                'success' => false,
                'message' => 'Aset ini tidak dapat dihapus karena masih dalam proses perbaikan.'
            ], 422);
        }
        
        RiwayatAset::create([
            'id_aset'     => $id,
            'aksi'        => 'Penghapusan',
            'id_pengguna' => auth()->user()->id,
            'keterangan'  => "Menghapus aset '{$aset->nama_aset}' ({$aset->kode_inventaris}). Alasan penghapusan: {$alasan}",
            'waktu'       => now()
        ]);

        // Hapus semua sub-aset terkait sebelum menghapus aset induk
        \App\Models\SubAset::where('id_aset', $id)->delete();
        
        $aset->delete(); // Soft delete agar data masih bisa di-recover

        return response()->json([
            'success' => true,
            'message' => 'Data aset berhasil dihapus dari sistem.'
        ], 200);
    }
}