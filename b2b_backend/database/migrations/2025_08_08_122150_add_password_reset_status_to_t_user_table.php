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
        $table->string('password_reset_status')->default('N')->after('password');
    });
}

public function down(): void
{
    Schema::table('t_user', function (Blueprint $table) {
        $table->dropColumn('password_reset_status');
    });
}
};
