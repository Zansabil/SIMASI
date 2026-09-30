Auth::login(App\Models\Pengguna::first());
$req = Request::create('/api/sub_aset/1/kondisi', 'PATCH', ['kondisi_aset' => 'Rusak ringan']);
$req->headers->set('Accept', 'application/json');
echo app()->handle($req)->getContent();
