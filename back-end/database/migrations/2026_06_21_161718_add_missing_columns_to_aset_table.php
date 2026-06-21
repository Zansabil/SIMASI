<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('aset', function (Blueprint $table) {
            $table->double('harga_aset')->nullable()->after('kondisi_aset');
            $table->string('sumber_dana')->nullable()->after('harga_aset');
            $table->longText('foto')->nullable()->after('sumber_dana');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('aset', function (Blueprint $table) {
            $table->dropColumn(['harga_aset', 'sumber_dana', 'foto']);
        });
    }
};
