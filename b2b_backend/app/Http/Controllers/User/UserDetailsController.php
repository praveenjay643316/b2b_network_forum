<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Company;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Mail;
use App\Mail\UserApprovedMail;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;


class UserDetailsController extends Controller
{
    public function getAllUsers()
    {
        $users = User::with('company')
            ->orderBy('profile_id', 'desc')
            ->get();

        $formatted = $users->map(function ($user) {
            return [
                'profile_id' => $user->profile_id,
                'full_name' => $user->first_name . ' ' . $user->last_name,
                'personal_mobile' => $user->personal_mobile,
                'personal_email' => $user->personal_email,
                'user_type' => $user->user_type,
                'status' => $user->active ? 'Approved' : 'Not-Approved',
                'company_name' => $user->company->company_name ?? null,
                'company_url' => $user->company->company_url ?? null,
                'password_sent_status' => $user->password_sent_status,
            ];
        });

        return response()->json(['data' => $formatted], 200);
    }

    public function getUserById($id)
    {
        $user = User::with('company')->where('profile_id', $id)->first();

        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        return response()->json([
            'profile_id' => $user->profile_id,
            'first_name' => $user->first_name,
            'last_name' => $user->last_name,
            'job_title' => $user->job_title,
            'business_mobile_number' => $user->business_mobile_number,
            'personal_mobile' => $user->personal_mobile,
            'personal_email' => $user->personal_email,
            'user_type' => $user->user_type,
            'company_name' => $user->company->company_name ?? null,
            'company_phone_number' => $user->company->company_phone_number ?? null,
            'company_url' => $user->company->company_url ?? null,
            'address_1' => $user->company->address_1 ?? null,
            'address_2' => $user->company->address_2 ?? null,
            'address_3' => $user->company->address_3 ?? null,
            'city' => $user->company->city ?? null,
            'state' => $user->company->state ?? null,
            'zip_code' => $user->company->zip_code ?? null,
            'country_region' => $user->company->country_region ?? null,
            'password_sent' => $user->password_sent,
        ]);
    }

    public function createUser(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'personal_mobile' => 'required|string|max:20',
            'personal_email' => 'required|email|unique:t_user,personal_email',
            'user_type' => 'required|in:admin,leader,user',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = User::create([
            'first_name' => $request->first_name,
            'last_name' => $request->last_name,
            'job_title' => $request->job_title,
            'business_mobile_number' => $request->business_mobile_number,
            'personal_mobile' => $request->personal_mobile,
            'personal_email' => $request->personal_email,
            'user_name' => $request->personal_email,
            'user_type' => $request->user_type,
            'active' => false,
            'password_sent' => 'N', // Default to not sent
            'created_at' => now()
        ]);

        if ($request->filled('company_name') || 
            $request->filled('company_phone_number') || 
            $request->filled('company_url')) {
            
            $company = new Company([
                'company_name' => $request->company_name,
                'company_phone_number' => $request->company_phone_number,
                'company_url' => $request->company_url,
                'address_1' => $request->address_1,
                'address_2' => $request->address_2,
                'address_3' => $request->address_3,
                'city' => $request->city,
                'state' => $request->state,
                'zip_code' => $request->zip_code,
                'country_region' => $request->country_region,
                'created_at' => now()
            ]);

            $user->company()->save($company);
        }

        return response()->json([
            'message' => 'User created successfully',
            'profile_id' => $user->profile_id
        ], 201);
    }

    public function updateUser(Request $request, $id)
    {
        $user = User::where('profile_id', $id)->first();

        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        $user->update([
            'first_name' => $request->first_name ?? $user->first_name,
            'last_name' => $request->last_name ?? $user->last_name,
            'job_title' => $request->job_title ?? $user->job_title,
            'business_mobile_number' => $request->business_mobile_number ?? $user->business_mobile_number,
            'personal_mobile' => $request->personal_mobile ?? $user->personal_mobile,
            'personal_email' => $request->personal_email ?? $user->personal_email,
            'user_type' => $request->user_type ?? $user->user_type,
            'updated_at' => now()
        ]);

        $companyData = [
            'company_name' => $request->company_name ?? $user->company->company_name ?? null,
            'company_phone_number' => $request->company_phone_number ?? $user->company->company_phone_number ?? null,
            'company_url' => $request->company_url ?? $user->company->company_url ?? null,
            'address_1' => $request->address_1 ?? $user->company->address_1 ?? null,
            'address_2' => $request->address_2 ?? $user->company->address_2 ?? null,
            'address_3' => $request->address_3 ?? $user->company->address_3 ?? null,
            'city' => $request->city ?? $user->company->city ?? null,
            'state' => $request->state ?? $user->company->state ?? null,
            'zip_code' => $request->zip_code ?? $user->company->zip_code ?? null,
            'country_region' => $request->country_region ?? $user->company->country_region ?? null,
            'updated_at' => now()
        ];

        if ($user->company) {
            $user->company->update($companyData);
        } else if ($request->hasAny([
            'company_name', 'company_phone_number', 'company_url',
            'address_1', 'address_2', 'address_3', 'city', 'state', 'zip_code', 'country_region','updated_at'
        ])) {
            $user->company()->create($companyData);
        }

        return response()->json(['message' => 'User updated successfully']);
    }

   public function updateUserStatus(Request $request, $id)
{
    $user = User::where('profile_id', $id)->first();
    
    if (!$user) {
        return response()->json(['message' => 'User not found'], 404);
    }

    $validator = Validator::make($request->all(), [
        'active' => 'required|boolean',
    ]);

    if ($validator->fails()) {
        return response()->json([
            'message' => 'Validation failed',
            'errors' => $validator->errors()
        ], 422);
    }

    $active = $request->active;

    $emailSent = false;
    $error = null;

    // If activating for the first time and password hasn't been sent
    if ($active && $user->password_sent_status === 'N') {
        $sendEmail = true;
        
        // Generate random password
        $password = Str::random(10);
        
        try {
            // Send welcome email
            Mail::to($user->personal_email)->send(
                new UserApprovedMail($user->personal_email, $password)
            );
            $emailSent = true;
            
            // Update user with hashed password
            $user->password = Hash::make($password);
            $user->password_sent_status = 'Y';
            
        } catch (\Exception $e) {
            $error = $e->getMessage();

            $sendEmail = false;
        }
    }

    $user->active = $active;
    $user->save();

    return response()->json([
        'message' => 'User status updated successfully',
        'email_sent' => $emailSent,
        'error' => $error
    ]);
}

    public function deleteUser($id)
    {
        $user = User::where('profile_id', $id)->first();
        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        $user->delete();
        return response()->json(['message' => 'User deleted successfully']);
    }
}