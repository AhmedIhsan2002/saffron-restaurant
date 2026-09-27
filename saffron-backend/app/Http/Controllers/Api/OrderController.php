<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreOrderRequest;
use App\Http\Resources\OrderResource;
use App\Services\OrderService;
use Illuminate\Http\JsonResponse;

class OrderController extends Controller
{
    public function __construct(
        private readonly OrderService $orderService,
    ) {}

    /**
     * إنشاء طلب جديد.
     */
    public function store(StoreOrderRequest $request): JsonResponse
    {
        $order = $this->orderService->create($request->validated());

        return response()->json([
            'success'      => true,
            'order_number' => $order->order_number,
            'public_token' => $order->public_token,
            'status'       => $order->status,
            'total'        => $order->total,
            'order'        => new OrderResource($order),
        ], 201);
    }
}
