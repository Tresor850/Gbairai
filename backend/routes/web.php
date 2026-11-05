<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json([
        'app' => 'Gbairai API',
        'status' => 'online',
        'message' => 'Backend API opérationnel 🚀',
        'timestamp' => now()->toIso8601String(),
    ]);
});
