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
            font-size: 12px;
        }
        .header {
            text-align: center;
            margin-bottom: 20px;
            border-bottom: 2px solid #000;
            padding-bottom: 10px;
        }
        .header h2, .header h3 {
            margin: 0;
            padding: 0;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }
        table, th, td {
            border: 1px solid black;
        }
        th, td {
            padding: 8px;
            text-align: left;
        }
        th {
            background-color: #f2f2f2;
            text-align: center;
        }
        .text-center {
            text-align: center;
        }
    </style>
</head>
<body>

    <div class="header">
        <h2>SISTEM MANAJEMEN ASET</h2>
        <h3>Laporan Daftar Inventaris Keseluruhan</h3>
        <p>Tanggal Cetak: {{ \Carbon\Carbon::now()->format('d F Y') }}</p>
    </div>

    <table>
        <thead>
            <tr>
                <th width="5%">No</th>
                <th width="15%">Kode Inventaris</th>
                <th width="20%">Nama Aset</th>
                <th width="15%">Jenis</th>
                <th width="15%">Lokasi</th>
                <th width="10%">Jumlah</th>
                <th width="10%">Kondisi</th>
            </tr>
        </thead>
        <tbody>
            @foreach($asets as $index => $item)
            <tr>
                <td class="text-center">{{ $index + 1 }}</td>
                <td>{{ $item->kode_inventaris }}</td>
                <td>{{ $item->nama_aset }}</td>
                <td>{{ $item->jenis_aset }}</td>
                <td>{{ $item->unit }}{{ $item->ruangan ? ' - ' . $item->ruangan : '' }}</td>
                <td class="text-center">{{ $item->jumlah_aset }}</td>
                <td class="text-center">{{ $item->kondisi_aset }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

</body>
</html>