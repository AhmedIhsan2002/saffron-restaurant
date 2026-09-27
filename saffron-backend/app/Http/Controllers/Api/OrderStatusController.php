<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use Illuminate\Http\JsonResponse;

class OrderStatusController extends Controller
{
    /**
     * عرض حالة طلب معيّن برقم الطلب.
     */
    public function show(string $publicToken): OrderResource|JsonResponse
    {
        $order = Order::query()
            ->with('items')
            ->where('public_token', $publicToken)
            ->first();

        if (!$order) {
            return response()->json([
                'message' => 'الطلب غير موجود',
            ], 404);
        }

        return new OrderResource($order);
    }
}
