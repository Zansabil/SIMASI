<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\aset;
use App\Exports\AsetExport;
use Maatwebsite\Excel\Facades\Excel;
use Barryvdh\DomPDF\Facade\Pdf; 
use App\Models\riwayat_aset;
use Illuminate\Support\Facades\Gate;

class AsetController extends Controller
{
    // 1. READ: Menampilkan semua data aset (Format JSON)
    public function index(Request $request)
    {
        $search = $request->search;
        $query = aset::query();

        if ($search) {
            $query->where('nama_aset', 'like', "%{$search}%")
                  ->orWhere('kode_inventaris', 'like', "%{$search}%")
                  ->orWhere('jenis_aset', 'like', "%{$search}%");
        }

        $asets = $query->orderBy('tgl_dibuat', 'desc')->get();

        return response()->json([
            'success' => true,
            'message' => 'Daftar data aset berhasil diambil.',
            'data'    => $asets
        ], 200);
    }

    // CETAK PDF (Menghasilkan file stream untuk diunduh ReactJS)
    public function cetakPDF()
    {
        Gate::authorize('kelola-aset'); 

        $asets = aset::orderBy('tgl_dibuat', 'desc')->get();
        $pdf = Pdf::loadView('aset.cetak', compact('asets'));
        $pdf->setPaper('A4', 'landscape');
        
        return $pdf->stream('Laporan_Data_Aset.pdf');
    }

    // CETAK EXCEL (Menghasilkan file download untuk diunduh ReactJS)
    public function cetakExcel()
    {
        Gate::authorize('kelola-aset'); 

        return Excel::download(new AsetExport, 'Laporan_Data_Aset.xlsx');
    }

    // 2. STORE: Memproses penyimpanan data baru dari ReactJS
    public function store(Request $request)
    {
        Gate::authorize('kelola-aset'); 
        
        $request->validate([
            'kode_inventaris' => 'required|unique:aset,kode_inventaris',
            'nama_aset'       => 'required',
            'jenis_aset'      => 'required',
            'lokasi_aset'     => 'required',
            'jumlah_aset'     => 'required|numeric',
            'kondisi_aset'    => 'required',
            'tgl_diperoleh'   => 'required|date'
        ]);

        $dataAset = $request->all();
        $dataAset['id_pengguna'] = auth()->user()->id; // Mengambil ID dari token Sanctum pengguna yang login

        $aset = aset::create($dataAset);

        riwayat_aset::create([
            'id_aset'     => $aset->id, 
            'aksi'        => 'Penambahan',
            'id_pengguna' => auth()->user()->id,
            'keterangan'  => 'Menambahkan aset baru bernama: ' . $request->nama_aset,
            'waktu'       => now() 
        ]);
        
        return response()->json([
            'success' => true,
            'message' => 'Data aset berhasil ditambahkan!',
            'data'    => $aset
        ], 201);
    }

    // 3. DETAIL: Menampilkan satu data spesifik berdasarkan ID
    public function show($id)
    {
        $aset = aset::findOrFail($id);
        
        return response()->json([
            'success' => true,
            'message' => 'Detail data aset berhasil ditemukan.',
            'data'    => $aset
        ], 200);
    }

    // 4. UPDATE: Memproses perubahan data dari ReactJS
    public function update(Request $request, $id)
    {
        Gate::authorize('kelola-aset'); 

        $aset = aset::findOrFail($id);
        $aset->fill($request->except(['_token', '_method']));
        $perubahan = $aset->getDirty();

        if (count($perubahan) > 0) {
            $teksPerubahan = [];
            foreach ($perubahan as $kolom => $nilaiBaru) {
                if ($kolom != 'updated_at') {
                    $teksPerubahan[] = "kolom '$kolom' menjadi '$nilaiBaru'";
                }
            }
            $keterangan_final = "Aset telah diedit. Detail: " . implode(', ', $teksPerubahan);
            $aset->save();

            riwayat_aset::create([
                'id_aset'     => $id,
                'aksi'        => 'Perubahan',
                'id_pengguna' => auth()->user()->id,
                'keterangan'  => $keterangan_final,
                'waktu'       => now()
            ]);
            
            return response()->json([
                'success' => true,
                'message' => 'Aset berhasil diperbarui beserta log perubahannya!',
                'data'    => $aset
            ], 200);
        }

        return response()->json([
            'success' => false,
            'message' => 'Tidak ada perubahan data yang dilakukan.'
        ], 200);
    }

    // 5. DELETE: Menghapus data aset
    public function destroy($id)
    {
        Gate::authorize('kelola-aset'); 

        $aset = aset::findOrFail($id);
        
        riwayat_aset::create([
            'id_aset'     => $id,
            'aksi'        => 'Penghapusan',
            'id_pengguna' => auth()->user()->id,
            'keterangan'  => 'Menghapus aset bernama: ' . $aset->nama_aset,
            'waktu'       => now()
        ]);
        
        $aset->delete();

        return response()->json([
            'success' => true,
            'message' => 'Data aset berhasil dihapus dari sistem.'
        ], 200);
    }
}