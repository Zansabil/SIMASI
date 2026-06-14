<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Kelola Pengguna</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body class="bg-light">
    <div class="container mt-5 mb-5">
        <div class="mb-3">
            <a href="{{ route('aset.index') }}" class="btn btn-secondary">⬅️ Kembali ke Dashboard</a>
        </div>

        <div class="card shadow border-0">
            <div class="card-header bg-dark text-white d-flex justify-content-between align-items-center">
                <h4 class="mb-0">Manajemen Pengguna (Super Admin)</h4>
                <a href="{{ route('pengguna.create') }}" class="btn btn-success btn-sm">➕ Tambah Pengguna</a>
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
                    <table class="table table-bordered table-striped align-middle text-center table-hover">
                        <thead class="table-dark">
                            <tr>
                                <th>No</th>
                                <th>Nama Lengkap</th>
                                <th>Username</th>
                                <th>Email</th>
                                <th>Role / Peran</th>
                                <th>Status</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            @foreach ($penggunas as $index => $user)
                                <tr>
                                    <td>{{ $index + 1 }}</td>
                                    <td class="text-start fw-bold">{{ $user->nama }}</td>
                                    <td>{{ $user->nama_pengguna }}</td>
                                    <td class="text-start">{{ $user->email }}</td>
                                    <td>
                                        @if($user->id_peran == 1) <span class="badge bg-danger">Super Admin</span>
                                        @elseif($user->id_peran == 2) <span class="badge bg-success">Kepala Yayasan</span>
                                        @elseif($user->id_peran == 3) <span class="badge bg-primary">Admin Unit</span>
                                        @elseif($user->id_peran == 4) <span class="badge bg-warning text-dark">Guru</span>
                                         @elseif($user->id_peran == 5) <span class="badge bg-warning text-dark">Petugas Perbaikan</span>
                                        @else <span class="badge bg-secondary">Guru / Staf</span>
                                        @endif
                                    </td>
                                    <td>
                                        @if($user->status_aktif == 1)
                                            <span class="badge bg-success">Aktif</span>
                                        @else
                                            <span class="badge bg-danger">Non-Aktif</span>
                                        @endif
                                    </td>
                                    
                                    <td class="d-flex justify-content-center gap-1">
                                        
                                        <form action="{{ route('pengguna.reset_password', $user->id) }}" method="POST" class="d-inline">
                                            @csrf @method('PATCH')
                                            <button type="submit" class="btn btn-sm btn-info text-white fw-bold shadow-sm" onclick="return confirm('Yakin ingin mereset password staf ini menjadi 12345678?')">🔑 Reset Sandi</button>
                                        </form>

                                        <a href="{{ route('pengguna.edit', $user->id) }}" class="btn btn-sm btn-warning shadow-sm">Ubah Peran</a>
                                        
                                        @if(auth()->user()->id != $user->id)
                                            <form action="{{ route('pengguna.destroy', $user->id) }}" method="POST" class="d-inline">
                                                @csrf @method('DELETE')
                                                <button type="submit" class="btn btn-sm btn-danger shadow-sm" onclick="return confirm('Yakin hapus pengguna ini permanen?')">Hapus</button>
                                            </form>
                                        @endif
                                        
                                    </td>
                                </tr>
                            @endforeach
                        </tbody>
                    </table>
                </div>

            </div>
        </div>
    </div>
    
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>