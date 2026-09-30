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

    /**
     * Menghapus satu unit spesifik (Sub-Aset) dari aset induk
     */
    public function destroy($id)
    {
        try {
            // Hanya admin (peran 1) dan sarpras (peran 3) yang boleh menghapus
            if (!in_array(auth()->user()->id_peran, [1, 3])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Anda tidak memiliki izin untuk menghapus unit ini.'
                ], 403);
            }

            $result = \Illuminate\Support\Facades\DB::transaction(function () use ($id) {
                $subAset = SubAset::where('id', $id)->lockForUpdate()->firstOrFail();
                $aset = \App\Models\Aset::where('id', $subAset->id_aset)->lockForUpdate()->firstOrFail();

                // Cek apakah unit sedang dalam proses perbaikan
                $activeRepair = \App\Models\LaporanKerusakan::where('status_kerusakan', '!=', 'Selesai')
                    ->where('status_kerusakan', '!=', 'Ditolak')
                    ->where('deskripsi', 'LIKE', '%(Unit: ' . $subAset->kode_sub_aset . ')%')
                    ->exists();

                if ($activeRepair) {
                    throw new \Exception('Unit ini tidak dapat dihapus karena sedang dalam proses perbaikan.');
                }

                // Pastikan aset induk masih memiliki lebih dari 1 unit
                $totalUnit = SubAset::where('id_aset', $aset->id)->count();
                if ($totalUnit <= 1) {
                    throw new \Exception('Tidak dapat menghapus unit terakhir. Hapus aset induk jika ingin menghapus seluruh data.');
                }

                $kodeSubAset = $subAset->kode_sub_aset;
                $idAset = $subAset->id_aset;

                // Hapus sub-aset
                $subAset->delete();

                // Kurangi jumlah_aset pada aset induk
                $aset->jumlah_aset = $aset->jumlah_aset - 1;
                $aset->save();

                // Catat riwayat
                RiwayatAset::create([
                    'id_aset'     => $idAset,
                    'aksi'        => 'Penghapusan',
                    'id_pengguna' => auth()->user()->id,
                    'keterangan'  => "Unit {$kodeSubAset} telah dihapus dari aset {$aset->nama_aset}",
                    'waktu'       => now()
                ]);

                return [
                    'id_aset' => $idAset,
                    'kode_sub_aset' => $kodeSubAset,
                    'jumlah_aset_baru' => $aset->jumlah_aset
                ];
            }, 3);

            return response()->json([
                'success' => true,
                'message' => "Unit {$result['kode_sub_aset']} berhasil dihapus.",
                'data'    => $result
            ], 200);
        } catch (\Exception $e) {
            $statusCode = 500;
            if (str_contains($e->getMessage(), 'tidak dapat dihapus') || str_contains($e->getMessage(), 'Tidak dapat menghapus')) {
                $statusCode = 422;
            }
            
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], $statusCode);
        }
    }
}
