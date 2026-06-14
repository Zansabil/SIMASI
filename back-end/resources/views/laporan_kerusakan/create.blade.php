<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Buat Laporan Kerusakan</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>
    <div class="container mt-5 mb-5">
        <div class="row justify-content-center">
            <div class="col-md-8">
                <div class="card">
                    <div class="card-header bg-primary text-white">
                        <h4 class="mb-0">Form Pelaporan Kerusakan Aset</h4>
                    </div>
                    <div class="card-body">
                        <form action="{{ route('laporan_kerusakan.store') }}" method="POST" enctype="multipart/form-data">
                            @csrf 

                            <div class="mb-3">
                                <label for="id_aset" class="form-label">Pilih Aset yang Rusak</label>
                                <select class="form-select @error('id_aset') is-invalid @enderror" id="id_aset" name="id_aset">
                                    <option value="">-- Pilih Aset --</option>
                                    @foreach($asets as $aset)
                                        <option value="{{ $aset->id }}" {{ old('id_aset') == $aset->id ? 'selected' : '' }}>
                                            {{ $aset->kode_inventaris }} - {{ $aset->nama_aset }}
                                        </option>
                                    @endforeach
                                </select>
                                @error('id_aset') <div class="invalid-feedback">{{ $message }}</div> @enderror
                            </div>

                            <div class="mb-3">
                                <label for="id_pelapor" class="form-label">Nama Pelapor</label>
                                <select class="form-select @error('id_pelapor') is-invalid @enderror" id="id_pelapor" name="id_pelapor">
                                    <option value="">-- Pilih Nama Pelapor --</option>
                                    @foreach($penggunas as $user)
                                        <option value="{{ $user->id }}" {{ old('id_pelapor') == $user->id ? 'selected' : '' }}>
                                            {{ $user->nama }}
                                        </option>
                                    @endforeach
                                </select>
                                @error('id_pelapor') <div class="invalid-feedback">{{ $message }}</div> @enderror
                            </div>

                            <div class="mb-3">
                                <label for="kategori_aset" class="form-label">Kategori Aset</label>
                                <input type="text" class="form-control @error('kategori_aset') is-invalid @enderror" id="kategori_aset" name="kategori_aset" value="{{ old('kategori_aset') }}" placeholder="Contoh: Elektronik, Mebel, dll">
                                @error('kategori_aset') <div class="invalid-feedback">{{ $message }}</div> @enderror
                            </div>

                            <div class="mb-3">
                                <label for="deskripsi" class="form-label">Deskripsi Kerusakan</label>
                                <textarea class="form-control @error('deskripsi') is-invalid @enderror" id="deskripsi" name="deskripsi" rows="4" placeholder="Jelaskan bagian mana yang rusak...">{{ old('deskripsi') }}</textarea>
                                @error('deskripsi') <div class="invalid-feedback">{{ $message }}</div> @enderror
                            </div>

                            <div class="mb-3">
                                <label for="tgl_laporan" class="form-label">Tanggal Pelaporan</label>
                                <input type="date" class="form-control @error('tgl_laporan') is-invalid @enderror" id="tgl_laporan" name="tgl_laporan" value="{{ old('tgl_laporan', date('Y-m-d')) }}">
                                @error('tgl_laporan') <div class="invalid-feedback">{{ $message }}</div> @enderror
                            </div>

                            <div class="mb-3">
                                <label for="status_kerusakan" class="form-label">Status Awal Laporan</label>
                                <select class="form-select @error('status_kerusakan') is-invalid @enderror" id="status_kerusakan" name="status_kerusakan">
                                    <option value="Menunggu" {{ old('status_kerusakan') == 'Menunggu' ? 'selected' : '' }}>Menunggu Validasi</option>
                                    <option value="Diproses" {{ old('status_kerusakan') == 'Diproses' ? 'selected' : '' }}>Sedang Diproses</option>
                                    <option value="Selesai" {{ old('status_kerusakan') == 'Selesai' ? 'selected' : '' }}>Selesai Diperbaiki</option>
                                </select>
                                @error('status_kerusakan') <div class="invalid-feedback">{{ $message }}</div> @enderror
                            </div>

                            <div class="mb-4">
                                <label for="lampiran" class="form-label">Upload Foto Kerusakan (Opsional)</label>
                                <input type="file" class="form-control @error('lampiran') is-invalid @enderror" id="lampiran" name="lampiran" accept="image/jpeg, image/png, image/jpg">
                                <div class="form-text">Format yang diizinkan: JPG, JPEG, PNG. Maksimal ukuran 2MB.</div>
                                @error('lampiran') <div class="invalid-feedback">{{ $message }}</div> @enderror
                            </div>

                            <div class="d-flex justify-content-between mt-4">
                                <a href="{{ route('laporan_kerusakan.index') }}" class="btn btn-secondary">Batal</a>
                                <button type="submit" class="btn btn-primary">Kirim Laporan</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>
</body>
</html>