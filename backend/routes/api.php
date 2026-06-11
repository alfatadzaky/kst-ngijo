<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ProductionDataController;
use App\Http\Controllers\Api\ResearchDataController;
use App\Http\Controllers\Api\SustainabilityDataController;
use App\Http\Controllers\Api\ValidationController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\PublicController;
use App\Http\Controllers\FacilityController;
use Illuminate\Support\Facades\Route;

// ==========================================
// PUBLIC ENDPOINTS (Gak Perlu Login)
// ==========================================
Route::prefix('external')->group(function () {
    Route::get('landing-page/info', [PublicController::class, 'getInfo']);
    Route::get('landing-page/stats', [PublicController::class, 'getStatistics']);
    Route::get('landing-page/research-highlights', [PublicController::class, 'getResearchHighlights']);
    Route::get('landing-page/tenants', [PublicController::class, 'getTenantSpotlight']);
    Route::get('landing-page/latest-activities', [PublicController::class, 'getLatestActivities']);
    
    //Public dashboard (public)
    Route::get('dashboard/overview', [DashboardController::class, 'publicOverview']);
    Route::get('dashboard/production', [DashboardController::class, 'publicProduction']);
    Route::get('dashboard/research', [DashboardController::class, 'publicResearch']);
    Route::get('dashboard/sustainability', [DashboardController::class, 'publicSustainability']);
    Route::get('dashboard/executive', [DashboardController::class, 'publicExecutive']);

    //Endpoint Fasilitas buat di Landing Page (Public)
    Route::get('/facilities', [FacilityController::class, 'index']);
    Route::get('/facilities/{id}', [FacilityController::class, 'show']);
});

// Authentication endpoints (public)
Route::prefix('auth')->group(function () {
    Route::post('signup', [AuthController::class, 'signup']);
    Route::post('login', [AuthController::class, 'login']);
    Route::post('logout', [AuthController::class, 'logout'])->middleware('auth:api');
    Route::post('refresh', [AuthController::class, 'refresh'])->middleware('auth:api');
    Route::get('me', [AuthController::class, 'me'])->middleware('auth:api');
});

// ==========================================
// PROTECTED API ENDPOINTS (Wajib Login)
// ==========================================
Route::middleware('auth:api')->group(function () {
    Route::prefix('internal')->group(function () {
        // Routes data produksi
        Route::get('production-data/my-submissions', [ProductionDataController::class, 'mySubmissions']);
        Route::apiResource('production-data', ProductionDataController::class);

        // Routes data penelitian
        Route::post('research-data/{id}/outputs', [ResearchDataController::class, 'addOutput']);
        Route::apiResource('research-data', ResearchDataController::class);

        // Chart data endpoint (harus di ATAS apiResource)
        Route::get('sustainability-data/chart-data', [SustainabilityDataController::class, 'chartData']);
        Route::apiResource('sustainability-data', SustainabilityDataController::class);

        // Routes data sustainability
        Route::apiResource('sustainability-data', SustainabilityDataController::class);
        

        // ==========================================
        // Admin Only (Fasilitas, Validasi, User)
        // ==========================================
        Route::middleware('role:admin')->group(function () {
            // CRUD Fasilitas KST Ngijo (Terproteksi & Konsisten pake prefix internal)
            Route::post('/facilities', [FacilityController::class, 'store']);
            Route::put('/facilities/{id}', [FacilityController::class, 'update']);
            Route::delete('/facilities/{id}', [FacilityController::class, 'destroy']);

            // Validasi & User management bawaan
            Route::get('validations/pending', [ValidationController::class, 'pending']);
            Route::patch('validations/{id}/approve', [ValidationController::class, 'approve']);
            Route::patch('validations/{id}/reject', [ValidationController::class, 'reject']);
            Route::apiResource('users', UserController::class);
        });

        // User directory — accessible semua role (bukan admin-only)
        Route::get('users/directory', [UserController::class, 'directory']);

        // Researchers directory — accessible semua role (untuk autocomplete)
        Route::get('researchers', [ResearchDataController::class, 'researchers']);

        // Notification routes
        Route::get('notifications', [NotificationController::class, 'index']);
        Route::get('notifications/unread-count', [NotificationController::class, 'unreadCount']);
        Route::patch('notifications/mark-all-read', [NotificationController::class, 'markAllAsRead']);
        Route::get('notifications/{id}', [NotificationController::class, 'show']);
        Route::patch('notifications/{id}/read', [NotificationController::class, 'markAsRead']);
    });
});