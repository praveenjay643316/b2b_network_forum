<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Company;
use Illuminate\Http\Request;

class UserCompanyController extends Controller
{
    public function store(Request $request)
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
}
