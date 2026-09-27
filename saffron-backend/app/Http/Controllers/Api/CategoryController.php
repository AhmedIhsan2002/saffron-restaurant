<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\CategoryResource;
use App\Http\Resources\ProductResource;
use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class CategoryController extends Controller
{
    /**
     * عرض كل الفئات النشطة مرتبة.
     */
    public function index(): AnonymousResourceCollection
    {
        $categories = Category::query()
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->get();

        return CategoryResource::collection($categories);
    }

    /**
     * عرض منتجات فئة محددة.
     */
     public function products(string $slug): AnonymousResourceCollection|JsonResponse
    {
        $category = Category::query()
            ->where('slug', $slug)
            ->where('is_active', true)
            ->first();

        if (!$category) {
            return response()->json([
                'message' => 'الفئة غير موجودة',
            ], 404);
        }

        $products = $category->products()
            ->where('is_active', true)
            ->orderBy('is_featured', 'desc')
            ->orderBy('id', 'asc')
            ->get();

        return ProductResource::collection($products);
    }
}