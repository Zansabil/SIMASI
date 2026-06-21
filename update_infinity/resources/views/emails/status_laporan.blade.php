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
            </div>
            
            <p>Silakan masuk ke aplikasi SIMASI untuk melihat rincian lebih lanjut.</p>
        </div>
        
        <div class="footer">
            <p>Pesan ini dikirim secara otomatis oleh sistem SIMASI. Mohon untuk tidak membalas email ini.</p>
        </div>
    </div>
</body>
</html>
