<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FaceToFace extends Model
{
    protected $table = 't_face_to_face';
    protected $primaryKey = 'face_to_face_id';
    
    protected $fillable = [
        'profile_id',
        'met_with_profile_id',
        'invited_by_profile_id',
        'location',
        'date'
    ];

    protected $casts = [
        'date' => 'date',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Relationship with User who created the record
    public function user()
    {
        return $this->belongsTo(User::class, 'profile_id', 'profile_id');
    }

    // Relationship with User met with
    public function metWithUser()
    {
        return $this->belongsTo(User::class, 'met_with_profile_id', 'profile_id');
    }

    // Relationship with User who invited
    public function invitedByUser()
    {
        return $this->belongsTo(User::class, 'invited_by_profile_id', 'profile_id');
    }
}