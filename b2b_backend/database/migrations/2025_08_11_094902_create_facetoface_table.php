<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateFaceToFaceTable extends Migration
{
    public function up()
    {
        Schema::create('t_face_to_face', function (Blueprint $table) {
            $table->id('face_to_face_id');
            $table->unsignedBigInteger('profile_id'); // User who created the record
            $table->unsignedBigInteger('met_with_profile_id'); // User met with
            $table->unsignedBigInteger('invited_by_profile_id'); // User who invited
            $table->string('location', 500);
            $table->date('date');
            $table->timestamps();
            
            // Foreign keys
            $table->foreign('profile_id')->references('profile_id')->on('t_user');
            $table->foreign('met_with_profile_id')->references('profile_id')->on('t_user');
            $table->foreign('invited_by_profile_id')->references('profile_id')->on('t_user');
            
            // Indexes
            $table->index('profile_id');
            $table->index('date');
        });
    }

    public function down()
    {
        Schema::dropIfExists('t_face_to_face');
    }
}