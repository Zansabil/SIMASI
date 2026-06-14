<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Edit Data Aset</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>
    <div class="container mt-5">
        <div class="row justify-content-center">
            <div class="col-md-8">
                <div class="card">
                    <div class="card-header bg-warning text-dark">
                        <h4 class="mb-0">Edit Data Aset</h4>
                    </div>
                    <div class="card-body">
                        <form action="{{ route('aset.update', $aset->id) }}" method="POST">
                            
                            @csrf 
                            @method('PUT') 

                            <div class="mb-3">
                                <label for="kode_inventaris" class="form-label">Kode Inventaris</label>
                                <input type="text" class="form-control @error('kode_inventaris') is-invalid @enderror" id="kode_inventaris" name="kode_inventaris" value="{{ old('kode_inventaris', $aset->kode_inventaris) }}">
                                @error('kode_inventaris') <div class="invalid-feedback">{{ $message }}</div> @enderror
                            </div>

                            <div class="mb-3">
                                <label for="nama_aset" class="form-label">Nama Aset</label>
                                <input type="text" class="form-control @error('nama_aset') is-invalid @enderror" id="nama_aset" name="nama_aset" value="{{ old('nama_aset', $aset->nama_aset) }}">
                                @error('nama_aset') <div class="invalid-feedback">{{ $message }}</div> @enderror
                            </div>

                            <div class="mb-3">
                                <label for="jenis_aset" class="form-label">Jenis Aset</label>
                                <input type="text" class="form-control @error('jenis_aset') is-invalid @enderror" id="jenis_aset" name="jenis_aset" value="{{ old('jenis_aset', $aset->jenis_aset) }}">
                                @error('jenis_aset') <div class="invalid-feedback">{{ $message }}</div> @enderror
                            </div>

                            <div class="mb-3">
                                <label for="lokasi_aset" class="form-label">Lokasi Aset</label>
                                <input type="text" class="form-control @error('lokasi_aset') is-invalid @enderror" id="lokasi_aset" name="lokasi_aset" value="{{ old('lokasi_aset', $aset->lokasi_aset) }}">
                                @error('lokasi_aset') <div class="invalid-feedback">{{ $message }}</div> @enderror
                            </div>

                            <div class="mb-3">
                                <label for="jumlah_aset" class="form-label">Jumlah Aset</label>
                                <input type="number" class="form-control @error('jumlah_aset') is-invalid @enderror" id="jumlah_aset" name="jumlah_aset" value="{{ old('jumlah_aset', $aset->jumlah_aset) }}">
                                @error('jumlah_aset') <div class="invalid-feedback">{{ $message }}</div> @enderror
                            </div>

                            <div class="mb-3">
                                <label for="kondisi_aset" class="form-label">Kondisi Aset</label>
                                <select class="form-select @error('kondisi_aset') is-invalid @enderror" id="kondisi_aset" name="kondisi_aset">
                                    <option value="Baik" {{ old('kondisi_aset', $aset->kondisi_aset) == 'Baik' ? 'selected' : '' }}>Baik</option>
                                    <option value="Rusak Ringan" {{ old('kondisi_aset', $aset->kondisi_aset) == 'Rusak Ringan' ? 'selected' : '' }}>Rusak Ringan</option>
                                    <option value="Rusak Berat" {{ old('kondisi_aset', $aset->kondisi_aset) == 'Rusak Berat' ? 'selected' : '' }}>Rusak Berat</option>
                                </select>
                                @error('kondisi_aset') <div class="invalid-feedback">{{ $message }}</div> @enderror
                            </div>

                            <div class="mb-3">
                                <label for="tgl_diperoleh" class="form-label">Tanggal Diperoleh</label>
                                <input type="date" class="form-control @error('tgl_diperoleh') is-invalid @enderror" id="tgl_diperoleh" name="tgl_diperoleh" value="{{ old('tgl_diperoleh', $aset->tgl_diperoleh) }}">
                                @error('tgl_diperoleh') <div class="invalid-feedback">{{ $message }}</div> @enderror
                            </div>

                            <div class="d-flex justify-content-between mt-4">
                                <a href="{{ route('aset.index') }}" class="btn btn-secondary">Batal</a>
                                <button type="submit" class="btn btn-warning">Update Data</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>
</body>
</html>