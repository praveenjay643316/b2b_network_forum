<?php

namespace App\Http\Controllers;

use App\Models\FaceToFace;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class FaceToFaceController extends Controller
{
    // Get all Face to Face entries for the logged-in user
    public function index()
    {
        $userId = Auth::user()->profile_id;
        
        $faceToFaceList = FaceToFace::with([
            'metWithUser:profile_id,first_name,last_name',
            'invitedByUser:profile_id,first_name,last_name'
        ])
            ->where('profile_id', $userId)
            ->orderBy('date', 'desc')
            ->get()
            ->map(function ($item) {
                return [
                    'face_to_face_id' => $item->face_to_face_id,
                    'met_with_name' => $item->metWithUser ? 
                        $item->metWithUser->first_name . ' ' . $item->metWithUser->last_name : 
                        'Unknown',
                    'met_with_profile_id' => $item->met_with_profile_id,
                    'invited_by_name' => $item->invitedByUser ? 
                        $item->invitedByUser->first_name . ' ' . $item->invitedByUser->last_name : 
                        'Unknown',
                    'invited_by_profile_id' => $item->invited_by_profile_id,
                    'location' => $item->location,
                    'date' => $item->date->format('Y-m-d'),
                    'created_at' => $item->created_at->format('Y-m-d H:i:s')
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $faceToFaceList
        ]);
    }

    // Create new Face to Face entry
    public function store(Request $request)
    {
        $messages = [
            'met_with_profile_id.required' => 'Please select who you met with',
            'met_with_profile_id.exists' => 'Selected user does not exist',
            'invited_by_profile_id.required' => 'Please select who invited you',
            'invited_by_profile_id.exists' => 'Selected user does not exist',
            'location.required' => 'Location is required',
            'location.max' => 'Location cannot exceed 500 characters',
            'date.required' => 'Date is required',
            'date.date' => 'Please enter a valid date',
            'date.before_or_equal' => 'Date cannot be in the future',
        ];

        $validator = Validator::make($request->all(), [
            'met_with_profile_id' => 'required|exists:t_user,profile_id',
            'invited_by_profile_id' => 'required|exists:t_user,profile_id',
            'location' => 'required|string|max:500',
            'date' => 'required|date|before_or_equal:today'
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

            $faceToFace = FaceToFace::create($data);

            // Load relationships for response
            $faceToFace->load([
                'metWithUser:profile_id,first_name,last_name',
                'invitedByUser:profile_id,first_name,last_name'
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Face to Face entry created successfully',
                'data' => [
                    'face_to_face_id' => $faceToFace->face_to_face_id,
                    'met_with_name' => $faceToFace->metWithUser ? 
                        $faceToFace->metWithUser->first_name . ' ' . $faceToFace->metWithUser->last_name : 
                        'Unknown',
                    'met_with_profile_id' => $faceToFace->met_with_profile_id,
                    'invited_by_name' => $faceToFace->invitedByUser ? 
                        $faceToFace->invitedByUser->first_name . ' ' . $faceToFace->invitedByUser->last_name : 
                        'Unknown',
                    'invited_by_profile_id' => $faceToFace->invited_by_profile_id,
                    'location' => $faceToFace->location,
                    'date' => $faceToFace->date->format('Y-m-d'),
                    'created_at' => $faceToFace->created_at->format('Y-m-d H:i:s')
                ]
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create Face to Face entry',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Get single Face to Face entry
    public function show($id)
    {
        try {
            $faceToFace = FaceToFace::with([
                'metWithUser:profile_id,first_name,last_name',
                'invitedByUser:profile_id,first_name,last_name'
            ])
                ->where('profile_id', Auth::user()->profile_id)
                ->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => [
                    'face_to_face_id' => $faceToFace->face_to_face_id,
                    'met_with_profile_id' => $faceToFace->met_with_profile_id,
                    'invited_by_profile_id' => $faceToFace->invited_by_profile_id,
                    'location' => $faceToFace->location,
                    'date' => $faceToFace->date->format('Y-m-d'),
                    'created_at' => $faceToFace->created_at->format('Y-m-d H:i:s')
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Face to Face entry not found'
            ], 404);
        }
    }

    // Update Face to Face entry
    public function update(Request $request, $id)
    {
        try {
            $faceToFace = FaceToFace::where('profile_id', Auth::user()->profile_id)
                ->findOrFail($id);

            $messages = [
                'met_with_profile_id.required' => 'Please select who you met with',
                'met_with_profile_id.exists' => 'Selected user does not exist',
                'invited_by_profile_id.required' => 'Please select who invited you',
                'invited_by_profile_id.exists' => 'Selected user does not exist',
                'location.required' => 'Location is required',
                'location.max' => 'Location cannot exceed 500 characters',
                'date.required' => 'Date is required',
                'date.date' => 'Please enter a valid date',
                'date.before_or_equal' => 'Date cannot be in the future',
            ];

            $validator = Validator::make($request->all(), [
                'met_with_profile_id' => 'sometimes|required|exists:t_user,profile_id',
                'invited_by_profile_id' => 'sometimes|required|exists:t_user,profile_id',
                'location' => 'sometimes|required|string|max:500',
                'date' => 'sometimes|required|date|before_or_equal:today'
            ], $messages);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $faceToFace->update($validator->validated());

            // Load relationships for response
            $faceToFace->load([
                'metWithUser:profile_id,first_name,last_name',
                'invitedByUser:profile_id,first_name,last_name'
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Face to Face entry updated successfully',
                'data' => [
                    'face_to_face_id' => $faceToFace->face_to_face_id,
                    'met_with_name' => $faceToFace->metWithUser ? 
                        $faceToFace->metWithUser->first_name . ' ' . $faceToFace->metWithUser->last_name : 
                        'Unknown',
                    'met_with_profile_id' => $faceToFace->met_with_profile_id,
                    'invited_by_name' => $faceToFace->invitedByUser ? 
                        $faceToFace->invitedByUser->first_name . ' ' . $faceToFace->invitedByUser->last_name : 
                        'Unknown',
                    'invited_by_profile_id' => $faceToFace->invited_by_profile_id,
                    'location' => $faceToFace->location,
                    'date' => $faceToFace->date->format('Y-m-d'),
                    'created_at' => $faceToFace->created_at->format('Y-m-d H:i:s')
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update Face to Face entry',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Delete Face to Face entry
    public function destroy($id)
    {
        try {
            $faceToFace = FaceToFace::where('profile_id', Auth::user()->profile_id)
                ->findOrFail($id);

            $faceToFace->delete();

            return response()->json([
                'success' => true,
                'message' => 'Face to Face entry deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete Face to Face entry'
            ], 500);
        }
    }

    // Get users list for dropdown
    public function getUsersList()
    {
        try {
            $users = User::where('active', 1)
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