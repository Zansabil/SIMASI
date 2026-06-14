<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Log Riwayat Aset</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body class="bg-light">

    <nav class="navbar navbar-expand-lg navbar-dark bg-dark mb-4 shadow">
        <div class="container">
            <a class="navbar-brand fw-bold" href="{{ route('dashboard.index') }}">Sistem Manajemen Aset</a>
            <div class="collapse navbar-collapse">
                <ul class="navbar-nav me-auto">
                    <li class="nav-item"><a class="nav-link text-white" href="{{ route('aset.index') }}">Data Aset</a></li>
                    <li class="nav-item"><a class="nav-link text-white" href="{{ route('pengadaan_aset.index') }}">Pengadaan Baru</a></li>
                    <li class="nav-item"><a class="nav-link text-warning fw-bold" href="{{ route('riwayat_aset.index') }}">Log Riwayat</a></li>
                </ul>
                <div class="d-flex align-items-center">
                    <span class="text-white me-3">👤 Halo, {{ auth()->user()->nama }}</span>
                </div>
            </div>
        </div>
    </nav>

    <div class="container-fluid px-4 mb-5">
        <div class="card shadow border-danger">
            <div class="card-header bg-danger text-white d-flex justify-content-between align-items-center">
                <h5 class="mb-0">CCTV Sistem: Log Riwayat Aset</h5>
            </div>
            <div class="card-body">
                
                @if(session('success'))
                    <div class="alert alert-success alert-dismissible fade show">
                        {{ session('success') }}
                        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                    </div>
                @endif
                @if(session('error'))
                    <div class="alert alert-danger alert-dismissible fade show">
                        {{ session('error') }}
                        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                    </div>
                @endif

                <div class="alert alert-warning">
                    <strong>Peringatan!</strong> Tabel ini merekam semua aktivitas secara otomatis. Menghapus data di sini akan menghilangkan jejak audit sistem.
                </div>

                <div class="table-responsive">
                    <table class="table table-bordered table-hover align-middle">
                        <thead class="table-dark text-center">
                            <tr>
                                <th>No</th>
                                <th>Waktu Kejadian</th>
                                <th>Pelaku (User)</th>
                                <th>Nama Aset</th>
                                <th>Jenis Aksi</th>
                                <th>Keterangan Detail</th>
                                @if(auth()->user()->id_peran == 1)
                                    <th>Aksi</th>
                                @endif
                            </tr>
                        </thead>
                        <tbody>
                            @forelse ($riwayats as $index => $item)
                                <tr>
                                    <td class="text-center">{{ $index + 1 }}</td>
                                    <td class="text-center text-nowrap">{{ \Carbon\Carbon::parse($item->waktu)->format('d/m/Y H:i:s') }}</td>
                                    
                                    <td class="fw-bold text-primary">{{ $item->pengguna->nama ?? 'Sistem / User Dihapus' }}</td>
                                    
                                    <td class="fw-bold">{{ $item->aset->nama_barang ?? 'Aset Telah Dihapus Permanen' }}</td>
                                    
                                    <td class="text-center">
                                        @if($item->aksi == 'Penambahan')
                                            <span class="badge bg-success">Penambahan</span>
                                        @elseif($item->aksi == 'Perubahan')
                                            <span class="badge bg-warning text-dark">Perubahan</span>
                                        @elseif($item->aksi == 'Penghapusan')
                                            <span class="badge bg-danger">Penghapusan</span>
                                        @else
                                            <span class="badge bg-secondary">{{ $item->aksi }}</span>
                                        @endif
                                    </td>
                                    
                                    <td><small>{{ $item->keterangan }}</small></td>
                                    
                                    @if(auth()->user()->id_peran == 1)
                                    <td class="text-center">
                                        <form action="{{ route('riwayat_aset.destroy', $item->id) }}" method="POST">
                                            @csrf 
                                            @method('DELETE')
                                            <button type="submit" class="btn btn-sm btn-danger" onclick="return confirm('Yakin ingin menghapus jejak riwayat ini selamanya? Tindakan ini tidak bisa dibatalkan.')">
                                                Hapus
                                            </button>
                                        </form>
                                    </td>
                                    @endif
                                </tr>
                            @empty
                                <tr>
                                    <td colspan="7" class="text-center text-muted py-4">Sistem belum mencatat aktivitas apa pun.</td>
                                </tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>

            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>