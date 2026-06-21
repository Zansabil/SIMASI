<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Manajemen Aset As-Sidiqi</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body class="bg-light">
    
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary mb-4 shadow">
        <div class="container">
            <a class="navbar-brand fw-bold" href="{{ route('dashboard.index') }}">Sistem Manajemen Aset</a>
            <div class="collapse navbar-collapse">
                <ul class="navbar-nav me-auto">
                    <li class="nav-item">
                        <a class="nav-link text-white fw-bold" href="{{ route('aset.index') }}">Data Aset</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link text-white" href="{{ route('pengadaan_aset.index') }}">Pengadaan Baru</a>
                    </li>
                    @if(auth()->user()->id_peran == 1)
                        <li class="nav-item"><a class="nav-link text-warning fw-bold" href="{{ route('riwayat_aset.index') }}">Log Riwayat</a></li>
                    @endif
                </ul>
                
                <div class="d-flex align-items-center">
                    
                    @php
                        $notifikasiBelumDibaca = \App\Models\notifikasi::where('id_pengguna', auth()->user()->id)
                                                ->where('terbaca', 0)
                                                ->orderBy('waktu_terkirim', 'desc')
                                                ->get();
                        $jumlahNotif = $notifikasiBelumDibaca->count();
                    @endphp

                    <div class="nav-item dropdown me-4">
                        <a class="nav-link dropdown-toggle text-white position-relative" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                            🔔 
                            @if($jumlahNotif > 0)
                                <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger border border-light">
                                    {{ $jumlahNotif }}
                                </span>
                            @endif
                        </a>
                        
                        <ul class="dropdown-menu dropdown-menu-end shadow-lg" style="width: 320px; max-height: 400px; overflow-y: auto;">
                            <li><h6 class="dropdown-header fw-bold bg-light">Notifikasi Baru ({{ $jumlahNotif }})</h6></li>
                            
                            @if($jumlahNotif > 0)
                                <li>
                                    <form action="{{ route('notifikasi.baca_semua') }}" method="POST" class="px-2 mb-1 mt-1">
                                        @csrf
                                        <button type="submit" class="btn btn-sm btn-outline-primary w-100" style="font-size: 12px;">✔️ Tandai Semua Dibaca</button>
                                    </form>
                                </li>
                                <li><hr class="dropdown-divider"></li>
                                
                                @foreach($notifikasiBelumDibaca as $notif)
                                    <li>
                                        <form action="{{ route('notifikasi.baca', $notif->id) }}" method="POST">
                                            @csrf @method('PATCH')
                                            <button type="submit" class="dropdown-item text-wrap border-bottom py-2" style="font-size: 13px;">
                                                <div class="d-flex justify-content-between">
                                                    <strong class="text-primary">{{ $notif->tipe }}</strong>
                                                    <small class="text-muted" style="font-size: 10px;">{{ \Carbon\Carbon::parse($notif->waktu_terkirim)->diffForHumans() }}</small>
                                                </div>
                                                <span class="d-block mt-1">{{ $notif->pesan }}</span>
                                            </button>
                                        </form>
                                    </li>
                                @endforeach
                            @else
                                <li><span class="dropdown-item text-muted text-center py-3" style="font-size: 13px;">Tidak ada notifikasi baru.</span></li>
                            @endif
                        </ul>
                    </div>
                    <span class="text-white me-3 fw-bold">👤 Halo, {{ auth()->user()->nama }}</span>
                    <form action="{{ route('logout') }}" method="POST" class="m-0">
                        @csrf
                        <button type="submit" class="btn btn-sm btn-danger fw-bold shadow-sm">🚪 Logout</button>
                    </form>
                </div>
            </div>
        </div>
    </nav>
    <div class="container mt-4 mb-5">
        <div class="row">
            <div class="col-md-12">
                <div class="card shadow-sm border-0">
                    <div class="card-header bg-success text-white">
                        <h4 class="mb-0">Data Manajemen Aset As-Sidiqi</h4>
                    </div>
                    
                    <div class="card-body">
                        <div class="mb-3 d-flex gap-2 flex-wrap">
                            @can('kelola-aset')
                                <a href="{{ route('aset.create') }}" class="btn btn-primary">➕ Tambah Aset Baru</a>
                                <a href="{{ route('aset.cetak') }}" target="_blank" class="btn btn-danger">📄 Cetak PDF</a>
                                <a href="{{ route('aset.excel') }}" class="btn btn-success">📊 Export Excel</a>
                            @endcan
                            
                            @can('kelola-user')
                                <a href="{{ route('pengguna.index') }}" class="btn btn-dark">⚙️ Kelola Pengguna</a>
                            @endcan
                        </div>

                        @if (session('success'))
                            <div class="alert alert-success alert-dismissible fade show">
                                {{ session('success') }}
                                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                            </div>
                        @endif

                        <div class="row mb-3">
                            <div class="col-md-6">
                                <div class="input-group shadow-sm">
                                    <span class="input-group-text bg-primary text-white">🔍</span>
                                    <input type="text" id="liveSearch" class="form-control border-primary" placeholder="Ketik nama, kode, atau jenis aset di sini...">
                                </div>
                            </div>
                        </div>

                        <div class="table-responsive">
                            <table class="table table-bordered table-striped table-hover align-middle">
                                <thead class="table-dark text-center">
                                    <tr>
                                        <th>No</th>
                                        <th>Kode Inventaris</th>
                                        <th>Nama Aset</th>
                                        <th>Jenis</th>
                                        <th>Lokasi</th>
                                        <th>Jumlah</th>
                                        <th>Kondisi</th>
                                        <th>Tgl Diperoleh</th>
                                        <th>Aksi</th>
                                        <th>Penanggung Jawab</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    @forelse ($asets as $index => $item)
                                        <tr>
                                            <td class="text-center">{{ $index + 1 }}</td>
                                            <td>{{ $item->kode_inventaris }}</td>
                                            <td class="fw-bold">{{ $item->nama_aset }}</td>
                                            <td>{{ $item->jenis_aset }}</td>
                                            <td>{{ $item->lokasi_aset }}</td>
                                            <td class="text-center">{{ $item->jumlah_aset }}</td>
                                            <td class="text-center">{{ $item->kondisi_aset }}</td>
                                            <td>{{ \Carbon\Carbon::parse($item->tgl_diperoleh)->format('d/m/Y') }}</td>
                                            <td class="text-center">
                                                <form action="{{ route('aset.destroy', $item->id) }}" method="POST" class="d-inline">
                                                    
                                                    <a href="{{ route('aset.show', $item->id) }}" class="btn btn-sm btn-info text-white mb-1">Detail</a>

                                                    @can('kelola-aset')
                                                        <a href="{{ route('aset.edit', $item->id) }}" class="btn btn-sm btn-warning mb-1">Edit</a>
                                                        @csrf
                                                        @method('DELETE')
                                                        <button type="submit" class="btn btn-sm btn-danger mb-1" onclick="return confirm('Yakin hapus aset ini beserta seluruh riwayatnya?')">Hapus</button>
                                                    @endcan
                                                </form>
                                            </td>
                                            <td>
    @if($item->pengguna)
        <span class="badge bg-primary">{{ $item->pengguna->nama }}</span>
    @else
        <span class="text-muted italic">Belum Ada</span>
    @endif
