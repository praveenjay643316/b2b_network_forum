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
        Schema::create('t_user', function (Blueprint $table) {
            $table->id('profile_id'); // primary key
            $table->string('first_name');
            $table->string('last_name');
            $table->string('personal_mobile');
            $table->string('personal_email')->unique();
            $table->string('job_title')->nullable();
            $table->string('business_mobile_number')->nullable();
            $table->string('user_name')->unique();
            $table->string('password')->nullable();
            $table->boolean('active')->default(true);
            $table->string('user_type')->nullable(); // e.g., 'admin', 'user'
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('t_user');
    }
};
