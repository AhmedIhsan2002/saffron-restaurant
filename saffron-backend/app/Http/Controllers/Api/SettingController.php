<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\JsonResponse;

class SettingController extends Controller
{
    /**
     * الإعدادات العامة المتاحة للزائر (بدون بيانات حساسة).
     */
    public function public(): JsonResponse
    {
        $keys = [
            'restaurant_name',
            'restaurant_tagline',
            'restaurant_address',
            'restaurant_phone',
            'currency',
            'currency_symbol',
            'tax_rate',
            'orders_open',
            'working_hours',
        ];

        $settings = [];

        foreach ($keys as $key) {
            $settings[$key] = Setting::get($key);
        }

        return response()->json([
            'data' => $settings,
        ]);
    }
}