<?php
header('Content-Type: text/html; charset=utf-8');

function log_message($msg, $status = 'info') {
    $color = '#3b82f6';
    if ($status === 'success') $color = '#10b981';
    if ($status === 'error') $color = '#ef4444';
    echo "<p style='color: $color; font-family: monospace; margin: 4px 0;'>[" . date('H:i:s') . "] " . htmlspecialchars($msg) . "</p>";
    flush();
    ob_flush();
}

echo "<!DOCTYPE html>
<html>
<head>
    <title>SIMASI Environment Configurator</title>
    <style>
        body { background: #0f172a; color: #cbd5e1; font-family: sans-serif; padding: 30px; max-width: 800px; margin: 0 auto; }
        h2 { color: #f8fafc; border-bottom: 1px solid #334155; padding-bottom: 10px; }
        .log-box { background: #020617; border: 1px solid #1e293b; padding: 15px; border-radius: 8px; margin-top: 20px; }
        .btn { background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; display: inline-block; margin-top: 20px; font-weight: bold; }
    </style>
</head>
<body>
    <h2>SIMASI Production Environment Configurator</h2>
    <div class='log-box' style='padding: 15px;'>";

$envPath = __DIR__ . '/laravel/.env';

if (!file_exists($envPath)) {
    log_message("Error: File .env tidak ditemukan di $envPath. Harap pastikan core Laravel sudah diekstrak.", 'error');
    echo "</div></body></html>";
    exit;
}

log_message("Membaca file .env...");
$content = file_get_contents($envPath);

// Target credentials for InfinityFree
$replacements = [
    'APP_ENV' => 'production',
    'APP_DEBUG' => 'false',
    'APP_URL' => 'http://simasi-ash-shiddiqi.infy.click',
    'DB_HOST' => 'sql112.infinityfree.com',
    'DB_DATABASE' => 'if0_42193632_manajemen_asset',
    'DB_USERNAME' => 'if0_42193632',
    'DB_PASSWORD' => 'hqS3fKQ6iDz',
];

log_message("Mengupdate nilai konfigurasi .env untuk produksi...");
foreach ($replacements as $key => $value) {
    // Check if key exists in env
    if (preg_match("/^" . preg_quote($key, '/') . "=.*/m", $content)) {
        $content = preg_replace("/^" . preg_quote($key, '/') . "=.*/m", "{$key}={$value}", $content);
    } else {
        // If not exists, append to the end
        $content .= "\n{$key}={$value}";
    }
}

if (file_put_contents($envPath, $content) !== false) {
    log_message("File .env berhasil diperbarui dengan kredensial produksi.", 'success');
} else {
    log_message("Gagal memperbarui file .env! Periksa izin tulis file.", 'error');
    echo "</div></body></html>";
    exit;
}

// Test database connection with new credentials
log_message("Menguji koneksi database baru...");
try {
    $dsn = "mysql:host={$replacements['DB_HOST']};dbname={$replacements['DB_DATABASE']};port=3306;charset=utf8mb4";
    $options = [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_TIMEOUT            => 5,
    ];
    $pdo = new PDO($dsn, $replacements['DB_USERNAME'], $replacements['DB_PASSWORD'], $options);
    log_message("Koneksi database ke InfinityFree BERHASIL!", 'success');
} catch (PDOException $e) {
    log_message("Koneksi database GAGAL: " . $e->getMessage(), 'error');
    log_message("Harap pastikan database '{$replacements['DB_DATABASE']}' sudah dibuat di control panel InfinityFree dan file SQL sudah diimpor.", 'error');
}

// Self delete
log_message("Menghapus skrip konfigurasi setup_env.php demi keamanan...");
@unlink(__FILE__);
log_message("Selesai! Konfigurasi berhasil diterapkan.", 'success');

echo "</div>";
echo "<br><a href='/' class='btn'>Masuk ke Website</a>";
echo "</body></html>";
