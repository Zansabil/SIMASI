<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Data Laporan Kerusakan</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<form action="{{ route('logout') }}" method="POST" style="margin-bottom: 20px;">
    @csrf
    <button type="submit" class="btn btn-sm btn-danger">Tes Logout</button>
</form>
<body>
    <div class="container-fluid mt-5 px-4">
        <div class="row">
            <div class="col-md-12">
                <div class="mb-3">
                    <a href="{{ route('aset.index') }}" class="btn btn-secondary">Kembali ke Data Aset</a>
                </div>

                <div class="card">
                    <div class="card-header bg-danger text-white">
                        <h4 class="mb-0">Daftar Laporan Kerusakan Aset</h4>
                    </div>
                    <div class="card-body">
                        <a href="{{ route('laporan_kerusakan.create') }}" class="btn btn-primary mb-3">Buat Laporan Baru</a>

                        @if (session('success'))
                            <div class="alert alert-success">{{ session('success') }}</div>
                        @endif

                        <div class="table-responsive">
                            <table class="table table-bordered table-striped table-hover align-middle">
                                <thead class="table-light">
                                    <tr>
                                        <th>No</th>
                                        <th>Nama Aset</th>
                                        <th>Kategori</th>
                                        <th>Pelapor</th>
                                        <th>Deskripsi</th>
                                        <th>Tgl Lapor</th>
                                        <th>Status</th>
                                        <th>Validator</th>
                                        <th>Tgl Validasi</th>
                                        <th>Lampiran</th>
                                       @if(auth()->user()->id_peran == 1)
    <th>Aksi</th>
@endif
                                    </tr>
                                </thead>
                                <tbody>
                                    @forelse ($laporans as $index => $item)
                                        <tr>
                                            <td>{{ $index + 1 }}</td>
                                            
                                            <td>{{ $item->aset->nama_aset ?? 'Aset Dihapus' }}</td>
                                            <td>{{ $item->kategori_aset }}</td>
                                            
                                            <td>{{ $item->pelapor->nama ?? 'Pengguna Tidak Ditemukan' }}</td>
                                            
                                            <td>{{ $item->deskripsi }}</td>
                                            <td>{{ \Carbon\Carbon::parse($item->tgl_laporan)->translatedFormat('d F Y') }}</td>
                                            
                                            <td>
                                                @if($item->status_kerusakan == 'Menunggu')
                                                    <span class="badge bg-warning text-dark">{{ $item->status_kerusakan }}</span>
                                                @elseif($item->status_kerusakan == 'Diproses')
                                                    <span class="badge bg-info text-dark">{{ $item->status_kerusakan }}</span>
                                                @else
                                                    <span class="badge bg-success">{{ $item->status_kerusakan }}</span>
                                                @endif
                                            </td>

                                            <td>{{ $item->validator ? $item->validator->nama : '-' }}</td>
                                            <td>{{ $item->tgl_validasi ?? '-' }}</td>
                                            
                                            <td class="text-center">
                                                @if($item->lampiran)
                                                    <a href="{{ asset('storage/' . $item->lampiran) }}" target="_blank">
                                                        <img src="{{ asset('storage/' . $item->lampiran) }}" alt="Lampiran" class="img-thumbnail" style="max-width: 80px;">
                                                    </a>
                                                @else
                                                    <span class="text-muted">Tidak ada</span>
                                                @endif
                                            </td>
                                            @if(auth()->user()->id_peran == 1)
    <td>
        <form action="{{ route('laporan_kerusakan.destroy', $item->id) }}" method="POST">
            <a href="{{ route('laporan_kerusakan.edit', $item->id) }}" class="btn btn-sm btn-warning mb-1">Edit</a>
            @csrf
            @method('DELETE')
            <button type="submit" class="btn btn-sm btn-danger mb-1" onclick="return confirm('Yakin hapus?')">Hapus</button>
        </form>
    </td>
@endif
               <td class="text-center align-middle">
    @if($item->status_kerusakan == 'Menunggu' || $item->status_kerusakan == 'Menunggu Validasi')
        
        @if(auth()->user()->id_peran == 1 || auth()->user()->id_peran == 3)
            
            <div class="d-flex justify-content-center gap-2">
                <form action="{{ route('laporan_kerusakan.validasi', $item->id) }}" method="POST">
                    @csrf
                    @method('PATCH')
                    <button type="submit" class="btn btn-sm btn-success" onclick="return confirm('Yakin ingin menyetujui laporan ini?')">
                        ✔ Setujui
                    </button>
                </form>

                <button type="button" class="btn btn-sm btn-danger" data-bs-toggle="modal" data-bs-target="#modalTolak{{ $item->id }}">
                    ✖ Tolak
                </button>
            </div>

            <div class="modal fade text-start" id="modalTolak{{ $item->id }}" tabindex="-1" aria-hidden="true">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header bg-danger text-white">
                            <h5 class="modal-title">Alasan Penolakan Laporan</h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <form action="{{ route('laporan_kerusakan.tolak', $item->id) }}" method="POST">
                            @csrf
                            @method('PATCH')
                            <div class="modal-body">
                                <p class="mb-2">Silakan berikan alasan mengapa laporan ini ditolak:</p>
                                <textarea name="alasan_penolakan" class="form-control" rows="3" required placeholder="Contoh: Dana perbaikan sedang dialihkan..."></textarea>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Batal</button>
                                <button type="submit" class="btn btn-danger">Konfirmasi Penolakan</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

        @endif
        
    @else
        @if($item->status_kerusakan == 'Ditolak')
            <span class="badge bg-danger mb-1">Ditolak</span>
            <div class="small text-muted text-start" style="max-width: 200px; margin: 0 auto;">
                <strong>Alasan:</strong> {{ $item->alasan_penolakan }}
            </div>
        @else
            <span class="badge bg-primary">{{ $item->status_kerusakan }}</span>
        @endif
    @endif
</td>
                                    @empty
                                        <tr>
                                            <td colspan="11" class="text-center text-danger">Belum ada data laporan kerusakan.</td>
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
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>