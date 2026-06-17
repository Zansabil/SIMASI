<?php
$models = ['aset', 'laporan_kerusakan', 'notifikasi', 'pemindahan_aset', 'pengadaan_aset', 'pengguna', 'perbaikan_aset', 'perizinan', 'riwayat_aset'];

foreach ($models as $m) {
   $pascal = str_replace(' ', '', ucwords(str_replace('_', ' ', $m)));
   rename("app/Models/$m.php", "app/Models/{$pascal}_tmp.php");
   rename("app/Models/{$pascal}_tmp.php", "app/Models/$pascal.php");
   
   $content = file_get_contents("app/Models/$pascal.php");
   $content = preg_replace("/class\s+$m\s+extends/", "class $pascal extends", $content);
   file_put_contents("app/Models/$pascal.php", $content);
   echo "Renamed and updated $m to $pascal\n";
}

// Update controllers and other models
$directories = ['app/Http/Controllers', 'app/Models'];
foreach ($directories as $dir) {
    $files = glob("$dir/*.php");
    foreach ($files as $file) {
        $content = file_get_contents($file);
        foreach ($models as $m) {
            $pascal = str_replace(' ', '', ucwords(str_replace('_', ' ', $m)));
            // Replace `use App\Models\aset;` to `use App\Models\Aset;`
            $content = preg_replace("/use App\\\\Models\\\\$m;/", "use App\\Models\\$pascal;", $content);
            // Replace `$m::` to `$pascal::`
            $content = preg_replace("/\b$m::/", "$pascal::", $content);
            // Replace `new $m` to `new $pascal`
            $content = preg_replace("/new\s+$m\b/", "new $pascal", $content);
            // Replace `$this->belongsTo($m::class`
            $content = preg_replace("/\b$m::class/", "$pascal::class", $content);
        }
        file_put_contents($file, $content);
    }
}
echo "Updated references in Controllers and Models.\n";
