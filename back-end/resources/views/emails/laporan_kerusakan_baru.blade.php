<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Laporan Kerusakan Baru - SIMASI</title>
    <style>
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            background-color: #f8fafc;
            margin: 0;
            padding: 24px;
            color: #334155;
        }
        .container {
            background-color: #ffffff;
            border-radius: 12px;
            max-width: 600px;
            margin: 0 auto;
            box-shadow: 0 4px 12px rgba(15, 23, 42, 0.08);
            overflow: hidden;
            border: 1px solid #e2e8f0;
        }
        .header {
            background-color: #1e293b;
            padding: 24px;
            text-align: center;
        }
        .header h1 {
            color: #ffffff;
            margin: 0;
            font-size: 22px;
            font-weight: 700;
            letter-spacing: 0.5px;
        }
        .header p {
            color: #94a3b8;
            margin: 4px 0 0;
            font-size: 13px;
        }
        .body-content {
            padding: 28px 24px;
        }
        .alert-badge {
            display: inline-block;
            background-color: #fee2e2;
            color: #b91c1c;
            padding: 6px 14px;
            border-radius: 9999px;
            font-size: 12px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 16px;
        }
        .greeting {
            font-size: 16px;
            font-weight: 600;
            color: #0f172a;
            margin-bottom: 10px;
        }
        .intro-text {
            font-size: 14px;
            line-height: 1.6;
            color: #475569;
            margin-bottom: 20px;
        }
        .detail-card {
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 18px;
            margin-bottom: 24px;
        }
        .detail-row {
            display: flex;
            padding: 8px 0;
            border-bottom: 1px dashed #e2e8f0;
            font-size: 13.5px;
        }
        .detail-row:last-child {
            border-bottom: none;
            padding-bottom: 0;
        }
        .detail-label {
            width: 140px;
            font-weight: 600;
            color: #64748b;
            flex-shrink: 0;
        }
        .detail-value {
            color: #0f172a;
            font-weight: 500;
            flex-grow: 1;
        }
        .desc-box {
            margin-top: 10px;
            background-color: #ffffff;
            border: 1px solid #cbd5e1;
            border-radius: 6px;
            padding: 10px 12px;
            font-size: 13px;
            color: #1e293b;
            line-height: 1.5;
            white-space: pre-wrap;
        }
        .photo-preview {
            margin-top: 16px;
            text-align: center;
        }
        .photo-preview img {
            max-width: 100%;
            max-height: 320px;
            border-radius: 8px;
            border: 1px solid #cbd5e1;
            box-shadow: 0 2px 6px rgba(0,0,0,0.06);
        }
        .action-container {
            text-align: center;
            margin: 28px 0 16px;
        }
        .btn-action {
            display: inline-block;
            background-color: #2563eb;
            color: #ffffff !important;
            text-decoration: none;
            font-weight: 600;
            font-size: 14px;
            padding: 12px 28px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(37, 99, 235, 0.2);
        }
        .footer {
            background-color: #f1f5f9;
            padding: 16px 24px;
            text-align: center;
            font-size: 12px;
            color: #64748b;
            border-top: 1px solid #e2e8f0;
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <h1>SIMASI</h1>
            <p>Sistem Informasi Manajemen Aset Sekolah</p>
        </div>

        <!-- Body Content -->
        <div class="body-content">
            <span class="alert-badge">⚠️ Laporan Kerusakan Baru</span>

            <div class="greeting">
                Halo Bapak/Ibu {{ $petugas->nama ?? 'Petugas Perbaikan' }},
            </div>

            <p class="intro-text">
                Terdapat laporan kerusakan aset baru yang telah diajukan dan membutuhkan pemeriksaan serta penanganan lebih lanjut dari tim perbaikan.
            </p>

            <!-- Card Rincian -->
            <div class="detail-card">
                <table style="width: 100%; border-collapse: collapse; font-size: 13.5px;">
                    <tr>
                        <td style="padding: 6px 0; color: #64748b; font-weight: 600; width: 140px; vertical-align: top;">Nama Aset</td>
                        <td style="padding: 6px 0; color: #0f172a; font-weight: 700;">{{ $aset->nama_aset ?? '-' }}</td>
                    </tr>
                    @if($kodeUnit)
                    <tr>
                        <td style="padding: 6px 0; color: #64748b; font-weight: 600; vertical-align: top;">Unit Aset</td>
                        <td style="padding: 6px 0; color: #2563eb; font-weight: 700;">{{ $kodeUnit }}</td>
                    </tr>
                    @elseif($aset && $aset->kode_inventaris)
                    <tr>
                        <td style="padding: 6px 0; color: #64748b; font-weight: 600; vertical-align: top;">Kode Inventaris</td>
                        <td style="padding: 6px 0; color: #0f172a; font-weight: 600;">{{ $aset->kode_inventaris }}</td>
                    </tr>
                    @endif
                    <tr>
                        <td style="padding: 6px 0; color: #64748b; font-weight: 600; vertical-align: top;">Lokasi</td>
                        <td style="padding: 6px 0; color: #0f172a;">
                            {{ $aset->ruangan->nama_ruangan ?? '-' }}
                            @if(isset($aset->lokasiUnit) && $aset->lokasiUnit->nama_unit)
                                (Unit: {{ $aset->lokasiUnit->nama_unit }})
                            @endif
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 6px 0; color: #64748b; font-weight: 600; vertical-align: top;">Pelapor</td>
                        <td style="padding: 6px 0; color: #0f172a;">
                            <strong>{{ $laporan->nama_pelapor ?? ($pelapor->nama ?? 'Pengguna') }}</strong>
                            @if($pelapor && $pelapor->email)
                                <span style="color: #64748b; font-size: 12px;">({{ $pelapor->email }})</span>
                            @endif
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 6px 0; color: #64748b; font-weight: 600; vertical-align: top;">Waktu Pengajuan</td>
                        <td style="padding: 6px 0; color: #0f172a;">
                            {{ \Carbon\Carbon::parse($laporan->tgl_laporan ?? now())->format('d M Y, H:i') }} WIB
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 6px 0; color: #64748b; font-weight: 600; vertical-align: top;">Kategori</td>
                        <td style="padding: 6px 0; color: #0f172a;">{{ $laporan->kategori_aset ?? '-' }}</td>
                    </tr>
                </table>

                <div style="margin-top: 14px; border-top: 1px solid #e2e8f0; padding-top: 12px;">
                    <span style="font-weight: 600; color: #64748b; font-size: 13px;">Deskripsi Kerusakan:</span>
                    <div class="desc-box">{{ $laporan->deskripsi ?? 'Tidak ada deskripsi rinci.' }}</div>
                </div>

                @if(!empty($laporan->lampiran))
                    @php
                        $lampiranSrc = null;
                        try {
                            if (\Illuminate\Support\Facades\Storage::disk('public')->exists($laporan->lampiran)) {
                                $fullPath = \Illuminate\Support\Facades\Storage::disk('public')->path($laporan->lampiran);
                                if (isset($message) && is_object($message) && method_exists($message, 'embed')) {
                                    $lampiranSrc = $message->embed($fullPath);
                                }
                            }
                        } catch (\Throwable $t) {
                            $lampiranSrc = null;
                        }
                        if (!$lampiranSrc) {
                            $lampiranSrc = url('storage/' . $laporan->lampiran);
                        }
                    @endphp
                    @if($lampiranSrc)
                    <div style="margin-top: 16px; border-top: 1px solid #e2e8f0; padding-top: 12px;">
                        <span style="font-weight: 600; color: #64748b; font-size: 13px;">Foto Bukti Kerusakan:</span>
                        <div class="photo-preview">
                            <img src="{{ $lampiranSrc }}" alt="Bukti Kerusakan Aset">
                        </div>
                    </div>
                    @endif
                @endif
            </div>

            <!-- Tombol Aksi -->
            <div class="action-container">
                <a href="https://sarpras-ash.web.id/petugas-perbaikan/perbaikan-aset" class="btn-action">
                    Buka Menu Perbaikan Aset &rarr;
                </a>
            </div>

            <p style="font-size: 12.5px; color: #94a3b8; text-align: center; margin-top: 20px;">
                Silakan login ke aplikasi SIMASI untuk memvalidasi dan memproses status perbaikan aset ini.
            </p>
        </div>

        <!-- Footer -->
        <div class="footer">
            Pemberitahuan ini dikirimkan otomatis oleh sistem SIMASI ke alamat email petugas perbaikan terdaftar.
        </div>
    </div>
</body>
</html>
