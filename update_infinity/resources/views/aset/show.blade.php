<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Detail Aset</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body class="bg-light">
    <div class="container mt-5 mb-5">
        <div class="row justify-content-center">
            <div class="col-md-8">
                <div class="card shadow">
                    <div class="card-header bg-info text-white">
                        <h4 class="mb-0">Detail Informasi Aset</h4>
                    </div>
                    <div class="card-body">
                        <table class="table table-bordered table-striped">
                            <tbody>
                                <tr>
                                    <th width="30%">Kode Inventaris</th>
                                    <td>{{ $aset->kode_inventaris }}</td>
                                </tr>
                                <tr>
                                    <th>Nama Aset</th>
                                    <td>{{ $aset->nama_aset }}</td>
                                </tr>
                                <tr>
                                    <th>Jenis / Kategori</th>
                                    <td>{{ $aset->jenis_aset }}</td>
                                </tr>
                                <tr>
                                    <th>Lokasi Aset</th>
                                    <td>{{ $aset->lokasi_aset }}</td>
                                </tr>
                                <tr>
                                    <th>Jumlah</th>
                                    <td>{{ $aset->jumlah_aset }} Unit</td>
                                </tr>
                                <tr>
                                    <th>Kondisi Saat Ini</th>
                                    <td>
                                        @if($aset->kondisi_aset == 'Baik')
                                            <span class="badge bg-success">Baik</span>
                                        @elseif($aset->kondisi_aset == 'Rusak Ringan')
                                            <span class="badge bg-warning text-dark">Rusak Ringan</span>
                                        @else
                                            <span class="badge bg-danger">Rusak Berat</span>
                                        @endif
                                    </td>
                                </tr>
                                <tr>
                                    <th>Tanggal Diperoleh</th>
                                    <td>{{ \Carbon\Carbon::parse($aset->tgl_diperoleh)->format('d F Y') }}</td>
                                </tr>
                                <tr>
                                    <th>Terakhir Diperbarui</th>
                                    <td>{{ \Carbon\Carbon::parse($aset->tgl_diperbaharui)->format('d/m/Y H:i') }} WIB</td>
                                </tr>
                            </tbody>
                        </table>

                        <div class="text-end mt-3">
                            <a href="{{ route('aset.index') }}" class="btn btn-secondary">Kembali ke Daftar Aset</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</body>
</html>