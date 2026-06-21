<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Catat Perbaikan Aset</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body class="bg-light">

    <div class="container mt-5 mb-5">
        <div class="row justify-content-center">
            <div class="col-md-8">
                <div class="card shadow">
                    <div class="card-header bg-primary text-white">
                        <h4 class="mb-0">Form Catat Perbaikan Aset</h4>
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

                        <form action="{{ route('perbaikan_aset.store') }}" method="POST">
                            @csrf
                            
                            <div class="mb-3">
                                <label class="form-label fw-bold">Pilih Laporan Kerusakan</label>
                                <select name="id_laporan" class="form-select" required>
                                    <option value="">-- Pilih Aset yang Dilaporkan Rusak --</option>
                                    @foreach($laporans as $laporan)
                                        <option value="{{ $laporan->id }}">
                                            {{ \Carbon\Carbon::parse($laporan->tgl_dibuat)->format('d/m/Y') }} - {{ $laporan->aset->nama_aset ?? 'Aset Dihapus' }} (Keluhan: {{ Str::limit($laporan->deskripsi_kerusakan, 50) }})
                                        </option>
                                    @endforeach
                                </select>
                            </div>

                            <div class="mb-3">
                                <label class="form-label fw-bold">Teknisi / Petugas Penanggung Jawab</label>
                                <select name="id_petugas" class="form-select" required>
                                    <option value="">-- Pilih Teknisi --</option>
                                    @foreach($teknisis as $teknisi)
                                        <option value="{{ $teknisi->id }}" {{ auth()->user()->id == $teknisi->id ? 'selected' : '' }}>
                                            {{ $teknisi->nama }}
                                        </option>
                                    @endforeach
                                </select>
                            </div>

                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label class="form-label fw-bold">Tanggal Mulai Perbaikan</label>
                                    <input type="date" name="tanggal_mulai" class="form-control" value="{{ date('Y-m-d') }}" required>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label class="form-label fw-bold">Tanggal Selesai</label>
                                    <input type="date" name="tanggal_selesai" class="form-control">
                                    <small class="text-muted">Kosongkan jika masih diproses.</small>
                                </div>
                            </div>

                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label class="form-label fw-bold">Status Perbaikan</label>
                                    <select name="status_perbaikan" class="form-select" required>
                                        <option value="Proses">Sedang Diproses</option>
                                        <option value="Selesai">Selesai / Berhasil Diperbaiki</option>
                                        <option value="Gagal">Gagal / Aset Mati Total</option>
                                    </select>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label class="form-label fw-bold">Total Biaya (Rp)</label>
                                    <input type="number" name="biaya" class="form-control" placeholder="Contoh: 150000">
                                </div>
                            </div>

                            <div class="mb-4">
                                <label class="form-label fw-bold">Catatan Hasil Perbaikan</label>
                                <textarea name="hasil" class="form-control" rows="3" placeholder="Misal: Ganti LCD baru, atau bersihkan kipas..."></textarea>
                            </div>

                            <div class="d-flex justify-content-between">
                                <a href="{{ route('perbaikan_aset.index') }}" class="btn btn-secondary">Batal</a>
                                <button type="submit" class="btn btn-primary">Simpan Data Perbaikan</button>
                            </div>
                        </form>

                    </div>
                </div>
            </div>
        </div>
    </div>

</body>
</html>