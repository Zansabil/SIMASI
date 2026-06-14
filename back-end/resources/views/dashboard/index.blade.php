<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard - Manajemen Aset</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body class="bg-light">

    <nav class="navbar navbar-expand-lg navbar-dark bg-primary mb-4 shadow">
        <div class="container">
            <a class="navbar-brand fw-bold" href="{{ route('dashboard.index') }}">Sistem Manajemen Aset</a>
            <div class="collapse navbar-collapse">
                <ul class="navbar-nav me-auto">
                    <li class="nav-item">
                        <a class="nav-link text-white" href="{{ route('aset.index') }}">Data Aset</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link text-white" href="{{ route('laporan_kerusakan.index') }}">Laporan Kerusakan</a>
                    </li>
                    @if(auth()->user()->id_peran == 1)
                    <li class="nav-item">
                        <a class="nav-link text-white fw-bold text-warning" href="{{ route('pengguna.index') }}">Kelola Pengguna</a>
                    </li>
                    @endif
                </ul>
                <div class="d-flex align-items-center">
                    <span class="text-white me-3">👤 Halo, {{ auth()->user()->nama }}</span>
                    <form action="{{ route('logout') }}" method="POST" class="m-0">
                        @csrf
                        <button type="submit" class="btn btn-sm btn-danger">Logout</button>
                    </form>
                </div>
            </div>
        </div>
    </nav>

    <div class="container">
        <h4 class="mb-4 text-secondary">Ringkasan Sistem</h4>
        
        <div class="row">
            <div class="col-md-3 mb-4">
                <div class="card bg-info text-white shadow h-100">
                    <div class="card-body text-center">
                        <h1 class="display-4 fw-bold">{{ $total_aset }}</h1>
                        <h5>Total Aset</h5>
                    </div>
                </div>
            </div>

            <div class="col-md-3 mb-4">
                <div class="card bg-danger text-white shadow h-100">
                    <div class="card-body text-center">
                        <h1 class="display-4 fw-bold">{{ $aset_rusak }}</h1>
                        <h5>Aset Kondisi Rusak</h5>
                    </div>
                </div>
            </div>

            <div class="col-md-3 mb-4">
                <div class="card bg-warning text-dark shadow h-100">
                    <div class="card-body text-center">
                        <h1 class="display-4 fw-bold">{{ $laporan_menunggu }}</h1>
                        <h5>Laporan Menunggu</h5>
                    </div>
                </div>
            </div>

            @if(auth()->user()->id_peran == 1)
            <div class="col-md-3 mb-4">
                <div class="card bg-success text-white shadow h-100">
                    <div class="card-body text-center">
                        <h1 class="display-4 fw-bold">{{ $total_pengguna }}</h1>
                        <h5>Total Pengguna</h5>
                    </div>
                </div>
            </div>
            @endif
        </div>

        <div class="row mt-4">
            <div class="col-12 text-center text-muted">
                <p>Selamat datang di panel kendali utama. Gunakan menu di atas untuk menavigasi sistem.</p>
            </div>
        </div>
    </div>

</body>
</html>