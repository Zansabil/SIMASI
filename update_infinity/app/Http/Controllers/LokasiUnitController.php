<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\LokasiUnit;

class LokasiUnitController extends Controller
{
    public function index()
    {
        $lokasiUnits = LokasiUnit::orderBy('nama_unit', 'asc')->get();
        return response()->json([
            'success' => true,
            'data' => $lokasiUnits
        ], 200);
    }
}
