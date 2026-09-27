<?php

use App\Http\Controllers\Api\Admin\AuthController as AdminAuthController;
use App\Http\Controllers\Api\Admin\CategoryController as AdminCategoryController;
use App\Http\Controllers\Api\Admin\OrderController as AdminOrderController;
use App\Http\Controllers\Api\Admin\ProductController as AdminProductController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\OrderStatusController;
use App\Http\Controllers\Api\Admin\SettingController as AdminSettingController;
use App\Http\Controllers\Api\Admin\UploadController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\SettingController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Public API (لا يحتاج تسجيل دخول)
|--------------------------------------------------------------------------
*/

Route::prefix('categories')->group(function () {
    Route::get('/', [CategoryController::class, 'index']);
    Route::get('/{slug}/products', [CategoryController::class, 'products']);
});

Route::prefix('products')->group(function () {
    Route::get('/featured', [ProductController::class, 'featured']);
    Route::get('/search', [ProductController::class, 'search']);
    Route::get('/{id}', [ProductController::class, 'show'])->whereNumber('id');
});

Route::post('/orders', [OrderController::class, 'store'])->middleware('throttle:30,1');

Route::get('/order-status/{public_token}', [OrderStatusController::class, 'show']);

Route::get('/settings/public', [SettingController::class, 'public']);

/*
|--------------------------------------------------------------------------
| Admin API (يحتاج تسجيل دخول)
|--------------------------------------------------------------------------
*/

Route::prefix('admin')->group(function () {

    // عام — بلا حماية
    Route::post('/login', [AdminAuthController::class, 'login'])->middleware('throttle:5,1');

    // كل ما يلي محمي
    Route::middleware(['auth:sanctum', 'admin'])->group(function () {

        // Auth
        Route::get('/me',     [AdminAuthController::class, 'me']);
        Route::post('/logout', [AdminAuthController::class, 'logout']);
        Route::post('/uploads/image', [UploadController::class, 'image']);

        // Orders
        Route::prefix('orders')->group(function () {
            Route::get('/', [AdminOrderController::class, 'index']);
            Route::get('/stats', [AdminOrderController::class, 'stats']);
            Route::get('/{id}', [AdminOrderController::class, 'show'])->whereNumber('id');
            Route::patch('/{id}/status', [AdminOrderController::class, 'updateStatus'])->whereNumber('id');
        });

        // Categories
        Route::prefix('categories')->group(function () {
            Route::get('/', [AdminCategoryController::class, 'index']);
            Route::post('/', [AdminCategoryController::class, 'store']);
            Route::get('/{id}', [AdminCategoryController::class, 'show'])->whereNumber('id');
            Route::patch('/{id}', [AdminCategoryController::class, 'update'])->whereNumber('id');
            Route::delete('/{id}', [AdminCategoryController::class, 'destroy'])->whereNumber('id');
        });

      Route::prefix('products')->group(function () {
    Route::get('/', [AdminProductController::class, 'index']);
    Route::post('/', [AdminProductController::class, 'store']);       // ← جديد
    Route::get('/{id}', [AdminProductController::class, 'show'])->whereNumber('id');
    Route::patch('/{id}', [AdminProductController::class, 'update'])->whereNumber('id');  // ← جديد
    Route::delete('/{id}', [AdminProductController::class, 'destroy'])->whereNumber('id');
});

    // Settings
Route::prefix('settings')->group(function () {
    Route::get('/', [AdminSettingController::class, 'index']);
    Route::patch('/', [AdminSettingController::class, 'update']);
});

    }); // ← لا تغلق القوس قبل كل شيء

});
