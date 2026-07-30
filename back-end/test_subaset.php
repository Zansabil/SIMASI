<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);

$user = \App\Models\Pengguna::first();
\Illuminate\Support\Facades\Auth::login($user);

$request = Illuminate\Http\Request::create('/api/sub_aset/1/kondisi', 'PATCH', ['kondisi_aset' => 'Rusak ringan']);
$request->headers->set('Accept', 'application/json');

$response = $kernel->handle($request);

echo "STATUS: " . $response->getStatusCode() . "\n";
echo "CONTENT: " . $response->getContent() . "\n";
