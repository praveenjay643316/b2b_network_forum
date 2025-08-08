<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Company;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;


class UserLoginRegister extends Controller
{
    public function register(Request $request)
    {
        $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'nullable|string|max:255',
            'personal_mobile' => 'required|string|max:20',
            'personal_email' => 'required|email|max:255',
            'company_name' => 'required|string|max:255',
            'company_url' => 'nullable|url|max:255',
        ]);
        try {
            // Create user
            $user = User::create([
                'first_name' => $request->first_name,
                'last_name' => $request->last_name ?? '',
                'personal_mobile' => $request->personal_mobile,
                'personal_email' => $request->personal_email,
                'user_name' => $request->personal_email,
            ]);

            // Create company
            Company::create([
                'profile_id' => $user->profile_id,
                'company_name' => $request->company_name,
                'company_url' => $request->company_url ?? '',
            ]);

            return response()->json([
                'success' => true,
                'message' => 'User and Company created successfully'
            ], 201);
        } catch (\Exception $e) {
            // ❌ Catch and return any unexpected exceptions
            return response()->json([
                'success' => false,
                'message' => 'Something went wrong during registration.',
                'error' => $e->getMessage() // Optional: remove in production
            ], 500);
        }
    }
    public function login(Request $request)
{
    $request->validate([
        'email' => 'required|email',
        'password' => 'required',
    ]);

    // Retrieve user by email (mapped to user_name column)
    $user = \App\Models\User::where('user_name', $request->email)->first();

    if (!$user || !Hash::check($request->password, $user->password)) {
        return response()->json([
            'success' => false,
            'message' => 'Invalid credentials.',
        ], 401);
    }

    Auth::login($user);

    $token = $user->createToken('api_token')->plainTextToken;

    return response()->json([
        'success' => true,
        'user' => $user,
        'token' => $token,
        'requirePasswordChange' => $user->password_reset_status === 'N'
    ]);
}
public function changePassword(Request $request)
{
    $request->validate([
        'current_password' => 'required',
        'new_password' => 'required|min:8|confirmed', 
    ]);

    /** @var \App\Models\User $user */
        $user = Auth::user();

    // Verify current password
    if (!Hash::check($request->current_password, $user->password)) {
        return response()->json([
            'success' => false,
            'message' => 'Current password is incorrect.',
        ], 400);
    }

    // Update password and reset status
    $user->password = Hash::make($request->new_password);
    $user->password_reset_status = 'Y';
    $user->save();

    return response()->json([
        'success' => true,
        'message' => 'Password changed successfully.',
        'user' => $user
    ]);
}

}
