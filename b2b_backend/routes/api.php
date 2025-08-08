<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserLoginRegister;
use App\Http\Controllers\User\UserDetailsController;

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