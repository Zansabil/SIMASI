<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Catat Pemindahan Aset</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body class="bg-light">

    <div class="container mt-5 mb-5">
        <div class="row justify-content-center">
            <div class="col-md-8">
                <div class="card shadow">
                    <div class="card-header bg-success text-white">
                        <h4 class="mb-0">Form Catat Pemindahan Aset</h4>
                    </div>
                    <div class="card-body">
                        
                        @if($errors->any())
                            <div class="alert alert-danger">
                                <ul class="mb-0">
                                    @foreach($errors->all() as $error)
                                        <li>{{ $error }}</li>
                                    @endforeach
                                </ul>
                            </div>
                        @endif

                        <form action="{{ route('pemindahan_aset.store') }}" method="POST">
                            @csrf
                            
                            <div class="mb-3">
                                <label class="form-label fw-bold">Pilih Aset yang Dipindah</label>
                                <select name="id_aset" class="form-select" required>
                                    <option value="">-- Pilih Aset --</option>
                                    @foreach($asets as $aset)
                                        <option value="{{ $aset->id }}">
                                            {{ $aset->kode_inventaris }} - {{ $aset->nama_aset }} (Lokasi Saat Ini: {{ $aset->lokasi_aset }})
                                        </option>
                                    @endforeach
                                </select>
                            </div>

                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label class="form-label fw-bold">Lokasi Sebelumnya</label>
                                    <input type="text" name="lokasi_sebelumnya" class="form-control" placeholder="Ketik lokasi lama..." required>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label class="form-label fw-bold">Lokasi Baru (Tujuan)</label>
                                    <input type="text" name="lokasi_baru" class="form-control" placeholder="Ketik lokasi baru..." required>
                                </div>
                            </div>

                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label class="form-label fw-bold">Tanggal Pindah</label>
                                    <input type="date" name="tgl_pindah" class="form-control" value="{{ date('Y-m-d') }}" required>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label class="form-label fw-bold">Status Aset Pasca Pindah</label>
                                    <select name="status_aset" class="form-select" required>
                                        <option value="Digunakan">Digunakan</option>
                                        <option value="Disimpan">Disimpan di Gudang</option>
                                        <option value="Dalam Perbaikan">Dalam Perbaikan</option>
                                    </select>
                                </div>
                            </div>

                            <div class="mb-4">
                                <label class="form-label fw-bold">Alasan Pemindahan</label>
                                <textarea name="alasan_pemindahan" class="form-control" rows="3" placeholder="Misal: Ruangan lama direnovasi, atau diberikan ke pegawai baru..." required></textarea>
                            </div>

                            <div class="d-flex justify-content-between">
                                <a href="{{ route('pemindahan_aset.index') }}" class="btn btn-secondary">Batal</a>
                                <button type="submit" class="btn btn-success">Simpan & Update Lokasi Aset</button>
                            </div>
                        </form>

                    </div>
                </div>
            </div>
        </div>
    </div>

</body>
</html>