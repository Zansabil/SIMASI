<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Ubah Peran Pengguna</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body class="bg-light">
    <div class="container mt-5">
        <div class="row justify-content-center">
            <div class="col-md-6">
                <div class="card shadow">
                    <div class="card-header bg-warning text-dark fw-bold">
                        Ubah Hak Akses Pengguna
                    </div>
                    <div class="card-body">
                        <form action="{{ route('pengguna.update', $pengguna->id) }}" method="POST">
                            @csrf @method('PATCH')
                            
                            <div class="mb-3">
                                <label class="form-label">Nama Pengguna</label>
                                <input type="text" class="form-control" value="{{ $pengguna->nama }}" disabled>
                            </div>

                            <div class="mb-4">
                                <label class="form-label fw-bold">Pilih Peran Baru:</label>
                                <select name="id_peran" class="form-select border-primary" required>
                                    <option value="1" {{ $pengguna->id_peran == 1 ? 'selected' : '' }}>1 - Super Admin</option>
                                    <option value="2" {{ $pengguna->id_peran == 2 ? 'selected' : '' }}>2 - Kepala Yayasan</option>
                                    <option value="3" {{ $pengguna->id_peran == 3 ? 'selected' : '' }}>3 - Admin Unit</option>
                                    <option value="5" {{ $pengguna->id_peran == 4 ? 'selected' : '' }}>4 - Guru / Staf Biasa</option>
                                    <option value="4" {{ $pengguna->id_peran == 5 ? 'selected' : '' }}>5 - Petugas Perbaikan</option>
                                </select>
                            </div>

                            <div class="d-flex justify-content-between">
                                <a href="{{ route('pengguna.index') }}" class="btn btn-secondary">Batal</a>
                                <button type="submit" class="btn btn-primary">Simpan Perubahan</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>
</body>
</html>