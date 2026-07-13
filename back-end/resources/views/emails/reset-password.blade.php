<!DOCTYPE html>
<html>
<head>
    <title>Pemulihan Kata Sandi Akun SIMAS</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        <h2 style="color: #2563eb; text-align: center;">SIMAS (Sistem Informasi Manajemen Aset)</h2>
        <p>Halo, <strong>{{ $userNama }}</strong>,</p>
        <p>Kami menerima permintaan untuk mengatur ulang kata sandi akun SIMAS Anda. Jika Anda tidak melakukan permintaan ini, silakan abaikan email ini.</p>
        <p>Untuk mereset kata sandi Anda, silakan klik tombol di bawah ini:</p>
        <div style="text-align: center; margin: 30px 0;">
            <a href="{{ $resetUrl }}" style="background-color: #2563eb; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">Reset Kata Sandi</a>
        </div>
        <p>Atau Anda juga dapat menyalin dan menempelkan tautan berikut ke browser Anda:</p>
        <p style="word-break: break-all; color: #2563eb;"><a href="{{ $resetUrl }}">{{ $resetUrl }}</a></p>
        <br>
        <p>Terima kasih,</p>
        <p><strong>Tim Admin SIMAS</strong></p>
    </div>
</body>
</html>
