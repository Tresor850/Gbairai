<?php

use App\Http\Controllers\Api\CommentController;
use App\Http\Controllers\Api\GbairaiController;
use Illuminate\Support\Facades\Route;

Route::get('/ping', function () {
    return response()->json([
        'status' => 'ok',
        'app' => 'Gbairai API',
        'timestamp' => now()->toIso8601String(),
    ]);
});

// Gbairais resource routes
Route::prefix('gbairais')->group(function () {
    Route::get('/', [GbairaiController::class, 'index']);
    Route::post('/', [GbairaiController::class, 'store']);
    Route::get('/{gbairai}', [GbairaiController::class, 'show']);
    Route::delete('/{gbairai}', [GbairaiController::class, 'destroy']);

    // Interactions
    Route::post('/{gbairai}/like', [GbairaiController::class, 'toggleLike']);
    Route::post('/{gbairai}/report', [GbairaiController::class, 'report']);

    // Comments
    Route::get('/{gbairai}/comments', [CommentController::class, 'index']);
    Route::post('/{gbairai}/comments', [CommentController::class, 'store']);
});
