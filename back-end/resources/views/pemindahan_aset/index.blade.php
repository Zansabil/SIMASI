<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Data Pemindahan Aset</title>
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
                        <a class="nav-link text-white fw-bold" href="{{ route('pemindahan_aset.index') }}">Pemindahan</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link text-white" href="{{ route('laporan_kerusakan.index') }}">Laporan Kerusakan</a>
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

    <div class="container mb-5">
        <div class="card shadow">
            <div class="card-header bg-dark text-white d-flex justify-content-between align-items-center">
                <h4 class="mb-0">Riwayat Pemindahan Aset</h4>
                @if(auth()->user()->id_peran == 1)
                    <a href="{{ route('pemindahan_aset.create') }}" class="btn btn-success btn-sm">+ Catat Pemindahan Baru</a>
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
                                <th>Lokasi Awal</th>
                                <th>Lokasi Baru</th>
                                <th>Tanggal Pindah</th>
                                <th>Staf Pencatat</th> <th>Alasan</th>
                                <th>Status</th>
                                @if(auth()->user()->id_peran == 1)
                                    <th>Aksi</th>
                                @endif
                            </tr>
                        </thead>
                        <tbody>
                            @forelse ($pemindahans as $index => $item)
                                <tr>
                                    <td class="text-center">{{ $index + 1 }}</td>
                                    
                                    <td class="fw-bold text-primary">{{ $item->aset ? $item->aset->nama_aset : 'Aset Tidak Ditemukan' }}</td>
                                    
                                    <td>{{ $item->lokasi_sebelumnya }}</td>
                                    <td>
                                        <span class="badge bg-info text-dark">{{ $item->lokasi_baru }}</span>
                                    </td>
                                    <td class="text-center">{{ \Carbon\Carbon::parse($item->tgl_pindah)->format('d/m/Y') }}</td>
                                    
                                    <td class="text-center">
                                        @if($item->pengguna)
                                            <span class="fw-bold text-secondary">{{ $item->pengguna->nama }}</span>
                                        @else
                                            <span class="text-muted small">Tidak terdata</span>
                                        @endif
                                    </td>

                                    <td>{{ $item->alasan_pemindahan }}</td>
                                    <td class="text-center">{{ $item->status_aset }}</td>
                                    
                                    @if(auth()->user()->id_peran == 1)
                                    <td class="text-center">
                                        <form action="{{ route('pemindahan_aset.destroy', $item->id) }}" method="POST">
                                            @csrf
                                            @method('DELETE')
                                            <button type="submit" class="btn btn-sm btn-danger" onclick="return confirm('Yakin hapus riwayat pemindahan ini?')">Hapus</button>
                                        </form>
                                    </td>
                                    @endif
                                </tr>
                            @empty
                                <tr>
                                    <td colspan="9" class="text-center text-muted">Belum ada riwayat pemindahan aset.</td>
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