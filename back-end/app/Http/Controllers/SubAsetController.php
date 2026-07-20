<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\SubAset;
use App\Models\RiwayatAset;

class SubAsetController extends Controller
{
    /**
     * Memperbarui kondisi pada satu unit spesifik (Sub-Aset)
     */
    public function updateKondisi(Request $request, $id)
    {
        try {
            // Role restriction removed as per user request to allow guru, yayasan, dll.

            $request->validate([
                'kondisi_aset' => 'required|string|max:150'
            ]);

            $subAset = \Illuminate\Support\Facades\DB::transaction(function () use ($request, $id) {
                $subAset = SubAset::where('id', $id)->lockForUpdate()->firstOrFail();
            
            $oldKondisi = $subAset->kondisi_aset;
            $newKondisi = $request->kondisi_aset;

            if ($oldKondisi != $newKondisi) {
                $subAset->kondisi_aset = $newKondisi;
                $subAset->save();

                RiwayatAset::create([
                    'id_aset'     => $subAset->id_aset,
                    'aksi'        => 'Perubahan',
                    'id_pengguna' => auth()->user()->id,
                    'keterangan'  => "Kondisi unit {$subAset->kode_sub_aset} diubah dari '{$oldKondisi}' menjadi '{$newKondisi}'",
                    'waktu'       => now()
                ]);

                // Jika kondisi diubah menjadi 'Baik', otomatis batalkan laporan perbaikan yang berstatus 'Menunggu'
                if (strtolower($newKondisi) === 'baik') {
                    $laporans = \App\Models\LaporanKerusakan::where('status_kerusakan', 'Menunggu')
                        ->where('deskripsi', 'LIKE', '%(Unit: ' . $subAset->kode_sub_aset . ')%')
                        ->lockForUpdate()
                        ->get();

                    foreach ($laporans as $laporan) {
                        $laporan->update([
                            'id_validasi'      => auth()->user()->id, 
                            'tgl_validasi'     => now(),
                            'status_kerusakan' => 'Ditolak',           
                            'alasan_penolakan' => 'Dibatalkan otomatis oleh sistem karena pengguna telah mengubah kondisi unit menjadi Baik.'
                        ]);

                        // Kirim notifikasi pembatalan ke pelapor (jika diperlukan)
                        \App\Models\Notifikasi::create([
                            'id_pengguna'    => $laporan->id_pelapor,
                            'tipe'           => 'Status Laporan',
                            'pesan'          => 'Laporan kerusakan unit ' . $subAset->kode_sub_aset . ' dibatalkan otomatis karena kondisi aset telah diubah menjadi Baik.',
                            'terbaca'        => 0,
                            'waktu_terkirim' => now(),
                            'tgl_dibuat'     => now()
                        ]);
                    }
                }
                
                return $subAset;
            }, 3);

            $subAset->load('ruangan');

            return response()->json([
                'success' => true,
                'message' => 'Kondisi unit berhasil diperbarui',
                'data'    => $subAset
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ], 500);
        }
    }
}
