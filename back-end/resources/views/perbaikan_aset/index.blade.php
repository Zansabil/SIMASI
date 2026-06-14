<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Data Perbaikan Aset</title>
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
                        <a class="nav-link text-white" href="{{ route('pemindahan_aset.index') }}">Pemindahan</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link text-white" href="{{ route('laporan_kerusakan.index') }}">Laporan Kerusakan</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link text-white fw-bold" href="{{ route('perbaikan_aset.index') }}">Perbaikan</a>
                    </li>
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

    <div class="container-fluid px-5 mb-5">
        <div class="card shadow">
            <div class="card-header bg-dark text-white d-flex justify-content-between align-items-center">
                <h4 class="mb-0">Riwayat Perbaikan Aset</h4>
                @if(auth()->user()->id_peran == 1)
                    <a href="{{ route('perbaikan_aset.create') }}" class="btn btn-primary btn-sm">+ Catat Perbaikan Baru</a>
                @endif
            </div>
            <div class="card-body">
                
                @if(session('success'))
                    <div class="alert alert-success">{{ session('success') }}</div>
                @endif

                <div class="table-responsive">
                    <table class="table table-bordered table-striped align-middle">
                        <thead class="table-dark text-center">
                            <tr>
                                <th>No</th>
                                <th>Nama Aset</th>
                                <th>Petugas/Teknisi</th>
                                <th>Tgl Mulai</th>
                                <th>Tgl Selesai</th>
                                <th>Status</th>
                                <th>Hasil</th>
                                <th>Biaya</th>
                                @if(auth()->user()->id_peran == 1)
                                    <th>Aksi</th>
                                @endif
                            </tr>
                        </thead>
                        <tbody>
                            @forelse ($perbaikans as $index => $item)
                                <tr>
                                    <td class="text-center">{{ $index + 1 }}</td>
                                    
                                    <td class="fw-bold text-primary">
                                        {{ $item->laporan && $item->laporan->aset ? $item->laporan->aset->nama_aset : 'Aset Tidak Ditemukan' }}
                                    </td>
                                    
                                    <td>{{ $item->petugas ? $item->petugas->nama : '-' }}</td>
                                    
                                    <td class="text-center">{{ \Carbon\Carbon::parse($item->tanggal_mulai)->format('d/m/Y') }}</td>
                                    <td class="text-center">
                                        {{ $item->tanggal_selesai ? \Carbon\Carbon::parse($item->tanggal_selesai)->format('d/m/Y') : 'Belum Selesai' }}
                                    </td>
                                    
                                    <td class="text-center">
                                        @if($item->status_perbaikan == 'Selesai')
                                            <span class="badge bg-success">Selesai</span>
                                        @elseif($item->status_perbaikan == 'Proses')
                                            <span class="badge bg-warning text-dark">Proses</span>
                                        @else
                                            <span class="badge bg-secondary">{{ $item->status_perbaikan }}</span>
                                        @endif
                                    </td>
                                    
                                    <td>{{ $item->hasil ?? '-' }}</td>
                                    <td class="text-end">Rp {{ number_format($item->biaya, 0, ',', '.') }}</td>
                                    
                                    @if(auth()->user()->id_peran == 1)
                                    <td class="text-center">
                                        <form action="{{ route('perbaikan_aset.destroy', $item->id) }}" method="POST">
                                            @csrf
                                            @method('DELETE')
                                            <button type="submit" class="btn btn-sm btn-danger" onclick="return confirm('Yakin hapus data perbaikan ini?')">Hapus</button>
                                        </form>
                                    </td>
                                    @endif
                                </tr>
                            @empty
                                <tr>
                                    <td colspan="9" class="text-center text-muted">Belum ada riwayat perbaikan aset.</td>
                                </tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>

            </div>
        </div>
    </div>

</body>
</html>