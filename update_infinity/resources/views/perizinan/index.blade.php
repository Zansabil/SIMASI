<table class="table table-bordered table-striped align-middle">
    <thead class="table-dark text-center">
        <tr>
            <th>No</th>
            <th>Nama Aset Diajukan</th>
            <th>Keterangan Pengadaan</th>
            <th>Status Persetujuan</th>
            @if(auth()->user()->id_peran == 1) <th>Tindakan Kepala Yayasan</th>
            @endif
        </tr>
    </thead>
    <tbody>
        @foreach ($perizinans as $index => $item)
            <tr>
                <td class="text-center">{{ $index + 1 }}</td>
                <td class="fw-bold">{{ $item->nama }}</td>
                <td>{{ $item->deskripsi }}</td>
                <td class="text-center">
                    @if($item->aksi == 'Menunggu')
                        <span class="badge bg-warning text-dark">⏳ Menunggu</span>
                    @elseif($item->aksi == 'Disetujui')
                        <span class="badge bg-success">✅ Disetujui</span>
                    @else
                        <span class="badge bg-danger">❌ Ditolak</span>
                    @endif
                </td>
                
                @if(auth()->user()->id_peran == 1)
                <td class="text-center">
                    @if($item->aksi == 'Menunggu')
                        <form action="{{ route('perizinan.setuju', $item->id) }}" method="POST" class="d-inline">
                            @csrf @method('PATCH')
                            <button type="submit" class="btn btn-sm btn-success">Setujui</button>
                        </form>
                        
                        <form action="{{ route('perizinan.tolak', $item->id) }}" method="POST" class="d-inline">
                            @csrf @method('PATCH')
                            <button type="submit" class="btn btn-sm btn-outline-danger">Tolak</button>
                        </form>
                    @else
                        <small class="text-muted">Sudah diproses</small>
                    @endif
                </td>
                @endif
            </tr>
        @endforeach
    </tbody>
</table>