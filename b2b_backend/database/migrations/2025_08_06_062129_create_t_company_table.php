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
        Schema::create('t_company', function (Blueprint $table) {
            $table->id('company_id'); // primary key
            $table->unsignedBigInteger('profile_id'); // foreign key to t_user
            $table->string('company_name');
            $table->string('company_phone_number')->nullable();
            $table->string('company_url')->nullable();
            $table->string('address_1')->nullable();
            $table->string('address_2')->nullable();
            $table->string('address_3')->nullable();
            $table->string('city')->nullable();
            $table->string('state')->nullable();
            $table->string('zip_code')->nullable();
            $table->string('country_region')->nullable();
            $table->timestamps();

            // Foreign key constraint
            $table->foreign('profile_id')->references('profile_id')->on('t_user')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('t_company');
    }
};
