<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tambah Aset Baru</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>
    <div class="container mt-5">
        <div class="row justify-content-center">
            <div class="col-md-8">
                <div class="card">
                    <div class="card-header bg-primary text-white">
                        <h4 class="mb-0">Tambah Data Aset</h4>
                    </div>
                    <div class="card-body">
                        <form action="{{ route('aset.store') }}" method="POST">
                            
                            @csrf 

                            <div class="mb-3">
                                <label for="kode_inventaris" class="form-label">Kode Inventaris</label>
                                <input type="text" class="form-control @error('kode_inventaris') is-invalid @enderror" id="kode_inventaris" name="kode_inventaris" value="{{ old('kode_inventaris') }}" placeholder="Contoh: INV-001">
                                @error('kode_inventaris') <div class="invalid-feedback">{{ $message }}</div> @enderror
                            </div>

                            <div class="mb-3">
                                <label for="nama_aset" class="form-label">Nama Aset</label>
                                <input type="text" class="form-control @error('nama_aset') is-invalid @enderror" id="nama_aset" name="nama_aset" value="{{ old('nama_aset') }}" placeholder="Contoh: Laptop Lenovo">
                                @error('nama_aset') <div class="invalid-feedback">{{ $message }}</div> @enderror
                            </div>

                            <div class="mb-3">
                                <label for="jenis_aset" class="form-label">Jenis Aset</label>
                                <input type="text" class="form-control @error('jenis_aset') is-invalid @enderror" id="jenis_aset" name="jenis_aset" value="{{ old('jenis_aset') }}" placeholder="Contoh: Elektronik">
                                @error('jenis_aset') <div class="invalid-feedback">{{ $message }}</div> @enderror
                            </div>

                            <div class="mb-3">
                                <label for="lokasi_aset" class="form-label">Lokasi Aset</label>
                                <input type="text" class="form-control @error('lokasi_aset') is-invalid @enderror" id="lokasi_aset" name="lokasi_aset" value="{{ old('lokasi_aset') }}" placeholder="Contoh: Ruang Tata Usaha">
                                @error('lokasi_aset') <div class="invalid-feedback">{{ $message }}</div> @enderror
                            </div>

                            <div class="mb-3">
                                <label for="jumlah_aset" class="form-label">Jumlah Aset</label>
                                <input type="number" class="form-control @error('jumlah_aset') is-invalid @enderror" id="jumlah_aset" name="jumlah_aset" value="{{ old('jumlah_aset') }}" placeholder="Contoh: 5">
                                @error('jumlah_aset') <div class="invalid-feedback">{{ $message }}</div> @enderror
                            </div>

                            <div class="mb-3">
                                <label for="kondisi_aset" class="form-label">Kondisi Aset</label>
                                <select class="form-select @error('kondisi_aset') is-invalid @enderror" id="kondisi_aset" name="kondisi_aset">
                                    <option value="">-- Pilih Kondisi --</option>
                                    <option value="Baik" {{ old('kondisi_aset') == 'Baik' ? 'selected' : '' }}>Baik</option>
                                    <option value="Rusak Ringan" {{ old('kondisi_aset') == 'Rusak Ringan' ? 'selected' : '' }}>Rusak Ringan</option>
                                    <option value="Rusak Berat" {{ old('kondisi_aset') == 'Rusak Berat' ? 'selected' : '' }}>Rusak Berat</option>
                                </select>
                                @error('kondisi_aset') <div class="invalid-feedback">{{ $message }}</div> @enderror
                            </div>

                            <div class="mb-3">
                                <label for="tgl_diperoleh" class="form-label">Tanggal Diperoleh</label>
                                <input type="date" class="form-control @error('tgl_diperoleh') is-invalid @enderror" id="tgl_diperoleh" name="tgl_diperoleh" value="{{ old('tgl_diperoleh') }}">
                                @error('tgl_diperoleh') <div class="invalid-feedback">{{ $message }}</div> @enderror
                            </div>

                            <div class="d-flex justify-content-between mt-4">
                                <a href="{{ route('aset.index') }}" class="btn btn-secondary">Kembali</a>
                                <button type="submit" class="btn btn-primary">Simpan Data</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>
</body>
</html>