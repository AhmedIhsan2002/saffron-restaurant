<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ProductController extends Controller
{
    /**
     * عرض المنتجات المميزة.
     */
    public function featured(): AnonymousResourceCollection
    {
        $products = Product::query()
            ->with('category')
            ->where('is_active', true)
            ->where('is_featured', true)
            ->orderBy('id', 'desc')
            ->limit(8)
            ->get();

        return ProductResource::collection($products);
    }

    /**
     * تفاصيل منتج واحد مع خياراته وقيمه.
     */
    public function show(int $id): ProductResource|JsonResponse
    {
        $product = Product::query()
            ->with(['category', 'options.values' => function ($query) {
                $query->orderBy('sort_order');
            }])
            ->where('is_active', true)
            ->find($id);

        if (!$product) {
            return response()->json([
                'message' => 'المنتج غير موجود',
            ], 404);
        }

        return new ProductResource($product);
    }

    /**
     * البحث في المنتجات.
     */
    public function search(Request $request): AnonymousResourceCollection|JsonResponse
    {
        $query = trim((string) $request->query('q', ''));

        if (mb_strlen($query) < 2) {
            return response()->json([
                'message' => 'يجب أن يحتوي البحث على حرفين على الأقل',
            ], 422);
        }

        $products = Product::query()
            ->with('category')
            ->where('is_active', true)
            ->where(function ($q) use ($query) {
                $q->where('name', 'like', "%{$query}%")
                  ->orWhere('description', 'like', "%{$query}%");
            })
            ->orderBy('id', 'desc')
            ->limit(20)
            ->get();

        return ProductResource::collection($products);
    }
}