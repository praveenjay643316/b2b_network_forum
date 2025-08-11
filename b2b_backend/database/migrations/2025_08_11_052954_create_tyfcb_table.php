<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateTyfcbTable extends Migration
{
    public function up()
    {
        Schema::create('t_tyfcb', function (Blueprint $table) {
            $table->id('tyfcb_id');
            $table->unsignedBigInteger('profile_id'); // User who created this entry
            $table->unsignedBigInteger('tyt_profile_id'); // User being thanked
            $table->text('referral_amount')->nullable();
            $table->text('business_type')->nullable();
            $table->text('referral_type')->nullable();
            $table->text('comments')->nullable();
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();
            
            // Foreign keys
            $table->foreign('profile_id')->references('profile_id')->on('t_user')->onDelete('cascade');
            $table->foreign('tyt_profile_id')->references('profile_id')->on('t_user')->onDelete('cascade');
            
            // Indexes
            $table->index('profile_id');
            $table->index('tyt_profile_id');
            $table->index('created_at');
        });
    }

    public function down()
    {
        Schema::dropIfExists('TyfcbController');
    }
}