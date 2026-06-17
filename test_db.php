<?php
header('Content-Type: text/html; charset=utf-8');
echo "<!DOCTYPE html>
<html>
<head>
    <title>SIMASI DB Diagnostics</title>
    <style>
        body { background: #0f172a; color: #cbd5e1; font-family: sans-serif; padding: 30px; max-width: 800px; margin: 0 auto; }
        h2 { color: #f8fafc; border-bottom: 1px solid #334155; padding-bottom: 10px; }
        .box { background: #020617; border: 1px solid #1e293b; padding: 15px; border-radius: 8px; margin-top: 20px; font-family: monospace; }
        .success { color: #10b981; font-weight: bold; }
        .error { color: #ef4444; font-weight: bold; }
        .warning { color: #f59e0b; font-weight: bold; }
    </style>
</head>
<body>
    <h2>SIMASI Database Connection Diagnostics</h2>";

$envPath = __DIR__ . '/laravel/.env';
if (!file_exists($envPath)) {
    echo "<p class='error'>❌ File .env tidak ditemukan di: $envPath</p>";
    echo "</body></html>";
    exit;
}

echo "<p class='success'>✅ File .env ditemukan.</p>";

// Parse .env manually
$config = [];
$lines = file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
foreach ($lines as $line) {
    if (strpos(trim($line), '#') === 0) continue;
    $parts = explode('=', $line, 2);
    if (count($parts) === 2) {
        $config[trim($parts[0])] = trim($parts[1]);
    }
}

$db_host = isset($config['DB_HOST']) ? $config['DB_HOST'] : '';
$db_name = isset($config['DB_DATABASE']) ? $config['DB_DATABASE'] : '';
$db_user = isset($config['DB_USERNAME']) ? $config['DB_USERNAME'] : '';
$db_pass = isset($config['DB_PASSWORD']) ? $config['DB_PASSWORD'] : '';

echo "<div class='box'>";
echo "<strong>Membaca kredensial dari .env:</strong><br>";
echo "DB_HOST: " . htmlspecialchars($db_host) . "<br>";
echo "DB_DATABASE: " . htmlspecialchars($db_name) . "<br>";
echo "DB_USERNAME: " . htmlspecialchars($db_user) . "<br>";
echo "DB_PASSWORD: " . (empty($db_pass) ? "<span class='warning'>KOSONG</span>" : "••••••••") . "<br>";
echo "</div>";

try {
    echo "<p>Menghubungkan ke database...</p>";
    $dsn = "mysql:host=$db_host;dbname=$db_name;port=3306;charset=utf8mb4";
    $options = [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ];
    $pdo = new PDO($dsn, $db_user, $db_pass, $options);
    echo "<p class='success'>✅ Koneksi Database Berhasil!</p>";
    
    // Cek apakah tabel pengguna ada
    try {
        $stmt = $pdo->query("SELECT COUNT(*) FROM pengguna");
        $count = $stmt->fetchColumn();
        echo "<p class='success'>✅ Tabel 'pengguna' ditemukan. Jumlah user terdaftar: $count</p>";
        
        if ($count > 0) {
            $users = $pdo->query("SELECT nama, email, id_peran FROM pengguna LIMIT 3")->fetchAll();
            echo "<div class='box'><strong>Sampel 3 User Terdaftar di Database:</strong><br><br>";
            foreach ($users as $u) {
                echo "Nama: " . htmlspecialchars($u['nama']) . " | Email: " . htmlspecialchars($u['email']) . " | Peran ID: " . $u['id_peran'] . "<br>";
            }
            echo "</div>";
        } else {
            echo "<p class='warning'>⚠️ Database kosong. Silakan jalankan import SQL database lokal Anda.</p>";
        }
    } catch (PDOException $e) {
        echo "<p class='error'>❌ Gagal membaca tabel 'pengguna': " . htmlspecialchars($e->getMessage()) . "</p>";
        echo "<p class='warning'>⚠️ Kemungkinan Anda belum mengimpor file SQL database Anda ke phpMyAdmin hosting.</p>";
    }

} catch (PDOException $e) {
    echo "<p class='error'>❌ Koneksi Database Gagal!</p>";
    echo "<div class='box' style='color: #ef4444;'>";
    echo "<strong>Pesan Error:</strong> " . htmlspecialchars($e->getMessage());
    echo "</div>";
}

echo "</body></html>";
