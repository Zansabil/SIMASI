<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Form Pengajuan Aset</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body class="bg-light">

    <div class="container mt-5 mb-5">
        <div class="row justify-content-center">
            <div class="col-md-8">
                <div class="card shadow">
                    <div class="card-header bg-primary text-white">
                        <h4 class="mb-0">Formulir Pengajuan Pengadaan Aset Baru</h4>
                    </div>
                    <div class="card-body">
                        
                        <div class="alert alert-info border-info">
                            <strong>Informasi:</strong> Pengajuan ini akan diteruskan ke Kepala Yayasan. Pastikan mengisi estimasi harga dan alasan dengan jelas agar mudah disetujui.
                        </div>

                        @if($errors->any())
                            <div class="alert alert-danger">
                                <ul class="mb-0">
                                    @foreach($errors->all() as $error)
                                        <li>{{ $error }}</li>
                                    @endforeach
                                </ul>
                            </div>
                        @endif

                        <form action="{{ route('pengadaan_aset.store') }}" method="POST">
                            @csrf
                            
                            <div class="row">
                                <div class="col-md-8 mb-3">
                                    <label class="form-label fw-bold">Nama Barang yang Dibutuhkan</label>
                                    <input type="text" name="nama_barang" class="form-control" placeholder="Contoh: Proyektor Epson EB-X51" required>
                                </div>
                                <div class="col-md-4 mb-3">
                                    <label class="form-label fw-bold">Tanggal Pengajuan</label>
                                    <input type="date" name="tgl_pengajuan" class="form-control" value="{{ date('Y-m-d') }}" required>
                                </div>
                            </div>

                            <div class="row">
                                <div class="col-md-4 mb-3">
                                    <label class="form-label fw-bold">Jumlah Barang</label>
                                    <input type="number" name="jumlah_barang" class="form-control" min="1" value="1" required>
                                </div>
                                <div class="col-md-8 mb-3">
                                    <label class="form-label fw-bold">Estimasi Harga Satuan (Rp)</label>
                                    <input type="number" name="harga_barang" class="form-control" placeholder="Contoh: 5500000" min="0" required>
                                </div>
                            </div>

                            <div class="mb-3">
                                <label class="form-label fw-bold">Rencana Lokasi Penempatan</label>
                                <input type="text" name="lokasi_penempatan" class="form-control" placeholder="Contoh: Ruang Kelas B, Laboratorium, dll" required>
                            </div>

                            <div class="mb-4">
                                <label class="form-label fw-bold">Alasan Pengadaan / Urgensi</label>
                                <textarea name="alasan" class="form-control" rows="4" placeholder="Jelaskan mengapa barang ini sangat dibutuhkan..." required></textarea>
                            </div>

                            <div class="d-flex justify-content-between">
                                <a href="{{ route('pengadaan_aset.index') }}" class="btn btn-secondary">Batal</a>
                                <button type="submit" class="btn btn-primary">Kirim Pengajuan</button>
                            </div>
                        </form>

                    </div>
                </div>
            </div>
        </div>
    </div>

</body>
</html>