</td>
                                        </tr>
                                    @empty
                                        <tr>
                                            <td colspan="9" class="text-center text-danger fw-bold py-4">Data Aset Belum Tersedia.</td>
                                        </tr>
                                    @endforelse
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script>
        document.getElementById('liveSearch').addEventListener('keyup', function() {
            let keyword = this.value.toLowerCase();
            let tableRows = document.querySelectorAll('tbody tr');

            tableRows.forEach(function(row) {
                // Ambil teks dari semua kolom (kecuali No)
                let tdKode  = row.cells[1] ? row.cells[1].textContent.toLowerCase() : '';
                let tdNama  = row.cells[2] ? row.cells[2].textContent.toLowerCase() : '';
                let tdJenis = row.cells[3] ? row.cells[3].textContent.toLowerCase() : '';
                let tdLokasi  = row.cells[4] ? row.cells[4].textContent.toLowerCase() : '';
                let tdJumlah  = row.cells[5] ? row.cells[5].textContent.toLowerCase() : '';
                let tdKondisi = row.cells[6] ? row.cells[6].textContent.toLowerCase() : '';
                
                let textYangBolehDicari = tdKode + " " + tdNama + " " + tdJenis + " " + tdLokasi + " " + tdJumlah + " " + tdKondisi;
                
                if(textYangBolehDicari.includes(keyword)) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            });
        });
    </script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>