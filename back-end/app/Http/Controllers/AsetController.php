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
    // 1. READ: Menampilkan semua data aset (Format JSON)
    public function index(Request $request)
    {
        $search = $request->search;
        $query = Aset::query();

        if ($search) {
            $query->where('nama_aset', 'like', "%{$search}%")
                  ->orWhere('kode_inventaris', 'like', "%{$search}%")
                  ->orWhere('jenis_aset', 'like', "%{$search}%")
                  ->orWhereHas('lokasiUnit', function ($q) use ($search) {
                      $q->where('nama_unit', 'like', "%{$search}%");
                  })
                  ->orWhereHas('ruangan', function ($q) use ($search) {
                      $q->where('nama_ruangan', 'like', "%{$search}%");
                  });
        }

        $asets = $query->with(['ruangan', 'lokasiUnit', 'subAset.ruangan'])->orderBy('tgl_dibuat', 'desc')->get();

        return response()->json([
            'success' => true,
            'message' => 'Daftar data aset berhasil diambil.',
            'data'    => $asets
        ], 200);
    }

    // CETAK PDF (Menghasilkan file stream untuk diunduh ReactJS)
    public function cetakPDF()
    {
        if (!in_array(auth()->user()->id_peran, [1, 3])) {
            return response()->json(['message' => 'This action is unauthorized.'], 403);
        } 

        $asets = Aset::with(['ruangan', 'lokasiUnit'])->orderBy('tgl_dibuat', 'desc')->get();
        $pdf = Pdf::loadView('aset.cetak', compact('asets'));
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

    // 2. STORE: Memproses penyimpanan data baru dari ReactJS
    public function store(Request $request)
    {
        if (!in_array(auth()->user()->id_peran, [1, 3])) {
            return response()->json(['message' => 'This action is unauthorized.'], 403);
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

        $dataAset = $request->all();
        $dataAset['id_pengguna'] = auth()->user()->id; // Mengambil ID dari token Sanctum pengguna yang login

        $aset = \Illuminate\Support\Facades\DB::transaction(function () use ($request, $dataAset) {
            // Kita butuh nama unit untuk prefix kode inventaris
            $unitModel = \App\Models\LokasiUnit::find($request->id_unit);
            $unitName = $unitModel ? strtoupper(trim($unitModel->nama_unit)) : 'UNKNOWN';
            
            $tanggal = \Carbon\Carbon::parse($request->tgl_diperoleh)->format('dmY');
            $prefix = "{$unitName}-{$tanggal}-";

            // Find the highest sequence number for this prefix with a lock
            $latestAset = Aset::where('kode_inventaris', 'like', "{$prefix}%")
                ->orderBy('kode_inventaris', 'desc')
                ->lockForUpdate()
                ->first();

            $nextSeq = 1;
            if ($latestAset) {
                // Extract sequence from the latest code
                $lastCode = $latestAset->kode_inventaris;
                $seqString = substr($lastCode, strlen($prefix));
                $lastSeq = (int) $seqString;
                $nextSeq = $lastSeq + 1;
            }

            $kodeInventaris = $prefix . str_pad($nextSeq, 4, '0', STR_PAD_LEFT);
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
        
        $aset->load(['ruangan', 'lokasiUnit']);
        
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

        $aset = Aset::findOrFail($id);
        $oldJumlah = $aset->jumlah_aset;
        
        $aset->fill($request->except(['_token', '_method']));
        $perubahan = $aset->getDirty();

        if (count($perubahan) > 0) {
            $teksPerubahan = [];
            foreach ($perubahan as $kolom => $nilaiBaru) {
                if ($kolom != 'updated_at') {
                    if ($kolom == 'foto') {
                        $teksPerubahan[] = "foto diperbarui";
                    } else {
                        $teksPerubahan[] = "kolom '$kolom' menjadi '$nilaiBaru'";
                    }
                }
            }
            $keterangan_final = "Aset telah diedit. Detail: " . implode(', ', $teksPerubahan);
            $aset->save();

            // Sync sub_aset if jumlah_aset, id_ruangan, or kondisi_aset changed
            if (isset($perubahan['jumlah_aset'])) {
                $newJumlah = $aset->jumlah_aset;
                if ($newJumlah > $oldJumlah) {
                    for ($i = $oldJumlah + 1; $i <= $newJumlah; $i++) {
                        \App\Models\SubAset::create([
                            'id_aset' => $aset->id,
                            'kode_sub_aset' => "{$aset->kode_inventaris}-{$i}",
                            'id_ruangan' => $aset->id_ruangan,
                            'kondisi_aset' => $aset->kondisi_aset,
                            'status_penggunaan' => 'Tersedia'
                        ]);
                    }
                } elseif ($newJumlah < $oldJumlah) {
                    // Delete excess sub_asets from the end
                    \App\Models\SubAset::where('id_aset', $aset->id)
                        ->orderBy('kode_sub_aset', 'desc')
                        ->limit($oldJumlah - $newJumlah)
                        ->delete();
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
            
            $aset->load(['ruangan', 'lokasiUnit', 'subAset.ruangan']);
            
            return response()->json([
                'success' => true,
                'message' => 'Aset berhasil diperbarui beserta log perubahannya!',
                'data'    => $aset
            ], 200);
        }

        $aset->load(['ruangan', 'lokasiUnit', 'subAset.ruangan']);

        return response()->json([
            'success' => true,
            'message' => 'Tidak ada perubahan data yang dilakukan.',
            'data'    => $aset
        ], 200);
    }

    // 5. DELETE: Menghapus data aset
    public function destroy($id)
    {
        if (!in_array(auth()->user()->id_peran, [1, 3])) {
            return response()->json(['message' => 'This action is unauthorized.'], 403);
        } 

        $aset = Aset::findOrFail($id);
        
        RiwayatAset::create([
            'id_aset'     => $id,
            'aksi'        => 'Penghapusan',
            'id_pengguna' => auth()->user()->id,
            'keterangan'  => 'Menghapus aset bernama: ' . $aset->nama_aset,
            'waktu'       => now()
        ]);
        
        $aset->forceDelete();

        return response()->json([
            'success' => true,
            'message' => 'Data aset berhasil dihapus dari sistem.'
        ], 200);
    }
}