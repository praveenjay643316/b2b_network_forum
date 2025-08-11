<?php

namespace App\Http\Controllers;

use App\Models\Referral;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class ReferralController extends Controller
{
    // Get all Referral entries for the logged-in user
    public function index()
    {
        $userId = Auth::user()->profile_id;
        
        $referrals = Referral::with(['referredToUser:profile_id,first_name,last_name'])
            ->where('profile_id', $userId)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($item) {
                return [
                    'referral_id' => $item->referral_id,
                    'to_name' => $item->referredToUser ? 
                        $item->referredToUser->first_name . ' ' . $item->referredToUser->last_name : 
                        'Unknown',
                    'to_profile_id' => $item->to_profile_id,
                    'lead_type' => $item->lead_type,
                    'referral_type' => $item->referral_type,
                    'referral_status' => $item->referral_status,
                    'address' => $item->address,
                    'mobile_number' => $item->mobile_number,
                    'email' => $item->email,
                    'comments' => $item->comments,
                    'created_at' => $item->created_at->format('Y-m-d H:i:s')
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $referrals
        ]);
    }

    // Create new Referral entry
    public function store(Request $request)
    {
        // Custom validation messages
        $messages = [
            'to_profile_id.required' => 'Please select a user to refer to',
            'to_profile_id.exists' => 'Selected user does not exist',
            'lead_type.required' => 'Lead type is required',
            'lead_type.in' => 'Lead type must be HOT, WARM, or COLD',
            'referral_type.required' => 'Referral type is required',
            'referral_type.in' => 'Referral type must be either inside or outside',
            'referral_status.required' => 'Referral status is required',
            'referral_status.in' => 'Referral status must be either given_card or told_call',
            'mobile_number.regex' => 'Please enter a valid mobile number',
            'email.email' => 'Please enter a valid email address',
        ];

        $validator = Validator::make($request->all(), [
            'to_profile_id' => 'required|exists:t_user,profile_id',
            'lead_type' => 'required|in:HOT,WARM,COLD',
            'referral_type' => 'required|in:inside,outside',
            'referral_status' => 'required|in:given_card,told_call',
            'address' => 'nullable|string|max:500',
            'mobile_number' => 'nullable|regex:/^[\+]?[0-9\s\-\(\)]{10,20}$/',
            'email' => 'nullable|email|max:255',
            'comments' => 'nullable|string|max:1000'
        ], $messages);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $data = $validator->validated();
            $data['profile_id'] = Auth::user()->profile_id;

            $referral = Referral::create($data);

            // Load the relationship for response
            $referral->load('referredToUser:profile_id,first_name,last_name');

            return response()->json([
                'success' => true,
                'message' => 'Referral entry created successfully',
                'data' => [
                    'referral_id' => $referral->referral_id,
                    'to_name' => $referral->referredToUser ? 
                        $referral->referredToUser->first_name . ' ' . $referral->referredToUser->last_name : 
                        'Unknown',
                    'to_profile_id' => $referral->to_profile_id,
                    'lead_type' => $referral->lead_type,
                    'referral_type' => $referral->referral_type,
                    'referral_status' => $referral->referral_status,
                    'address' => $referral->address,
                    'mobile_number' => $referral->mobile_number,
                    'email' => $referral->email,
                    'comments' => $referral->comments,
                    'created_at' => $referral->created_at->format('Y-m-d H:i:s')
                ]
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create referral entry',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Get single Referral entry
    public function show($id)
    {
        try {
            $referral = Referral::with(['referredToUser:profile_id,first_name,last_name'])
                ->where('profile_id', Auth::user()->profile_id)
                ->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => [
                    'referral_id' => $referral->referral_id,
                    'to_profile_id' => $referral->to_profile_id,
                    'lead_type' => $referral->lead_type,
                    'referral_type' => $referral->referral_type,
                    'referral_status' => $referral->referral_status,
                    'address' => $referral->address,
                    'mobile_number' => $referral->mobile_number,
                    'email' => $referral->email,
                    'comments' => $referral->comments,
                    'created_at' => $referral->created_at->format('Y-m-d H:i:s')
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Referral entry not found'
            ], 404);
        }
    }

    // Update Referral entry
    public function update(Request $request, $id)
    {
        try {
            $referral = Referral::where('profile_id', Auth::user()->profile_id)
                ->findOrFail($id);

            $messages = [
                'to_profile_id.required' => 'Please select a user to refer to',
                'to_profile_id.exists' => 'Selected user does not exist',
                'lead_type.required' => 'Lead type is required',
                'lead_type.in' => 'Lead type must be HOT, WARM, or COLD',
                'referral_type.required' => 'Referral type is required',
                'referral_type.in' => 'Referral type must be either inside or outside',
                'referral_status.required' => 'Referral status is required',
                'referral_status.in' => 'Referral status must be either given_card or told_call',
                'mobile_number.regex' => 'Please enter a valid mobile number',
                'email.email' => 'Please enter a valid email address',
            ];

            $validator = Validator::make($request->all(), [
                'to_profile_id' => 'sometimes|required|exists:t_user,profile_id',
                'lead_type' => 'sometimes|required|in:HOT,WARM,COLD',
                'referral_type' => 'sometimes|required|in:inside,outside',
                'referral_status' => 'sometimes|required|in:given_card,told_call',
                'address' => 'nullable|string|max:500',
                'mobile_number' => 'nullable|regex:/^[\+]?[0-9\s\-\(\)]{10,20}$/',
                'email' => 'nullable|email|max:255',
                'comments' => 'nullable|string|max:1000'
            ], $messages);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $referral->update($validator->validated());

            // Load the relationship for response
            $referral->load('referredToUser:profile_id,first_name,last_name');

            return response()->json([
                'success' => true,
                'message' => 'Referral entry updated successfully',
                'data' => [
                    'referral_id' => $referral->referral_id,
                    'to_name' => $referral->referredToUser ? 
                        $referral->referredToUser->first_name . ' ' . $referral->referredToUser->last_name : 
                        'Unknown',
                    'to_profile_id' => $referral->to_profile_id,
                    'lead_type' => $referral->lead_type,
                    'referral_type' => $referral->referral_type,
                    'referral_status' => $referral->referral_status,
                    'address' => $referral->address,
                    'mobile_number' => $referral->mobile_number,
                    'email' => $referral->email,
                    'comments' => $referral->comments,
                    'created_at' => $referral->created_at->format('Y-m-d H:i:s')
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update referral entry',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Delete Referral entry
    public function destroy($id)
    {
        try {
            $referral = Referral::where('profile_id', Auth::user()->profile_id)
                ->findOrFail($id);

            $referral->delete();

            return response()->json([
                'success' => true,
                'message' => 'Referral entry deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete referral entry'
            ], 500);
        }
    }

    // Get users list for dropdown
    public function getUsersList()
    {
        try {
            $users = User::where('active', 1)
                ->where('profile_id', '!=', Auth::user()->profile_id)
                ->select('profile_id', 'first_name', 'last_name')
                ->orderBy('first_name')
                ->get()
                ->map(function ($user) {
                    return [
                        'value' => $user->profile_id,
                        'label' => $user->first_name . ' ' . $user->last_name
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $users
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch users list',
                'data' => []
            ], 500);
        }
    }
}