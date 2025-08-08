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
        $table->renameColumn('password_stent_status', 'password_sent_status');
    });
}

public function down(): void
{
    Schema::table('t_user', function (Blueprint $table) {
        $table->renameColumn('password_sent_status', 'password_stent_status');
    });
}

};
