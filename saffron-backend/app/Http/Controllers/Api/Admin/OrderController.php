<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateOrderStatusRequest;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    /**
     * قائمة الطلبات مع فلاتر.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Order::query()->with('items');

        // فلترة بالحالة
        if ($status = $request->query('status')) {
            if (in_array($status, Order::statuses(), true)) {
                $query->where('status', $status);
            }
        }

        // بحث بـ order_number أو table_number
        if ($search = trim((string) $request->query('search', ''))) {
            $query->where(function ($q) use ($search) {
                $q->where('order_number', 'like', "%{$search}%")
                  ->orWhere('table_number', 'like', "%{$search}%");
            });
        }

        // فلترة بالتاريخ (اختياري)
        if ($date = $request->query('date')) {
            $query->whereDate('created_at', $date);
        }

        $orders = $query
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json([
            'data' => OrderResource::collection($orders->items()),
            'meta' => [
                'current_page' => $orders->currentPage(),
                'last_page'    => $orders->lastPage(),
                'per_page'     => $orders->perPage(),
                'total'        => $orders->total(),
            ],
            'links' => [
                'next' => $orders->nextPageUrl(),
                'prev' => $orders->previousPageUrl(),
            ],
        ]);
    }

    /**
     * تفاصيل طلب.
     */
    public function show(int $id): OrderResource|JsonResponse
    {
        $order = Order::with('items')->find($id);

        if (!$order) {
            return response()->json([
                'message' => 'الطلب غير موجود',
            ], 404);
        }

        return new OrderResource($order);
    }

    /**
     * تغيير حالة طلب.
     */
    public function updateStatus(UpdateOrderStatusRequest $request, int $id): OrderResource|JsonResponse
    {
        $order = Order::find($id);

        if (!$order) {
            return response()->json([
                'message' => 'الطلب غير موجود',
            ], 404);
        }

        $order->status = $request->validated()['status'];
        $order->save();

        return new OrderResource($order->fresh('items'));
    }

    /**
     * إحصائيات سريعة (للـ dashboard).
     */
    public function stats(): JsonResponse
    {
        return response()->json([
            'data' => [
                'pending'   => Order::where('status', Order::STATUS_PENDING)->count(),
                'preparing' => Order::where('status', Order::STATUS_PREPARING)->count(),
                'served'    => Order::where('status', Order::STATUS_SERVED)->count(),
                'cancelled' => Order::where('status', Order::STATUS_CANCELLED)->count(),
                'today'     => Order::whereDate('created_at', today())->count(),
                'today_revenue' => Order::whereDate('created_at', today())
                    ->where('status', '!=', Order::STATUS_CANCELLED)
                    ->sum('total'),
            ],
        ]);
    }
}