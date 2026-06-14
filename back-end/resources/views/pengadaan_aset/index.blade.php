<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pengajuan Pengadaan Aset</title>
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
                        <a class="nav-link text-white fw-bold" href="{{ route('pengadaan_aset.index') }}">Pengadaan Baru</a>
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
    <div class="container-fluid px-4 mb-5">
        <div class="card shadow border-0">
            <div class="card-header bg-dark text-white d-flex justify-content-between align-items-center">
                <h4 class="mb-0">Daftar Pengajuan Pengadaan Aset</h4>
                <a href="{{ route('pengadaan_aset.create') }}" class="btn btn-primary btn-sm">➕ Ajukan Barang Baru</a>
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

                <div class="table-responsive">
                    <table class="table table-bordered table-striped align-middle table-hover">
                        <thead class="table-dark text-center">
                            <tr>
                                <th>No</th>
                                <th>Pemohon</th>
                                <th>Nama Barang</th>
                                <th>Tgl Pengajuan</th>
                                <th>Lokasi</th>
                                <th>Jml</th>
                                <th>Estimasi Harga</th>
                                <th>Alasan</th>
                                <th>Status</th>
                                @can('setuju-pengadaan')
                                    <th>Persetujuan Yayasan</th>
                                @endcan
                            </tr>
                        </thead>
                        <tbody>
                            @forelse ($pengadaans as $index => $item)
                                <tr>
                                    <td class="text-center">{{ $index + 1 }}</td>
                                    <td class="fw-bold">{{ $item->pengguna ? $item->pengguna->nama : 'Pengguna Dihapus' }}</td>
                                    <td class="text-primary fw-bold">{{ $item->nama_barang }}</td>
                                    <td class="text-center">{{ \Carbon\Carbon::parse($item->tgl_pengajuan)->format('d/m/Y') }}</td>
                                    <td>{{ $item->lokasi_penempatan }}</td>
                                    <td class="text-center">{{ $item->jumlah_barang }}</td>
                                    <td class="text-end text-nowrap">Rp {{ number_format($item->harga_barang, 0, ',', '.') }}</td>
                                    <td><small>{{ $item->alasan }}</small></td>
                                    
                                    <td class="text-center text-nowrap">
                                        @if($item->status_pengajuan == 'Menunggu')
                                            <span class="badge bg-warning text-dark">⏳ Menunggu</span>
                                        @elseif($item->status_pengajuan == 'Disetujui')
                                            <span class="badge bg-success">✅ Disetujui</span>
                                        @else
                                            <span class="badge bg-danger">❌ Ditolak</span>
                                            <br><small class="text-danger fw-bold">Alasan: {{ $item->catatan_penolakan }}</small>
                                        @endif
                                    </td>
                                    
                                    @can('setuju-pengadaan')
                                    <td class="text-center">
                                        @if($item->status_pengajuan == 'Menunggu')
                                            <form action="{{ route('pengadaan_aset.setuju', $item->idpengadaan_aset) }}" method="POST" class="d-inline">
                                                @csrf @method('PATCH')
                                                <button type="submit" class="btn btn-sm btn-success mb-1" onclick="return confirm('Setujui pengadaan ini?')">Setuju</button>
                                            </form>
                                            
                                            <button type="button" class="btn btn-sm btn-outline-danger mb-1" data-bs-toggle="modal" data-bs-target="#modalTolak{{ $item->idpengadaan_aset }}">
                                                Tolak
                                            </button>

                                            <div class="modal fade text-start" id="modalTolak{{ $item->idpengadaan_aset }}" tabindex="-1" aria-hidden="true">
                                                <div class="modal-dialog">
                                                    <div class="modal-content">
                                                        <div class="modal-header bg-danger text-white">
                                                            <h5 class="modal-title">Alasan Penolakan Pengadaan</h5>
                                                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                                                        </div>
                                                        <form action="{{ route('pengadaan_aset.tolak', $item->idpengadaan_aset) }}" method="POST">
                                                            @csrf 
                                                            @method('PATCH')
                                                            <div class="modal-body">
                                                                <p>Anda akan menolak pengajuan <strong>{{ $item->nama_barang }}</strong> dari <strong>{{ $item->pengguna->nama ?? 'Staf' }}</strong>.</p>
                                                                <div class="mb-3">
                                                                    <label class="form-label fw-bold">Berikan Alasan Penolakan:</label>
                                                                    <textarea name="catatan_penolakan" class="form-control" rows="3" required placeholder="Contoh: Dana yayasan saat ini sedang dialihkan untuk keperluan lain..."></textarea>
                                                                </div>
                                                            </div>
                                                            <div class="modal-footer">
                                                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Batal</button>
                                                                <button type="submit" class="btn btn-danger">Konfirmasi Tolak</button>
                                                            </div>
                                                        </form>
                                                    </div>
                                                </div>
                                            </div>

                                        @else
                                            <span class="badge bg-light text-muted border">Selesai Diproses</span>
                                        @endif
                                    </td>
                                    @endcan
                                </tr>
                            @empty
                                <tr>
                                    <td colspan="10" class="text-center text-muted py-4">Belum ada pengajuan pengadaan aset.</td>
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