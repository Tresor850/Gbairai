<?php

use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json([
        'app' => 'Gbairai API',
        'status' => 'online',
        'message' => 'Backend API opérationnel 🚀',
        'timestamp' => now()->toIso8601String(),
    ]);
});

// Route pratique pour exécuter les migrations & seeders sur le plan gratuit de Render (sans accès shell)
Route::get('/run-migrations-secret-789', function () {
    try {
        Artisan::call('migrate', ['--force' => true]);
        $migrateOutput = Artisan::output();

        Artisan::call('db:seed', ['--force' => true]);
        $seedOutput = Artisan::output();

        return response()->json([
            'status' => 'success',
            'message' => 'Migrations et données de test exécutées avec succès !',
            'migrate_output' => $migrateOutput,
            'seed_output' => $seedOutput,
        ]);
    } catch (\Throwable $e) {
        return response()->json([
            'status' => 'error',
            'error_message' => $e->getMessage(),
            'file' => $e->getFile(),
            'line' => $e->getLine(),
        ], 500);
    }
});
