<!DOCTYPE html>
<html>
<head>
    <title>Pemberitahuan Sistem SIMASI</title>
    <style>
        body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px; }
        .container { background-color: #ffffff; padding: 20px; border-radius: 8px; max-width: 600px; margin: auto; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .header { text-align: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 15px; margin-bottom: 20px; }
        .header h2 { color: #2563eb; margin: 0; }
        .content { color: #333333; line-height: 1.6; }
        .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #888888; border-top: 1px solid #e2e8f0; padding-top: 15px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>SIMASI</h2>
            <p style="margin:0; color:#64748b;">Sistem Informasi Manajemen Aset</p>
        </div>
        
        <div class="content">
            <p>Halo <strong>{{ $nama_pengguna }}</strong>,</p>
            
            <p>Anda mendapatkan pemberitahuan baru mengenai laporan kerusakan Anda. Berikut adalah detailnya:</p>
            
            <div style="background-color: #f1f5f9; padding: 15px; border-left: 4px solid #3b82f6; margin: 20px 0;">
                <strong>Tipe:</strong> {{ $tipe }}<br>
                <strong>Pesan:</strong> {{ $pesan }}
                @if(!empty($keterangan))
                <br><br>
                <strong>Keterangan Lapangan:</strong><br>
                {{ $keterangan }}
                @endif
                @if(!empty($hasil))
                <br><br>
                <strong>Hasil Perbaikan:</strong><br>
                {{ $hasil }}
                @endif
                @if(isset($biaya) && $biaya > 0)
                <br><br>
                <strong>Total Biaya:</strong><br>
                Rp {{ number_format($biaya, 0, ',', '.') }}
                @endif
                @if(!empty($foto_perbaikan))
                    @php
                        $imgSrc = null;
                        try {
                            if (\Illuminate\Support\Facades\Storage::disk('public')->exists($foto_perbaikan)) {
                                $fullImgPath = \Illuminate\Support\Facades\Storage::disk('public')->path($foto_perbaikan);
                                if (isset($message) && is_object($message) && method_exists($message, 'embed')) {
                                    $imgSrc = $message->embed($fullImgPath);
                                }
                            }
                        } catch (\Throwable $t) {
                            $imgSrc = null;
                        }
                        if (!$imgSrc) {
                            $imgSrc = url('storage/' . $foto_perbaikan);
                        }
                    @endphp
                    @if($imgSrc)
                    <br><br>
                    <strong>Foto Hasil Perbaikan:</strong><br>
                    <div style="margin-top: 12px; text-align: center;">
                        <img src="{{ $imgSrc }}" alt="Foto Hasil Perbaikan" style="max-width: 100%; max-height: 360px; border-radius: 8px; border: 1px solid #cbd5e1; box-shadow: 0 2px 4px rgba(0,0,0,0.1); display: inline-block;">
                    </div>
                    @endif
                @endif
            </div>
            
            <p>Silakan masuk ke aplikasi SIMASI untuk melihat rincian lebih lanjut.</p>
        </div>
        
        <div class="footer">
            <p>Pesan ini dikirim secara otomatis oleh sistem SIMASI. Mohon untuk tidak membalas email ini.</p>
        </div>
    </div>
</body>
</html>
