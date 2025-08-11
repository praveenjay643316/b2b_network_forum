<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateReferralTable extends Migration
{
    public function up()
    {
        Schema::create('t_referral', function (Blueprint $table) {
            $table->id('referral_id');
            $table->unsignedBigInteger('profile_id'); // User who created this referral
            $table->unsignedBigInteger('to_profile_id'); // User being referred to
            $table->string('lead_type')->nullable();
            $table->string('referral_type')->nullable();
            $table->string('referral_status')->nullable();
            $table->text('address')->nullable()->nullable();
            $table->string('mobile_number')->nullable();
            $table->string('email')->nullable();
            $table->text('comments')->nullable();
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();
            
            // Foreign keys
            $table->foreign('profile_id')->references('profile_id')->on('t_user')->onDelete('cascade');
            $table->foreign('to_profile_id')->references('profile_id')->on('t_user')->onDelete('cascade');
            
            // Indexes
            $table->index('profile_id');
            $table->index('to_profile_id');
            $table->index('lead_type');
            $table->index('referral_type');
            $table->index('created_at');
        });
    }

    public function down()
    {
        Schema::dropIfExists('t_referral');
    }
}