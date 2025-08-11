<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Referral extends Model
{
    protected $table = 't_referral';
    protected $primaryKey = 'referral_id';
    
    protected $fillable = [
        'profile_id',
        'to_profile_id',
        'lead_type',
        'referral_type',
        'referral_status',
        'address',
        'mobile_number',
        'email',
        'comments'
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Relationship with User who created the referral
    public function user()
    {
        return $this->belongsTo(User::class, 'profile_id', 'profile_id');
    }

    // Relationship with User being referred to
    public function referredToUser()
    {
        return $this->belongsTo(User::class, 'to_profile_id', 'profile_id');
    }
}