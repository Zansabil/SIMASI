<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Daftar Akun Baru</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body class="bg-light">
    <div class="container mt-5">
        <div class="row justify-content-center">
            <div class="col-md-6">
                <div class="card shadow">
                    <div class="card-header bg-success text-white text-center">
                        <h4>Buat Akun Baru</h4>
                    </div>
                    <div class="card-body p-4">
                        <form action="{{ url('/register') }}" method="POST">
                            @csrf
                            <div class="mb-3">
                                <label>Nama Lengkap</label>
                                <input type="text" name="nama" class="form-control @error('nama') is-invalid @enderror" value="{{ old('nama') }}" required>
                                @error('nama') <div class="text-danger small">{{ $message }}</div> @enderror
                            </div>
                            <div class="mb-3">
                                <label>Username (Nama Pengguna)</label>
                                <input type="text" name="nama_pengguna" class="form-control @error('nama_pengguna') is-invalid @enderror" value="{{ old('nama_pengguna') }}" required>
                                @error('nama_pengguna') <div class="text-danger small">{{ $message }}</div> @enderror
                            </div>
                            <div class="mb-3">
                                <label>Email</label>
                                <input type="email" name="email" class="form-control @error('email') is-invalid @enderror" value="{{ old('email') }}" required>
                                @error('email') <div class="text-danger small">{{ $message }}</div> @enderror
                            </div>
                            <div class="mb-3">
                                <label>Area / Unit Kerja</label>
                                <input type="text" name="area" class="form-control" value="{{ old('area') }}">
                            </div>
                            <div class="mb-4">
                                <label>Password (Min. 8 Karakter)</label>
                                <input type="password" name="password" class="form-control @error('password') is-invalid @enderror" required>
                                @error('password') <div class="text-danger small">{{ $message }}</div> @enderror
                            </div>
                            <button type="submit" class="btn btn-success w-100">Daftar Sekarang</button>
                        </form>
                        <div class="mt-3 text-center">
                            <a href="{{ url('/login') }}">Sudah punya akun? Login di sini</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</body>
</html>