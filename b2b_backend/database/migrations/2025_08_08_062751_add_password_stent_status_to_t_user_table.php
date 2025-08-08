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
        Schema::table('t_user', function (Blueprint $table) {
            $table->string('password_stent_status')->default('N')->after('password'); 
            // after('password') will place the column after 'password' field
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('t_user', function (Blueprint $table) {
            $table->dropColumn('password_stent_status');
        });
    }
};
