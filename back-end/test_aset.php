<?php
$user = App\Models\pengguna::first();
auth()->login($user);
$controller = new App\Http\Controllers\AsetController();
$request = new Illuminate\Http\Request();
$request->merge([
    'nama_aset' => 'Test',
    'kode_inventaris' => 'SMP-17062024-0001',
    'jenis_aset' => 'Umum',
    'jumlah_aset' => 1,
    'kondisi_aset' => 'baik',
    'lokasi_aset' => 'SMP',
    'tgl_diperoleh' => '2026-06-17',
    'harga_aset' => 1000,
    'sumber_dana' => 'Dana Yayasan',
    'foto' => ''
]);
try {
    $res = $controller->store($request);
    echo $res->getContent();
} catch (\Illuminate\Validation\ValidationException $e) {
    echo json_encode($e->errors());
} catch (\Exception $e) {
    echo "EXCEPTION: " . $e->getMessage();
}
