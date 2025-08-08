<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Company extends Model
{
    protected $table = 't_company';

    protected $primaryKey = 'company_id';

    protected $fillable = [
        'profile_id',
        'company_name',
        'company_phone_number',
        'company_url',
        'address_1',
        'address_2',
        'address_3',
        'city',
        'state',
        'zip_code',
        'country_region'
    ];

    public $timestamps = false;

    public function user()
    {
        return $this->belongsTo(User::class, 'profile_id', 'profile_id');
    }
}
