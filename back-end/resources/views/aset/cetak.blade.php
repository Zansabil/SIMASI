<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Laporan Data Aset</title>
    <style>
        /* Gaya CSS khusus untuk cetak kertas */
        body {
            font-family: Arial, sans-serif;
            font-size: 11px;
            color: #1e293b;
        }
        .header {
            text-align: center;
            margin-bottom: 16px;
            border-bottom: 2px solid #0f172a;
            padding-bottom: 10px;
        }
        .header h2 {
            margin: 0 0 4px 0;
            padding: 0;
            font-size: 16px;
        }
        .header h3 {
            margin: 0 0 6px 0;
            padding: 0;
            font-size: 13px;
            font-weight: normal;
        }
        .meta-info {
            width: 100%;
            margin-bottom: 12px;
            border: none;
        }
        .meta-info td {
            border: none;
            padding: 2px 4px;
            font-size: 11px;
        }
        table.data-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 6px;
        }
        table.data-table, table.data-table th, table.data-table td {
            border: 1px solid #334155;
        }
        table.data-table th, table.data-table td {
            padding: 6px 8px;
            text-align: left;
        }
        table.data-table th {
            background-color: #f1f5f9;
            text-align: center;
            font-weight: bold;
        }
        .text-center {
            text-align: center !important;
        }
        .text-right {
            text-align: right !important;
        }
        .empty-row {
            text-align: center;
            padding: 16px;
            font-style: italic;
            color: #64748b;
        }
    </style>
</head>
<body>

    <div class="header">
        <h2>SISTEM INFORMASI MANAJEMEN ASET SEKOLAH (SIMAS)</h2>
        <h3>
            @if(!empty($filterRuanganLabel))
                Daftar Inventaris Aset Ruangan: <strong>{{ $filterRuanganLabel }}</strong>{{ !empty($filterUnitLabel) ? ' — Unit ' . $filterUnitLabel : '' }}
            @elseif(!empty($filterUnitLabel))
                Laporan Daftar Inventaris Aset Unit Pendidikan: <strong>{{ $filterUnitLabel }}</strong>
            @else
                Laporan Daftar Inventaris Aset Keseluruhan
            @endif
        </h3>
    </div>

    <table class="meta-info">
        <tr>
            <td width="15%"><strong>Unit Pendidikan</strong></td>
            <td width="35%">: {{ $filterUnitLabel ?? 'Semua Unit Pendidikan' }}</td>
            <td width="15%"><strong>Periode Data</strong></td>
            <td width="35%">: {{ $periodeLabel ?? 'Semua Waktu' }}</td>
        </tr>
        <tr>
            <td><strong>Ruangan</strong></td>
            <td>: {{ $filterRuanganLabel ?? 'Semua Ruangan' }}</td>
            <td><strong>Tanggal Cetak</strong></td>
            <td>: {{ \Carbon\Carbon::now()->format('d-m-Y H:i') }} WIB</td>
        </tr>
    </table>

    <table class="data-table">
        <thead>
            <tr>
                <th width="3%">No</th>
                <th width="13%">Kode Inventaris</th>
                <th width="16%">Nama Aset</th>
                <th width="11%">Kategori</th>
                <th width="7%">Unit</th>
                <th width="12%">Ruangan</th>
                <th width="5%">Jumlah</th>
                <th width="8%">Kondisi</th>
                <th width="8%">Tgl Perolehan</th>
                <th width="8%">Sumber Dana</th>
                <th width="9%">Harga Barang</th>
            </tr>
        </thead>
        <tbody>
            @forelse($asets as $index => $item)
            <tr>
                <td class="text-center">{{ $index + 1 }}</td>
                <td>{{ $item->kode_inventaris }}</td>
                <td>{{ $item->nama_aset }}</td>
                <td>{{ $item->jenis_aset }}</td>
                <td class="text-center">{{ $item->lokasiUnit->nama_unit ?? '-' }}</td>
                <td>{{ $item->ruangan->nama_ruangan ?? '-' }}</td>
                <td class="text-center">{{ $item->jumlah_aset }}</td>
                <td class="text-center">{{ ucfirst($item->kondisi_aset) }}</td>
                <td class="text-center">{{ $item->tgl_diperoleh ? \Carbon\Carbon::parse($item->tgl_diperoleh)->format('d-m-Y') : '-' }}</td>
                <td class="text-center">{{ !empty($item->sumber_dana) ? $item->sumber_dana : '-' }}</td>
                <td class="text-right">{{ ($item->harga_aset && (int) $item->harga_aset > 0) ? 'Rp ' . number_format((int) $item->harga_aset, 0, ',', '.') : '-' }}</td>
            </tr>
            @empty
            <tr>
                <td colspan="11" class="empty-row">Tidak ada data aset untuk filter yang dipilih.</td>
            </tr>
            @endforelse
        </tbody>
    </table>

</body>
</html>