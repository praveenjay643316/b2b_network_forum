<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
  public function up(): void
{
    Schema::table('t_user', function (Blueprint $table) {
        $table->string('password_sent_status')->default('N')->after('password');
    });

    // Copy old column data to new column
    DB::table('t_user')->update([
        'password_sent_status' => DB::raw('password_stent_status')
    ]);

    Schema::table('t_user', function (Blueprint $table) {
        $table->dropColumn('password_stent_status');
    });
}

public function down(): void
{
    Schema::table('t_user', function (Blueprint $table) {
        $table->string('password_stent_status')->default('N')->after('password');
    });

    DB::table('t_user')->update([
        'password_stent_status' => DB::raw('password_sent_status')
    ]);

    Schema::table('t_user', function (Blueprint $table) {
        $table->dropColumn('password_sent_status');
    });
}
};
