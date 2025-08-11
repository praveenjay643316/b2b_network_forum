<?php

namespace App\Http\Controllers;

use App\Models\Tyfcb;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class TyfcbController extends Controller
{
    // Get all TYFCB entries for the logged-in user
    public function index()
    {
        $userId = Auth::user()->profile_id;
        
        $tyfcbs = Tyfcb::with(['thankYouToUser:profile_id,first_name,last_name'])
            ->where('profile_id', $userId)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($item) {
                return [
                    'tyfcb_id' => $item->tyfcb_id,
                    'tyt_name' => $item->thankYouToUser ? 
                        $item->thankYouToUser->first_name . ' ' . $item->thankYouToUser->last_name : 
                        'Unknown',
                    'tyt_profile_id' => $item->tyt_profile_id,
                    'referral_amount' => $item->referral_amount,
                    'business_type' => $item->business_type,
                    'referral_type' => $item->referral_type,
                    'comments' => $item->comments,
                    'created_at' => $item->created_at->format('Y-m-d H:i:s')
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $tyfcbs
        ]);
    }

    // Create new TYFCB entry
    public function store(Request $request)
    {
        // Custom validation messages
        $messages = [
            'tyt_profile_id.required' => 'Please select a user to thank',
            'tyt_profile_id.exists' => 'Selected user does not exist',
            'referral_amount.required' => 'Referral amount is required',
            'referral_amount.numeric' => 'Referral amount must be a number',
            'referral_amount.min' => 'Referral amount must be at least 0',
            'business_type.required' => 'Business type is required',
            'business_type.in' => 'Business type must be either new or repeat',
            'referral_type.required' => 'Referral type is required',
            'referral_type.in' => 'Referral type must be either inside or outside',
        ];

        $validator = Validator::make($request->all(), [
            'tyt_profile_id' => 'required|exists:t_user,profile_id',
            'referral_amount' => 'required|numeric|min:0',
            'business_type' => 'required|in:new,repeat',
            'referral_type' => 'required|in:inside,outside',
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

            $tyfcb = Tyfcb::create($data);

            // Load the relationship for response
            $tyfcb->load('thankYouToUser:profile_id,first_name,last_name');

            return response()->json([
                'success' => true,
                'message' => 'TYFCB entry created successfully',
                'data' => [
                    'tyfcb_id' => $tyfcb->tyfcb_id,
                    'tyt_name' => $tyfcb->thankYouToUser ? 
                        $tyfcb->thankYouToUser->first_name . ' ' . $tyfcb->thankYouToUser->last_name : 
                        'Unknown',
                    'tyt_profile_id' => $tyfcb->tyt_profile_id,
                    'referral_amount' => $tyfcb->referral_amount,
                    'business_type' => $tyfcb->business_type,
                    'referral_type' => $tyfcb->referral_type,
                    'comments' => $tyfcb->comments,
                    'created_at' => $tyfcb->created_at->format('Y-m-d H:i:s')
                ]
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create TYFCB entry',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Get single TYFCB entry
    public function show($id)
    {
        try {
            $tyfcb = Tyfcb::with(['thankYouToUser:profile_id,first_name,last_name'])
                ->where('profile_id', Auth::user()->profile_id)
                ->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => [
                    'tyfcb_id' => $tyfcb->tyfcb_id,
                    'tyt_profile_id' => $tyfcb->tyt_profile_id,
                    'referral_amount' => $tyfcb->referral_amount,
                    'business_type' => $tyfcb->business_type,
                    'referral_type' => $tyfcb->referral_type,
                    'comments' => $tyfcb->comments,
                    'created_at' => $tyfcb->created_at->format('Y-m-d H:i:s')
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'TYFCB entry not found'
            ], 404);
        }
    }

    // Update TYFCB entry
    public function update(Request $request, $id)
    {
        try {
            $tyfcb = Tyfcb::where('profile_id', Auth::user()->profile_id)
                ->findOrFail($id);

            $messages = [
                'tyt_profile_id.required' => 'Please select a user to thank',
                'tyt_profile_id.exists' => 'Selected user does not exist',
                'referral_amount.required' => 'Referral amount is required',
                'referral_amount.numeric' => 'Referral amount must be a number',
                'referral_amount.min' => 'Referral amount must be at least 0',
                'business_type.required' => 'Business type is required',
                'business_type.in' => 'Business type must be either new or repeat',
                'referral_type.required' => 'Referral type is required',
                'referral_type.in' => 'Referral type must be either inside or outside',
            ];

            $validator = Validator::make($request->all(), [
                'tyt_profile_id' => 'sometimes|required|exists:t_user,profile_id',
                'referral_amount' => 'sometimes|required|numeric|min:0',
                'business_type' => 'sometimes|required|in:new,repeat',
                'referral_type' => 'sometimes|required|in:inside,outside',
                'comments' => 'nullable|string|max:1000'
            ], $messages);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $tyfcb->update($validator->validated());

            // Load the relationship for response
            $tyfcb->load('thankYouToUser:profile_id,first_name,last_name');

            return response()->json([
                'success' => true,
                'message' => 'TYFCB entry updated successfully',
                'data' => [
                    'tyfcb_id' => $tyfcb->tyfcb_id,
                    'tyt_name' => $tyfcb->thankYouToUser ? 
                        $tyfcb->thankYouToUser->first_name . ' ' . $tyfcb->thankYouToUser->last_name : 
                        'Unknown',
                    'tyt_profile_id' => $tyfcb->tyt_profile_id,
                    'referral_amount' => $tyfcb->referral_amount,
                    'business_type' => $tyfcb->business_type,
                    'referral_type' => $tyfcb->referral_type,
                    'comments' => $tyfcb->comments,
                    'created_at' => $tyfcb->created_at->format('Y-m-d H:i:s')
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update TYFCB entry',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Delete TYFCB entry
    public function destroy($id)
    {
        try {
            $tyfcb = Tyfcb::where('profile_id', Auth::user()->profile_id)
                ->findOrFail($id);

            $tyfcb->delete();

            return response()->json([
                'success' => true,
                'message' => 'TYFCB entry deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete TYFCB entry'
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