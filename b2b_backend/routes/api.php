<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ReferralController;
use App\Http\Controllers\TyfcbController;
use App\Http\Controllers\UserLoginRegister;
use App\Http\Controllers\FaceToFaceController;
use App\Http\Controllers\User\UserDetailsController;
use App\Http\Controllers\ReportController;
Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});
Route::post('/register', [UserLoginRegister::class, 'register']);

Route::post('/login', [UserLoginRegister::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/get_users', [UserDetailsController::class, 'getAllUsers']);
    Route::get('/users/{id}', [UserDetailsController::class, 'getUserById']);
    Route::put('/users/{id}', [UserDetailsController::class, 'updateUser']);
    Route::put('/users/{id}/status', [UserDetailsController::class, 'updateUserStatus']); // NEW ENDPOINT
    Route::delete('/users/{id}', [UserDetailsController::class, 'deleteUser']);
    Route::post('/create_user', [UserDetailsController::class, 'createUser']);
    Route::post('/change-password', [UserLoginRegister::class, 'changePassword']);
});

Route::middleware('auth:sanctum')->group(function () {

    
    // TYFCB routes
    Route::get('/tyfcb', [TyfcbController::class, 'index']);
    Route::post('/tyfcb', [TyfcbController::class, 'store']);
    Route::get('/tyfcb/{id}', [TyfcbController::class, 'show']);
    Route::put('/tyfcb/{id}', [TyfcbController::class, 'update']);
    Route::delete('/tyfcb/{id}', [TyfcbController::class, 'destroy']);
    Route::get('/tyfcb-users', [TyfcbController::class, 'getUsersList']);
});

Route::middleware('auth:sanctum')->group(function () {

    
    // Referral routes
    Route::get('/referral', [ReferralController::class, 'index']);
    Route::post('/referral', [ReferralController::class, 'store']);
    Route::get('/referral/{id}', [ReferralController::class, 'show']);
    Route::put('/referral/{id}', [ReferralController::class, 'update']);
    Route::delete('/referral/{id}', [ReferralController::class, 'destroy']);
    Route::get('/referral-users', [ReferralController::class, 'getUsersList']);
});

Route::middleware('auth:sanctum')->group(function () {

    
    // Face to Face routes
    Route::get('/face-to-face', [FaceToFaceController::class, 'index']);
    Route::post('/face-to-face', [FaceToFaceController::class, 'store']);
    Route::get('/face-to-face/{id}', [FaceToFaceController::class, 'show']);
    Route::put('/face-to-face/{id}', [FaceToFaceController::class, 'update']);
    Route::delete('/face-to-face/{id}', [FaceToFaceController::class, 'destroy']);
    Route::get('/face-to-face-users', [FaceToFaceController::class, 'getUsersList']);
});

Route::middleware('auth:sanctum')->group(function () {

    
    // Report routes
    Route::get('/report', [ReportController::class, 'getReport']);
    Route::get('/report/export-pdf', [ReportController::class, 'exportPdf']);
    Route::get('/report/export-csv', [ReportController::class, 'exportCsv']);
    Route::get('/report/users-list', [ReportController::class, 'getUsersList']);
});