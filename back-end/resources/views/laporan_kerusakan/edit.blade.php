<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Edit / Validasi Laporan</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>
    <div class="container mt-5 mb-5">
        <div class="row justify-content-center">
            <div class="col-md-8">
                <div class="card">
                    <div class="card-header bg-warning text-dark">
                        <h4 class="mb-0">Update & Validasi Laporan Kerusakan</h4>
                    </div>
                    <div class="card-body">
                        <form action="{{ route('laporan_kerusakan.update', $laporan_kerusakan->id) }}" method="POST" enctype="multipart/form-data">
                            @csrf 
                            @method('PUT')

                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label class="form-label fw-bold">Aset</label>
                                    <input type="text" class="form-control bg-light" value="{{ $laporan_kerusakan->aset->nama_aset }}" readonly>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label class="form-label fw-bold">Pelapor</label>
                                    <input type="text" class="form-control bg-light" value="{{ $laporan_kerusakan->pelapor->nama }}" readonly>
                                </div>
                            </div>

                            <div class="mb-3">
                                <label for="status_kerusakan" class="form-label fw-bold">Status Perbaikan</label>
                                <select class="form-select border-primary" id="status_kerusakan" name="status_kerusakan">
                                    <option value="Menunggu" {{ $laporan_kerusakan->status_kerusakan == 'Menunggu' ? 'selected' : '' }}>Menunggu Validasi</option>
                                    <option value="Diproses" {{ $laporan_kerusakan->status_kerusakan == 'Diproses' ? 'selected' : '' }}>Sedang Diproses</option>
                                    <option value="Selesai" {{ $laporan_kerusakan->status_kerusakan == 'Selesai' ? 'selected' : '' }}>Selesai / Diperbaiki</option>
                                </select>
                            </div>

                            <hr>
                            <h5 class="text-primary">Bagian Validasi (Diisi oleh Admin)</h5>

                            <div class="mb-3">
                                <label for="id_validasi" class="form-label fw-bold">Nama Validator (Admin)</label>
                                <select class="form-select" id="id_validasi" name="id_validasi">
                                    <option value="">-- Pilih Nama Admin --</option>
                                    @foreach($penggunas as $user)
                                        <option value="{{ $user->id }}" {{ $laporan_kerusakan->id_validasi == $user->id ? 'selected' : '' }}>
                                            {{ $user->nama }}
                                        </option>
                                    @endforeach
                                </select>
                            </div>

                            <div class="mb-3">
                                <label for="tgl_validasi" class="form-label fw-bold">Tanggal Validasi Selesai</label>
                                <input type="date" class="form-control" id="tgl_validasi" name="tgl_validasi" value="{{ $laporan_kerusakan->tgl_validasi ?? date('Y-m-d') }}">
                            </div>

                            <div class="mb-3">
                                <label class="form-label fw-bold">Deskripsi Kerusakan (Catatan)</label>
                                <textarea class="form-control" name="deskripsi" rows="3">{{ $laporan_kerusakan->deskripsi }}</textarea>
                            </div>

                            <div class="d-flex justify-content-between mt-4">
                                <a href="{{ route('laporan_kerusakan.index') }}" class="btn btn-secondary">Batal</a>
                                <button type="submit" class="btn btn-success">Simpan Perubahan</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>
</body>
</html>