<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Tyfcb extends Model
{
    protected $table = 't_tyfcb';
    protected $primaryKey = 'tyfcb_id';
    
    protected $fillable = [
        'profile_id',
        'tyt_profile_id',
        'referral_amount',
        'business_type',
        'referral_type',
        'comments'
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Relationship with User who created the entry
    public function user()
    {
        return $this->belongsTo(User::class, 'profile_id', 'profile_id');
    }

    // Relationship with User being thanked
    public function thankYouToUser()
    {
        return $this->belongsTo(User::class, 'tyt_profile_id', 'profile_id');
    }
}