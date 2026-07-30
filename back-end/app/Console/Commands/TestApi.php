<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Http\Controllers\SubAsetController;
use Illuminate\Http\Request;
use App\Models\Pengguna;
use Illuminate\Support\Facades\Auth;

class TestApi extends Command
{
    protected $signature = 'test:api';
    protected $description = 'Test the API directly';

    public function handle()
    {
        try {
            Auth::login(Pengguna::first());
            $controller = new SubAsetController();
            $request = Request::create('/api/sub_aset/1/kondisi', 'PATCH', ['kondisi_aset' => 'Rusak ringan']);
            $request->headers->set('Accept', 'application/json');
            
            $response = $controller->updateKondisi($request, 1);
            $this->info("Response Content:");
            $this->info($response->getContent());
        } catch (\Exception $e) {
            $this->error("Exception: " . $e->getMessage());
            $this->error($e->getTraceAsString());
        }
    }
}
