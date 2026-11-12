<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\LokasiUnit;

class LokasiUnitController extends Controller
{
    public function index()
    {
        $urutan = ['TK 1', 'TK 2', 'SD 1', 'SD 2', 'SMP 1', 'SMP 2', 'SMA', 'MA'];
        $lokasiUnits = LokasiUnit::all()->sortBy(function ($unit) use ($urutan) {
            $pos = array_search($unit->nama_unit, $urutan, true);
            return $pos !== false ? sprintf('%02d', $pos) : '99_' . $unit->nama_unit;
        })->values();

        return response()->json([
            'success' => true,
            'data' => $lokasiUnits
        ], 200);
    }
}
