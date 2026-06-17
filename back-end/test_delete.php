<?php
try {
    $laporan = \App\Models\laporan_kerusakan::findOrFail(10);
    \App\Models\riwayat_aset::create([
        'id_aset'     => $laporan->id_aset,
        'aksi'        => 'Hapus',
        'id_pengguna' => 14,
        'keterangan'  => 'Menghapus',
        'waktu'       => now()
    ]);
    \App\Models\perbaikan_aset::where('id_laporan', 10)->delete();
    $laporan->delete();
    echo "OK\n";
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
