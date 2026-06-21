<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Tambah Pengguna Baru</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body class="bg-light">
    <div class="container mt-5 mb-5">
        <div class="row justify-content-center">
            <div class="col-md-8">
                <div class="card shadow border-0">
                    <div class="card-header bg-success text-white fw-bold">
                        ➕ Tambah Pengguna Baru
                    </div>
                    <div class="card-body">
                        
                        @if ($errors->any())
                            <div class="alert alert-danger">
                                <ul class="mb-0">
                                    @foreach ($errors->all() as $error)
                                        <li>{{ $error }}</li>
                                    @endforeach
                                </ul>
                            </div>
                        @endif

                        <form action="{{ route('pengguna.store') }}" method="POST">
                            @csrf
                            
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label class="form-label fw-bold">Nama Lengkap</label>
                                    <input type="text" name="nama" class="form-control border-success" required placeholder="Contoh: Budi Santoso">
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label class="form-label fw-bold">Username</label>
                                    <input type="text" name="nama_pengguna" class="form-control border-success" required placeholder="Contoh: budi123">
                                </div>
                            </div>

                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label class="form-label fw-bold">Email</label>
                                    <input type="email" name="email" class="form-control border-success" required placeholder="Contoh: budi@sekolah.com">
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label class="form-label fw-bold">Password Awal</label>
                                    <input type="password" name="password" class="form-control border-success" required minlength="8" placeholder="Minimal 8 karakter">
                                </div>
                            </div>

                            <div class="row">
                                <div class="col-md-6 mb-4">
                                    <label class="form-label fw-bold">Pilih Peran / Hak Akses</label>
                                    <select name="id_peran" class="form-select border-success" required>
                                        <option value="" disabled selected>-- Pilih Peran --</option>
                                        <option value="1">1 - Super Admin</option>
                                        <option value="2">2 - Kepala Yayasan</option>
                                        <option value="3">3 - Admin Unit</option>
                                        <option value="4">4 - Guru / Staf Biasa</option>
                                        <option value="5">5 - Petugas Perbaikan</option>
                                    </select>
                                </div>
                                <div class="col-md-6 mb-4">
                                    <label class="form-label fw-bold">Status Akun</label>
                                    <select name="status_aktif" class="form-select border-success" required>
                                        <option value="1" selected>Aktif (Bisa Login)</option>
                                        <option value="0">Non-Aktif (Diblokir)</option>
                                    </select>
                                </div>
                            </div>

                            <div class="d-flex justify-content-between">
                                <a href="{{ route('pengguna.index') }}" class="btn btn-secondary shadow-sm">Batal</a>
                                <button type="submit" class="btn btn-success shadow-sm px-4">Simpan Pengguna</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>
</body>
</html>