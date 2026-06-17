<?php
// Set execution time to 5 minutes as vendor extraction might take a bit of time
ini_set('max_execution_time', 300);
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
    <title>SIMASI Auto-Deployment</title>
    <style>
        body { background: #0f172a; color: #cbd5e1; font-family: sans-serif; padding: 30px; max-width: 800px; margin: 0 auto; }
        h2 { color: #f8fafc; border-bottom: 1px solid #334155; padding-bottom: 10px; }
        .log-box { background: #020617; border: 1px solid #1e293b; padding: 15px; border-radius: 8px; margin-top: 20px; max-height: 400px; overflow-y: auto; }
        .btn { background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; display: inline-block; margin-top: 20px; font-weight: bold; transition: background 0.2s; }
        .btn:hover { background: #1d4ed8; }
    </style>
</head>
<body>
    <h2>SIMASI Automatic Deployment Installer</h2>
    <p>Ekstraksi file sedang berjalan. Mohon tunggu beberapa saat...</p>
    <div class='log-box'>";

// Create laravel directory if it doesn't exist
$laravel_dir = __DIR__ . '/laravel';
if (!file_exists($laravel_dir)) {
    mkdir($laravel_dir, 0755, true);
}

$zip_files = [
    'laravel_core.zip' => $laravel_dir,
    'vendor_part1.zip' => $laravel_dir,
    'vendor_part2.zip' => $laravel_dir,
    'htdocs.zip' => __DIR__
];

$extracted_files = [];
$failed_files = [];
$any_found = false;

// Backup .env if laravel_core.zip is present and an existing .env exists
$env_file = $laravel_dir . '/.env';
$env_backup = null;
if (file_exists(__DIR__ . '/laravel_core.zip') && file_exists($env_file)) {
    log_message("Mendeteksi file laravel_core.zip dan file .env yang sudah ada. Membuat cadangan .env...", 'info');
    $env_backup = file_get_contents($env_file);
}

foreach ($zip_files as $zip_name => $dest) {
    $zip_path = __DIR__ . '/' . $zip_name;
    if (!file_exists($zip_path)) {
        log_message("Info: File $zip_name tidak diunggah, melewati ekstraksi untuk file ini.", 'info');
        continue;
    }
    
    $any_found = true;
    log_message("Mengekstrak $zip_name ke " . realpath($dest) . "...");
    
    $zip = new ZipArchive;
    if ($zip->open($zip_path) === TRUE) {
        if ($zip->extractTo($dest)) {
            log_message("Berhasil mengekstrak $zip_name.", 'success');
            $extracted_files[] = $zip_name;
        } else {
            log_message("Gagal mengekstrak $zip_name.", 'error');
            $failed_files[] = $zip_name;
        }
        $zip->close();
    } else {
        log_message("Gagal membuka file $zip_name.", 'error');
        $failed_files[] = $zip_name;
    }
}

// Restore .env if backup was made
if ($env_backup !== null) {
    if (file_put_contents($env_file, $env_backup) !== false) {
        log_message("Cadangan konfigurasi .env berhasil dipulihkan.", 'success');
    } else {
        log_message("Gagal memulihkan cadangan .env! Harap periksa file .env Anda.", 'error');
    }
}

if (!$any_found) {
    log_message("Error: Tidak ada file ZIP yang ditemukan di folder /htdocs/ untuk diekstrak.", 'error');
    echo "</div>";
} elseif (count($failed_files) > 0) {
    log_message("Ekstraksi selesai dengan beberapa kegagalan. Membersihkan file yang berhasil diekstrak...", 'warning');
    foreach ($extracted_files as $zip_name) {
        @unlink(__DIR__ . '/' . $zip_name);
    }
    echo "</div>";
} else {
    log_message("Semua file ZIP yang diunggah berhasil diekstrak! Membersihkan file arsip...", 'success');
    foreach ($extracted_files as $zip_name) {
        @unlink(__DIR__ . '/' . $zip_name);
    }
    log_message("Pembersihan arsip selesai. Menghapus skrip unzip_all.php...", 'success');
    
    // Self-delete
    @unlink(__FILE__);
    
    log_message("Instalasi selesai dengan sukses! Halaman ini telah menghapus dirinya sendiri demi keamanan.", 'success');
    echo "</div>";
    echo "<br><a href='/' class='btn'>Masuk ke Website</a>";
}

echo "</body>
</html>";
