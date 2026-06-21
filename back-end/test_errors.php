<?php
$lines = file('storage/logs/laravel.log');
$errors = [];
foreach($lines as $line) {
    if (strpos($line, 'local.ERROR') !== false && strpos($line, date('Y-m-d')) !== false) {
        $errors[] = $line;
    }
}
echo "ERRORS TODAY:\n";
print_r($errors);
